const { PeerServer } = require("peer");

const fs = require("fs");

const PEER_KEY = "volakey";
const PORT_HTTPS = 999;
const CN = "peer.pm";

const KEY_FILENAME = "./crt/" + CN + ".key";
const CERT_FILENAME = "./crt/" + CN + ".crt";

const KEY_FILE = fs.readFileSync(KEY_FILENAME);
const CERT_FILE = fs.readFileSync(CERT_FILENAME);

const HTTPS_OPTIONS = {
  key: KEY_FILE,
  cert: CERT_FILE,
};

PeerServer({
  key: PEER_KEY,
  port: PORT_HTTPS,
  ssl: HTTPS_OPTIONS,
});

function ENV_VAR(varName, defaults) {
  let val = process.env[varName];
  console.log(
    varName + (!val ? " [UNDEFINED]. Using default: " + defaults : ": " + val)
  );
  return val || defaults;
}
