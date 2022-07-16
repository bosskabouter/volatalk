/**
 * First attempt to convert to ts server. Not working yet.
 */
import express from "express";
import spdy from "spdy";

import https from "https";
import path from "path";



import webpush, { generateVAPIDKeys } from "web-push";


import { ExpressPeerServer } from "peer";
import compression from "compression";
import cors from "cors";

import { peerIdToPublicKey, verifyMessage } from "./CryptoService";
import { ENV_VAR, ENV_VARB } from "./Generic";
import { HTTPS_OPTIONS, HTTPS_PORT as HTTPS_PORT } from "./HTTPS_OPTIONS";

export class VolaTALK {
  public app;

  DEBUG = ENV_VARB("DEBUG");


  server;
  /**
   * 
   */
  constructor() {
    this.app = express();
    this.server = spdy.createServer(HTTPS_OPTIONS, express);

    this.mountRoutes();

    this.doAlways();
    this.server.listen(HTTPS_PORT);

  }

  /**
   * 
   */
  private mountRoutes(): void {
    const router = express.Router();
    router.get("/", (_req, res) => {
      res.json({ message: "Hello world!" });
    });
    this.app.use("/", router);
  }

  private doAlways() {
    //SSL KEYS

    // compress all responses
    // https://webhint.io/docs/user-guide/hints/hint-http-compression/
    this.app.use(compression());

    ENV_VARB("DO_STATIC") && this.doStatic();
    ENV_VARB("DO_CORS") && this.doCors();
    ENV_VARB("DO_PEERJS") && this.doPeerServer();

    ENV_VARB("DO_WEBPUSH") && this.doPushServer();
    ENV_VARB("DO_SOCKETIO") && this.doSocketIO(); 
 
 
    //this.server.listen(HTTPS_PORT);
    console.info("HTTPS started on port: " + HTTPS_PORT);


  }
  private doStatic() {
    const DIR_PUB_STATIC = ENV_VAR("DIR_PUB_STATIC", "public");
    //serve static
    this.app.use(express.static(path.join(__dirname, DIR_PUB_STATIC)));

    // https://webhint.io/docs/user-guide/hints/hint-no-disallowed-headers/?source=devtools
  }
  private doCors() {
    console.log("Using cors", cors);
    this.app.use(cors());
  }

  /**
   *
   */
  private doPeerServer() {
    const PEERJS_CONTEXT = ENV_VAR("PEER_CONTEXT", "/vtpeer");
    const PEERJS_KEY = ENV_VAR("PEERJS_KEY", "pmkey");
    //serve peerjs
    const PEERJS_OPTIONS = {
      port: HTTPS_PORT,
      path: PEERJS_CONTEXT,
      key: PEERJS_KEY,
      debug: this.DEBUG,
      ssl: HTTPS_OPTIONS
    };

    const peerServer = ExpressPeerServer(this.server, PEERJS_OPTIONS);
    console.info("Starting peerserver with options", PEERJS_OPTIONS);
    this.app.use(PEERJS_CONTEXT, peerServer);

    ENV_VARB("DO_PEERJS_SECURE") &&
      this.doPeerSecure(peerServer, PEERJS_CONTEXT);



  }
  /**
   *
   * @param peerServer
   */
  private doPeerSecure(peerServer: any, context: string) {
    console.info("Making peerServer secure" + peerServer);
    peerServer.on("connection", (client: any) => {
      console.log("Client connecting", client);
      const peerid = client.getId();
      console.info("client id/token", peerid);

      !isTokenValid(context, client.token, peerid) &&
        client.getSocket().close();
    });
  }

