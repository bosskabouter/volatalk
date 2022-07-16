"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compression_1 = __importDefault(require("compression"));
const express_1 = __importDefault(require("express"));
const Generic_1 = require("./Generic");
const spdy_1 = __importDefault(require("spdy"));
const HTTPS_OPTIONS_1 = require("./HTTPS_OPTIONS");
const peer_1 = require("peer");
const CryptoService_1 = require("./CryptoService");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const server = spdy_1.default.createServer(HTTPS_OPTIONS_1.HTTPS_OPTIONS, app);
// app.get("*", (req, res) => {
//   res.status(200).json({ message: "ok" });
// });
app.disable("x-powered-by");
app.use((0, compression_1.default)());
doPeerServer();
server.listen(HTTPS_OPTIONS_1.HTTPS_PORT);
//new VolaTALK();
//console.log(`Server is listening on port ${PORT}`);
/**
 *
 */
function doPeerServer() {
    const PEERJS_CONTEXT = (0, Generic_1.ENV_VAR)("PEER_CONTEXT", "/vtpeer");
    const PEERJS_KEY = (0, Generic_1.ENV_VAR)("PEERJS_KEY", "pmkey");
    //serve peerjs
    const PEERJS_OPTIONS = {
        port: HTTPS_OPTIONS_1.HTTPS_PORT,
        // path: PEERJS_CONTEXT,
        key: PEERJS_KEY,
        debug: true,
        ssl: HTTPS_OPTIONS_1.HTTPS_OPTIONS,
    };
    const peerServer = (0, peer_1.ExpressPeerServer)(server, PEERJS_OPTIONS);
    console.info("Starting peerserver with options", PEERJS_OPTIONS);
    app.use(peerServer);
    (0, Generic_1.ENV_VARB)("DO_PEERJS_SECURE") && doPeerSecure(peerServer, PEERJS_CONTEXT);
}
/**
 *
 * @param peerServer
 */
function doPeerSecure(peerServer, context) {
    console.info("Making peerServer secure" + peerServer);
    peerServer.on("connection", (client) => {
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
function isTokenValid(context, token, peerid) {
    return __awaiter(this, void 0, void 0, function* () {
        console.info("Verify domain/token/peerid", context, token, peerid);
        const pubKey = yield (0, CryptoService_1.peerIdToPublicKey)(peerid);
        console.info("pubkey", pubKey);
        return (pubKey && (0, CryptoService_1.verifyMessage)(context, new TextEncoder().encode(token), pubKey));
    });
}
//# sourceMappingURL=index.js.map