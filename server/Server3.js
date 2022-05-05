const compression = require("compression");
const https = require("https");

const webpush = require("web-push");
const path = require("path");

const fs = require("fs");
const os = require("os");

const express = require("express");

const app = express();

const spdy = require("spdy");

const DO_CORS = true;
const DO_EJS = false;
const DO_PEERJS = true;

const DO_WEBPUSH = false;
const DO_SOCKETIO = true;

//CONFIG ENVIRONMENT VARIABLE PARAMS
const DEBUG = ENV_VAR("DEBUG", true);
//HTTPS REQUIRED
const PORT_HTTPS = ENV_VAR("PORT_HTTPS", 8443);
//SSL KEYS
const HOSTNAME = os.hostname();

const KEY_FILENAME = ENV_VAR("KEY_FILE", "./crt/" + HOSTNAME + ".key");
const CERT_FILENAME = ENV_VAR("CERT_FILE", "./crt/" + HOSTNAME + ".crt");

//local directorty with static files to be served
const DIR_PUB_STATIC = ENV_VAR("DIR_PUB_STATIC", "www");

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

//serve static
app.use(express.static(path.join(__dirname, DIR_PUB_STATIC)));

if (DO_CORS) {
  var cors = require("cors");
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
  app.use(PEERJS_CONTEXT, peerServer);
}

if (DO_WEBPUSH) {
  //SUBSCRIPTION SERVICE
  const WEBPUSH_CONTEXT = ENV_VAR("WEBPUSH_CONTEXT", "/subscribe");
  //WEB-PUSH VAPID KEYS; generate USING ./node_modules/.bin/web-push generate-vapid-keys
  const VAPID_SUBJECT = ENV_VAR(
    "VAPID_SUBJECT",
    "mailto:subscription@volatalk.org"
  );
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

  app.post(WEBPUSH_CONTEXT, (req, res) => {
    const subscription = req.body;

    //pass on complete request to receiver?? :)
    const payload = JSON.stringify(req);
    webpush
      .sendNotification(subscription, payload)
      .then(() => {
        res.status(201).json({});
      })
      .catch((err) => {
        console.warn("Invalid subscription request: " + err, req, err);
        res.status(418).json({});
      });
  });
}

if (DO_EJS) {
  //local directorty with static files to be served
  const DIR_RENDER_EJS = ENV_VAR("DIR_RENDER_EJS", "views");

  // If they join a specific room, then render that room

  app.set("views", path.join(__dirname, DIR_RENDER_EJS));
  app.set("view engine", "ejs"); // Tell Express we are using EJS

  app.get("/room/:room", (req, res) => {
    console.log("Request from: " + req);
    res.render("room", { roomId: req.params.room });
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
  console.log(
    varName + (!val ? " [UNDEFINED]. Using default: " + defaults : ": " + val)
  );
  return val || defaults;
}