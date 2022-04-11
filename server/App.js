const express = require("express");
const { ExpressPeerServer } = require("peer");
const webpush = require("web-push");

const path = require("path");

const port = 5000;

const app = express();
const server = app.listen(port);

const peerServer = ExpressPeerServer(server, {
  path: "/",
});

app.use(express.static(path.join(__dirname, "www")));
app.use("/peerjs", peerServer);

app.use(express.json());
// ./node_modules/.bin/web-push generate-vapid-keys
const pubKey =
  "BChZg2Ky1uKIDRdYWapWKZXZ19VvFedmK0bjqir9kMsyUK42cguvoAr4Pau4yQr2aY4IWGIsr3W1lWK5okZ6O84";
const privKey = "CvQGYBs-AzSHF55J7mqTR8VE7l-qwiBiSslqeaMfx8o";

webpush.setVapidDetails("mailto:sender@volatalk.org", pubKey, privKey);
app.post("/subscribe", (req, res) => {
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
