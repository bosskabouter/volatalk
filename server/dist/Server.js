"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * First attempt to convert to ts server. Not working yet.
 */
const express_1 = __importDefault(require("express"));
const spdy_1 = __importDefault(require("spdy"));
const web_push_1 = __importDefault(require("web-push"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const peer_1 = require("peer");
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
class App {
    constructor() {
        this.DEBUG = ENV_VARB("DEBUG");
        //HTTPS REQUIRED
        this.PORT_HTTPS = ENV_VARN("PORT_HTTPS", 8443);
        this.HOSTNAME = os_1.default.hostname();
        this.KEY_FILENAME = ENV_VAR("KEY_FILE", "../crt/" + this.HOSTNAME + ".key");
        this.CERT_FILENAME = ENV_VAR("CERT_FILE", "../crt/" + this.HOSTNAME + ".crt");
        this.KEY_FILE = fs_1.default.readFileSync(path_1.default.join(__dirname, this.KEY_FILENAME), "utf8");
        this.CERT_FILE = fs_1.default.readFileSync(path_1.default.join(__dirname, this.CERT_FILENAME), "utf8");
        this.HTTPS_OPTIONS = {
            key: this.KEY_FILE,
            cert: this.CERT_FILE,
        };
        this.server = spdy_1.default.createServer(this.HTTPS_OPTIONS, express_1.default);
        this.express = (0, express_1.default)();
        this.mountRoutes();
        this.doAlways();
    }
    mountRoutes() {
        const router = express_1.default.Router();
        router.get("/", (_req, res) => {
            res.json({ message: "Go away, world!" });
        });
        this.express.use("/", router);
    }
    doAlways() {
        //SSL KEYS
        this.server.listen(this.PORT_HTTPS);
        console.info("HTTPS started on port: " + this.PORT_HTTPS);
        // compress all responses
        // https://webhint.io/docs/user-guide/hints/hint-http-compression/
        this.express.use((0, compression_1.default)());
        ENV_VARB("DO_STATIC") && this.doStatic();
        ENV_VARB("DO_CORS") && this.doCors();
        ENV_VARB("DO_PEERJS") && this.doPeerServer();
        ENV_VARB("DO_WEBPUSH") && this.doPushServer();
        ENV_VARB("DO_SOCKETIO") && this.doSocketIO();
    }
    doStatic() {
        const DIR_PUB_STATIC = ENV_VAR("DIR_PUB_STATIC", "public");
        //serve static
        this.express.use(express_1.default.static(path_1.default.join(__dirname, DIR_PUB_STATIC)));
        // https://webhint.io/docs/user-guide/hints/hint-no-disallowed-headers/?source=devtools
    }
    doCors() {
        console.log("Using cors", cors_1.default);
        this.express.use((0, cors_1.default)());
    }
    /**
     *
     */
    doPeerServer() {
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
        const peerServer = (0, peer_1.ExpressPeerServer)(this.server, PEERJS_OPTIONS);
        console.info("Starting peerserver with options", PEERJS_OPTIONS);
        this.express.use(PEERJS_CONTEXT, peerServer);
        ENV_VARB("DO_PEERJS_SECURE") && this.doPeerSecure(peerServer);
    }
    /**
     *
     * @param peerServer
     */
    doPeerSecure(peerServer) {
        //console.info("Making peerServer secure", peerServer);
        peerServer.on("connection", (client) => {
            console.log("Client connecting", client);
            const peerid = client.getId();
            console.info("client id/token", peerid);
            //verify
            const fishy = false;
            if (fishy)
                client.getSocket().close();
        });
    }
    /**
     *
     */
    doPushServer() {
        const HTTP_ERROR_Insufficient_Storage_Push_tooBig = 507;
        const HTTP_ERROR_PUSH_SERVICE_ERROR_Bad_Gateway = 502;
        const PUSH_MAX_BYTES = 4 * 1024;
        const WEBPUSH_CONTEXT = ENV_VAR("WEBPUSH_CONTEXT", "/web-push");
        const VAPID_SUBJECT = ENV_VAR("VAPID_SUBJECT", "mailto:push@volatalk.org");
        //WEB-PUSH VAPID KEYS; generate USING ./node_modules/.bin/web-push generate-vapid-keys
        const VAPID_PUBKEY = ENV_VAR("VAPID_PUBKEY", "BChZg2Ky1uKIDRdYWapWKZXZ19VvFedmK0bjqir9kMsyUK42cguvoAr4Pau4yQr2aY4IWGIsr3W1lWK5okZ6O84");
        const VAPID_PRIVKEY = ENV_VAR("VAPID_PRIVKEY", "CvQGYBs-AzSHF55J7mqTR8VE7l-qwiBiSslqeaMfx8o");
        this.express.use(express_1.default.json());
        web_push_1.default.setVapidDetails(VAPID_SUBJECT, VAPID_PUBKEY, VAPID_PRIVKEY);
        //Blob needed to measure request size
        const { Blob } = require("buffer");
        this.express.post(WEBPUSH_CONTEXT, (request, response) => {
            if (this.DEBUG)
                console.log("Push request", request);
            const body = request.body;
            const subscription = body.subscription;
            const payload = body.payload;
            const byteSizeHeader = Number(request.header("content-length"));
            const byteSizePayload = new Blob([payload]).size;
            console.info(`Push request size - header[payload]: ${byteSizeHeader}[${byteSizePayload}]`);
            if (byteSizeHeader >= PUSH_MAX_BYTES) {
                console.warn("Message too big. Have to refuse push.", byteSizeHeader + "kb");
                response.sendStatus(HTTP_ERROR_Insufficient_Storage_Push_tooBig);
                return;
            }
            if (this.DEBUG)
                console.debug("Pushing payload to subscription", payload, subscription);
            web_push_1.default
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
    doSocketIO() {
        const io = require("socket.io")(this.server, {
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
}
exports.default = new App().express;
function ENV_VARN(varName, defaults) {
    return Number(ENV_VAR(varName, "" + defaults));
}
function ENV_VARB(varName) {
    return ENV_VAR(varName, "true") === "true";
}
function ENV_VAR(varName, defaults) {
    let val = process.env[varName];
    val = val === null || val === void 0 ? void 0 : val.trim();
    console.log(varName + (!val ? " [UNDEFINED] Using default: " + defaults : ": " + val));
    return (val === null || val === void 0 ? void 0 : val.trim()) || defaults;
}
function peerIdToPublicKey(peerid) {
    const cryptoKey = JSON.parse(convertHexToString(peerid));
    console.debug("Converted PeerID->PublicKey", cryptoKey, peerid);
    return cryptoKey;
}
function convertHexToString(hex) {
    return hex
        .split(/(\w\w)/g)
        .filter((p) => !!p)
        .map((c) => String.fromCharCode(parseInt(c, 16)))
        .join("");
}
//# sourceMappingURL=Server.js.map