  /**
   *
   */
  private doPushServer() {
    const HTTP_ERROR_Insufficient_Storage_Push_tooBig = 507;
    const HTTP_ERROR_PUSH_SERVICE_ERROR_Bad_Gateway = 502;

    const PUSH_MAX_BYTES = 4 * 1024;

    const WEBPUSH_CONTEXT: string = ENV_VAR("WEBPUSH_CONTEXT", "/web-push");

    const VAPID_SUBJECT = ENV_VAR("VAPID_SUBJECT", "mailto:push@volatalk.org");
    //WEB-PUSH VAPID KEYS; generate USING ./node_modules/.bin/web-push generate-vapid-keys
    const VAPID_PUBKEY = ENV_VAR(
      "VAPID_PUBKEY",
      "BChZg2Ky1uKIDRdYWapWKZXZ19VvFedmK0bjqir9kMsyUK42cguvoAr4Pau4yQr2aY4IWGIsr3W1lWK5okZ6O84"
    );
    const VAPID_PRIVKEY = ENV_VAR(
      "VAPID_PRIVKEY",
      "CvQGYBs-AzSHF55J7mqTR8VE7l-qwiBiSslqeaMfx8o"
    );

    this.app.use(express.json());

    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBKEY, VAPID_PRIVKEY);

    //Blob needed to measure request size
    const { Blob } = require("buffer");

    /**
     * Generate a VAPID key for requester
     */
    this.app.get(WEBPUSH_CONTEXT, (request, response) => {
      //TODO Validate token in request
      const VAPIDKeys = generateVAPIDKeys();
      console.info("QueryParams", request.query);

      response.write(JSON.stringify(VAPIDKeys));
    });

    /**
     * Respond to Push Posts
     */
    this.app.post(WEBPUSH_CONTEXT, (request, response) => {
      if (this.DEBUG) console.log("Push request", request);

      const body = request.body;

      const peerid = body.peerid;
      const token = body.token;

      if (!isTokenValid(WEBPUSH_CONTEXT, token, peerid)) {
        console.warn("Token Invalid: not pushing", request);
      }
      const subscription = body.subscription;
      const payload = body.payload;

      const byteSizeHeader = Number(request.header("content-length"));
      const byteSizePayload = new Blob([payload]).size;
      console.info(
        `Push request size - header[payload]: ${byteSizeHeader}[${byteSizePayload}]`
      );
      if (byteSizeHeader >= PUSH_MAX_BYTES) {
        console.warn(
          "Message too big. Have to refuse push.",
          byteSizeHeader + "kb"
        );
        response.sendStatus(HTTP_ERROR_Insufficient_Storage_Push_tooBig);
        return;
      }

      if (this.DEBUG)
        console.debug("Pushing payload to subscription", payload, subscription);

      webpush
        .sendNotification(subscription, payload)
        .then((sendResult: any) => {
          console.log("Pushed message: result=>", sendResult);
          response.write(JSON.stringify(sendResult));
        })
        .catch((err: any) => {
          console.error("Problem pushing", err);
          response.statusCode = HTTP_ERROR_PUSH_SERVICE_ERROR_Bad_Gateway;
          response.write(JSON.stringify(err));
        });
    });
  }

  private doSocketIO() {
    const io = require("socket.io")(this.server, {
      cors: {
        origin: "*",
      },
    });
    // When someone connects to the server
    io.on("connection", (socket: any) => {
      // When someone attempts to join the room
      socket.on("join-room", (roomId: string, userId: string) => {
        // Tell everyone else in the room that we joined

        // Communicate the disconnection
        socket.on("disconnect", () => {
          socket.broadcast.emit("user-disconnected", userId);
        });

        socket.broadcast.emit("user-connected", userId);

        socket.join(roomId); // Join the room

        console.log(`user ${userId} joins room ${roomId}`);
      });
    });
  }
}


/**
 *
 * @param context
 * @param token
 * @param peerid
 * @returns
 */
async function isTokenValid(context: string, token: string, peerid: string) {
  console.info("Verify domain/token/peerid", context, token, peerid);

  const pubKey = await peerIdToPublicKey(peerid);
  console.info("pubkey", pubKey);

  return pubKey && verifyMessage(context, new TextEncoder().encode(token), pubKey);
}

