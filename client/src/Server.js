const express = require("express");
const webpush = require("web-push");
//const bodyParser = require('body-parser');
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// ./node_modules/.bin/web-push generate-vapid-keys
const pubKey =
  "BChZg2Ky1uKIDRdYWapWKZXZ19VvFedmK0bjqir9kMsyUK42cguvoAr4Pau4yQr2aY4IWGIsr3W1lWK5okZ6O84";
const privKey = "CvQGYBs-AzSHF55J7mqTR8VE7l-qwiBiSslqeaMfx8o";
webpush.setVapidDetails("mailto:web-push@volatalk.org", pubKey, privKey);

app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  res.status(201).json({});
  const payload = JSON.stringify({ title: "Push Subscribed!!!" });
  webpush.sendNotification(subscription, payload).catch((error) => {
    console.error(error);
  });
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
