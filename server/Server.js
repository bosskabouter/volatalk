const compression = require("compression");
const https = require("https");

const webpush = require("web-push");
const path = require("path");

const fs = require("fs");
const os = require("os");

const express = require("express");

const app = express();

const spdy = require("spdy");

const DO_STATIC = ENV_VAR("DO_STATIC", false);
const DO_CORS = ENV_VAR("DO_CORS", false);
const DO_EJS = ENV_VAR("DO_EJS", false);
const DO_PEERJS = ENV_VAR("DO_PEERJS", false);
const DO_PEERJS_SECURE = ENV_VAR("DO_PEERJS_SECURE", false);

const DO_WEBPUSH = ENV_VAR("DO_WEBPUSH", false);
const DO_SOCKETIO = ENV_VAR("DO_SOCKETIO", false);

const DEBUG = ENV_VAR("DEBUG", false);

//HTTPS REQUIRED
const PORT_HTTPS = ENV_VAR("PORT_HTTPS", 8443);
//SSL KEYS
const HOSTNAME = os.hostname();

const KEY_FILENAME = ENV_VAR("KEY_FILE", "./crt/" + HOSTNAME + ".key");
const CERT_FILENAME = ENV_VAR("CERT_FILE", "./crt/" + HOSTNAME + ".crt");

const KEY_FILE = fs.readFileSync(path.join(__dirname, KEY_FILENAME));
const CERT_FILE = fs.readFileSync(path.join(__dirname, CERT_FILENAME));

const HTTPS_OPTIONS = {
  key: KEY_FILE,
  cert: CERT_FILE,
};

// https://webhint.io/docs/user-guide/hints/hint-no-disallowed-headers/?source=devtools
app.disable("x-powered-by");

// compress all responses
// https://webhint.io/docs/user-guide/hints/hint-http-compression/
app.use(compression());

if (DO_STATIC) {
  //local directorty with static files to be served
  const DIR_PUB_STATIC = ENV_VAR("DIR_PUB_STATIC", "public");
  //serve static
  app.use(express.static(path.join(__dirname, DIR_PUB_STATIC)));
}

if (DO_CORS) {
  var cors = require("cors");
  console.log("Using cors", cors);
  app.use(cors());
}

const server = spdy.createServer(HTTPS_OPTIONS, app);
server.listen(PORT_HTTPS);
console.info("HTTPS started on port: " + PORT_HTTPS);

if (DO_PEERJS) {
  const { ExpressPeerServer } = require("peer");
  const PEERJS_CONTEXT = ENV_VAR("PEER_CONTEXT", "/vtpeer");
  const PEERJS_KEY = ENV_VAR("PEERJS_KEY", "pmkey");
  //serve peerjs
  const PEERJS_OPTIONS = {
    port: PORT_HTTPS,
    path: PEERJS_CONTEXT,
    key: PEERJS_KEY,
    debug: DEBUG,
    ssl: {
      key: KEY_FILE,
      cert: CERT_FILE,
    },
  };

  const peerServer = ExpressPeerServer(server, PEERJS_OPTIONS);
  console.info("Starting peerserver with options", PEERJS_OPTIONS);
  app.use(PEERJS_CONTEXT, peerServer);

  if (DO_PEERJS_SECURE) {
    makePeerSecure(peerServer);
  }
}

if (DO_WEBPUSH) {
  const HTTP_ERROR_Insufficient_Storage_Push_tooBig = 507;
  const HTTP_ERROR_PUSH_SERVICE_ERROR_Bad_Gateway = 502;

  const PUSH_MAX_BYTES = 4 * 1024;

  const WEBPUSH_CONTEXT = ENV_VAR("WEBPUSH_CONTEXT", "/web-push");

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

  app.use(express.json());

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBKEY, VAPID_PRIVKEY);

  //Blob needed to measure request size
  // const { Blob } = require("buffer");

  app.post(WEBPUSH_CONTEXT, (request, response) => {
    if (DEBUG) console.log("Push request", request);

    const body = request.body;
    const subscription = body.subscription;
    const payload = body.payload;

    const byteSizeHeader = Number(request.header("content-length"));
    console.info(`Push request size - header[payload]: ` + byteSizeHeader);
    if (byteSizeHeader >= PUSH_MAX_BYTES) {
      console.warn(
        "Message too big. Have to refuse push.",
        byteSizeHeader + "kb"
      );
      response.sendStatus(HTTP_ERROR_Insufficient_Storage_Push_tooBig);
      return;
    }

    if (DEBUG)
      console.debug("Pushing payload to subscription", payload, subscription);

    webpush
      .sendNotification(subscription, payload)
      .then((sendResult) => {
        console.log("Pushed message: result=>", sendResult);
        response.write(JSON.stringify(sendResult));
      })
      .catch((err) => {
        console.error("Problem pushing", err);
        response.statusCode = HTTP_ERROR_PUSH_SERVICE_ERROR_Bad_Gateway;
        response.write(JSON.stringify(err));
      });
  });
}

if (DO_EJS) {
  //local directorty with static files to be served
  const DIR_RENDER_EJS = ENV_VAR("DIR_RENDER_EJS", "views");

  // If they join a specific room, then render that room

  app.set("views", path.join(__dirname, DIR_RENDER_EJS));
  app.set("view engine", "ejs"); // Tell Express we are using EJS

  app.get("/room/:room", (request, response) => {
    console.log("Request from: " + request);
    response.render("room", { roomId: req.params.room });
  });
}

if (DO_SOCKETIO) {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });
  // When someone connects to the server
  io.on("connection", (socket) => {
    // When someone attempts to join the room
    socket.on("join-room", (roomId, userId) => {
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
function ENV_VAR(varName, defaults) {
  let val = process.env[varName];
  val = val?.trim();

  console.log(
    varName + (!val ? " [UNDEFINED] Using default: " + defaults : ": " + val)
  );

  if (val === "true") return true;
  if (val === "false") return false;
  else return val?.trim() || defaults;
}

function makePeerSecure(peerServer) {
  console.info("Making peerServer secure", peerServer);
  peerServer.on("connection", (client) => {
    console.log("Client connecting", client);
    const peerid = client.getId();
    const token = client.getToken();
    console.info("client id/token", peerid, token);
    //TODO verify if user is fishy

    const fishy = false;

    if (fishy) client.getSocket().close();
  });
}
