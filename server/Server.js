const https = require("https");
const express = require("express");
const { ExpressPeerServer } = require("peer");
const webpush = require("web-push");
const path = require("path");
const fs = require("fs");
const os = require("os");

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

const PEERJS_CONTEXT = ENV_VAR("PEER_CONTEXT", "/peerjs");
const PEERJS_KEY = ENV_VAR("PEERJS_KEY", "pmkey");

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

const KEY_FILE = fs.readFileSync(path.join(__dirname, KEY_FILENAME));
const CERT_FILE = fs.readFileSync(path.join(__dirname, CERT_FILENAME));

const HTTPS_OPTIONS = {
  key: KEY_FILE,
  cert: CERT_FILE,
};

//express server
const app = express();

//serve static
app.use(express.static(path.join(__dirname, DIR_PUB_STATIC)));
const server = https.createServer(HTTPS_OPTIONS, app);
server.listen(PORT_HTTPS);
console.info("HTTPS started on port: " + PORT_HTTPS);

//serve peerjs
const PEERJS_OPTIONS = {
  port: PORT_HTTPS,
  path: "/",
  key: PEERJS_KEY,
  debug: DEBUG,
  ssl: {
    key: KEY_FILE,
    cert: CERT_FILE,
  },
};

const peerServer = ExpressPeerServer(server, PEERJS_OPTIONS);
app.use(PEERJS_CONTEXT, peerServer);

//serve web-push
app.use(express.json());

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBKEY, VAPID_PRIVKEY);

app.post(WEBPUSH_CONTEXT, (req, res) => {
  const subscription = req.body;
  const payload = JSON.stringify({ title: "Push Subscribed!!!" });
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

function ENV_VAR(varName, defaults) {
  let val = process.env[varName];
  console.log(
    varName + (!val ? " [UNDEFINED]. Using default: " + defaults : ": " + val)
  );
  return val || defaults;
}
