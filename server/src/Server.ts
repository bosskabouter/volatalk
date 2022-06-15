/**
 * First attempt to convert to ts server. Not working yet.
 */
import express from "express";
import spdy from "spdy";

import https from "https";

import webpush from "web-push";
import path from "path";

import fs from "fs";
import os from "os";
import Socket from "socket.io";
import { ExpressPeerServer } from "peer";
import compression from "compression";
import cors from "cors";

import io from "socket.io";

class App {
  public express;

  DEBUG = ENV_VARB("DEBUG");

  //HTTPS REQUIRED
  PORT_HTTPS = ENV_VARN("PORT_HTTPS", 8443);

  HOSTNAME = os.hostname();

  KEY_FILENAME = ENV_VAR("KEY_FILE", "../crt/" + this.HOSTNAME + ".key");
  CERT_FILENAME = ENV_VAR("CERT_FILE", "../crt/" + this.HOSTNAME + ".crt");

  KEY_FILE = fs.readFileSync(path.join(__dirname, this.KEY_FILENAME), "utf8");
  CERT_FILE = fs.readFileSync(path.join(__dirname, this.CERT_FILENAME), "utf8");

  HTTPS_OPTIONS = {
    key: this.KEY_FILE,
    cert: this.CERT_FILE,
  };
  server = spdy.createServer(this.HTTPS_OPTIONS, express);
  constructor() {
    this.express = express();
    this.mountRoutes();

    this.doAlways();
  }
  private mountRoutes(): void {
    const router = express.Router();
    router.get("/", (_req, res) => {
      res.json({ message: "Go away, world!" });
    });
    this.express.use("/", router);
  }

  private doAlways() {
    //SSL KEYS

    this.server.listen(this.PORT_HTTPS);
    console.info("HTTPS started on port: " + this.PORT_HTTPS);

    // compress all responses
    // https://webhint.io/docs/user-guide/hints/hint-http-compression/
    this.express.use(compression());

    ENV_VARB("DO_STATIC") && this.doStatic();
    ENV_VARB("DO_CORS") && this.doCors();
    ENV_VARB("DO_PEERJS") && this.doPeerServer();

    ENV_VARB("DO_WEBPUSH") && this.doPushServer();
    ENV_VARB("DO_SOCKETIO") && this.doSocketIO();
  }
  private doStatic() {
    const DIR_PUB_STATIC = ENV_VAR("DIR_PUB_STATIC", "public");
    //serve static
    this.express.use(express.static(path.join(__dirname, DIR_PUB_STATIC)));

    // https://webhint.io/docs/user-guide/hints/hint-no-disallowed-headers/?source=devtools
  }
  private doCors() {
    console.log("Using cors", cors);
    this.express.use(cors());
  }

  /**
   *
   */
  private doPeerServer() {
    const PEERJS_CONTEXT = ENV_VAR("PEER_CONTEXT", "/vtpeer");
    const PEERJS_KEY = ENV_VAR("PEERJS_KEY", "pmkey");
    //serve peerjs
    const PEERJS_OPTIONS = {
      port: this.PORT_HTTPS,
      path: PEERJS_CONTEXT,
      key: PEERJS_KEY,
      debug: this.DEBUG,
      ssl: {
        key: this.KEY_FILE,
        cert: this.CERT_FILE,
      },
    };

    const peerServer = ExpressPeerServer(this.server, PEERJS_OPTIONS);
    console.info("Starting peerserver with options", PEERJS_OPTIONS);
    this.express.use(PEERJS_CONTEXT, peerServer);

    ENV_VARB("DO_PEERJS_SECURE") && this.doPeerSecure(peerServer);
  }
  /**
   *
   * @param peerServer
   */
  private doPeerSecure(peerServer: any) {
    //console.info("Making peerServer secure", peerServer);
    peerServer.on("connection", (client: any) => {
      console.log("Client connecting", client);
      const peerid = client.getId();
      console.info("client id/token", peerid);
      //verify

      const fishy = false;

      if (fishy) client.getSocket().close();
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

    this.express.use(express.json());

    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBKEY, VAPID_PRIVKEY);

    //Blob needed to measure request size
    const { Blob } = require("buffer");

    this.express.post(WEBPUSH_CONTEXT, (request, response) => {
      if (this.DEBUG) console.log("Push request", request);

      const body = request.body;
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

export default new App().express;
function ENV_VARN(varName: string, defaults: number): number {
  return Number(ENV_VAR(varName, "" + defaults));
}
function ENV_VARB(varName: string): boolean {
  return ENV_VAR(varName, "true") === "true";
}
function ENV_VAR(varName: string, defaults: string): string {
  let val = process.env[varName];
  val = val?.trim();

  console.log(
    varName + (!val ? " [UNDEFINED] Using default: " + defaults : ": " + val)
  );

  return val?.trim() || defaults;
}

function peerIdToPublicKey(peerid: string) {
  const cryptoKey = JSON.parse(convertHexToString(peerid));
  console.debug("Converted PeerID->PublicKey", cryptoKey, peerid);
  return cryptoKey;
}
function convertHexToString(hex: string) {
  return hex
    .split(/(\w\w)/g)
    .filter((p) => !!p)
    .map((c) => String.fromCharCode(parseInt(c, 16)))
    .join("");
}
