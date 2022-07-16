import compression from "compression";
import express from "express";
import { ENV_VAR, ENV_VARB, ENV_VARN } from "./Generic";
import { VolaTALK } from "./Server";
import spdy from "spdy";
import { HTTPS_OPTIONS, HTTPS_PORT } from "./HTTPS_OPTIONS";
import { ExpressPeerServer } from "peer";
import { peerIdToPublicKey, verifyMessage } from "./CryptoService";

const app = express();
app.use(express.json());
const server = spdy.createServer(HTTPS_OPTIONS, app);

// app.get("*", (req, res) => {
//   res.status(200).json({ message: "ok" });
// });

app.disable("x-powered-by");
app.use(compression());

doPeerServer();

server.listen(HTTPS_PORT);

//new VolaTALK();
//console.log(`Server is listening on port ${PORT}`);

/**
 *
 */
function doPeerServer() {
  const PEERJS_CONTEXT = ENV_VAR("PEER_CONTEXT", "/vtpeer");
  const PEERJS_KEY = ENV_VAR("PEERJS_KEY", "pmkey");
  //serve peerjs
  const PEERJS_OPTIONS = {
    port: HTTPS_PORT,
   // path: PEERJS_CONTEXT,
    key: PEERJS_KEY,
    debug: true,
    ssl: HTTPS_OPTIONS,
  };

  const peerServer = ExpressPeerServer(server, PEERJS_OPTIONS);
  console.info("Starting peerserver with options", PEERJS_OPTIONS);
  app.use(peerServer);

  ENV_VARB("DO_PEERJS_SECURE") && doPeerSecure(peerServer, PEERJS_CONTEXT);
}
/**
 *
 * @param peerServer
 */
function doPeerSecure(peerServer: any, context: string) {
  console.info("Making peerServer secure" + peerServer);
  peerServer.on("connection", (client: any) => {
    console.log("Client connecting", client);
    const peerid = client.getId();
    console.info("client id/token", peerid);

    !isTokenValid(context, client.token, peerid) && client.getSocket().close();
  });
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

  return (
    pubKey && verifyMessage(context, new TextEncoder().encode(token), pubKey)
  );
}
