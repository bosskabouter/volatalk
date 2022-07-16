"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.VolaTALK = void 0;
/**
 * First attempt to convert to ts server. Not working yet.
 */
const express_1 = __importDefault(require("express"));
const spdy_1 = __importDefault(require("spdy"));
const path_1 = __importDefault(require("path"));
const web_push_1 = __importStar(require("web-push"));
const peer_1 = require("peer");
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const CryptoService_1 = require("./CryptoService");
const Generic_1 = require("./Generic");
const HTTPS_OPTIONS_1 = require("./HTTPS_OPTIONS");
class VolaTALK {
    /**
     *
     */
    constructor() {
        this.DEBUG = (0, Generic_1.ENV_VARB)("DEBUG");
        this.app = (0, express_1.default)();
        this.server = spdy_1.default.createServer(HTTPS_OPTIONS_1.HTTPS_OPTIONS, express_1.default);
        this.mountRoutes();
        this.doAlways();
        this.server.listen(HTTPS_OPTIONS_1.HTTPS_PORT);
    }
    /**
     *
     */
    mountRoutes() {
        const router = express_1.default.Router();
        router.get("/", (_req, res) => {
            res.json({ message: "Hello world!" });
        });
        this.app.use("/", router);
    }
    doAlways() {
        //SSL KEYS
        // compress all responses
        // https://webhint.io/docs/user-guide/hints/hint-http-compression/
        this.app.use((0, compression_1.default)());
        (0, Generic_1.ENV_VARB)("DO_STATIC") && this.doStatic();
        (0, Generic_1.ENV_VARB)("DO_CORS") && this.doCors();
        (0, Generic_1.ENV_VARB)("DO_PEERJS") && this.doPeerServer();
        (0, Generic_1.ENV_VARB)("DO_WEBPUSH") && this.doPushServer();
        (0, Generic_1.ENV_VARB)("DO_SOCKETIO") && this.doSocketIO();
        //this.server.listen(HTTPS_PORT);
        console.info("HTTPS started on port: " + HTTPS_OPTIONS_1.HTTPS_PORT);
    }
    doStatic() {
        const DIR_PUB_STATIC = (0, Generic_1.ENV_VAR)("DIR_PUB_STATIC", "public");
        //serve static
        this.app.use(express_1.default.static(path_1.default.join(__dirname, DIR_PUB_STATIC)));
        // https://webhint.io/docs/user-guide/hints/hint-no-disallowed-headers/?source=devtools
    }
    doCors() {
        console.log("Using cors", cors_1.default);
        this.app.use((0, cors_1.default)());
    }
    /**
     *
     */
    doPeerServer() {
        const PEERJS_CONTEXT = (0, Generic_1.ENV_VAR)("PEER_CONTEXT", "/vtpeer");
        const PEERJS_KEY = (0, Generic_1.ENV_VAR)("PEERJS_KEY", "pmkey");
        //serve peerjs
        const PEERJS_OPTIONS = {
            port: HTTPS_OPTIONS_1.HTTPS_PORT,
            path: PEERJS_CONTEXT,
            key: PEERJS_KEY,
            debug: this.DEBUG,
            ssl: HTTPS_OPTIONS_1.HTTPS_OPTIONS
        };
        const peerServer = (0, peer_1.ExpressPeerServer)(this.server, PEERJS_OPTIONS);
        console.info("Starting peerserver with options", PEERJS_OPTIONS);
        this.app.use(PEERJS_CONTEXT, peerServer);
        (0, Generic_1.ENV_VARB)("DO_PEERJS_SECURE") &&
            this.doPeerSecure(peerServer, PEERJS_CONTEXT);
    }
    /**
     *
     * @param peerServer
     */
    doPeerSecure(peerServer, context) {
        console.info("Making peerServer secure" + peerServer);
        peerServer.on("connection", (client) => {
            console.log("Client connecting", client);
            const peerid = client.getId();
            console.info("client id/token", peerid);
            !isTokenValid(context, client.token, peerid) &&
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
        const WEBPUSH_CONTEXT = (0, Generic_1.ENV_VAR)("WEBPUSH_CONTEXT", "/web-push");
        const VAPID_SUBJECT = (0, Generic_1.ENV_VAR)("VAPID_SUBJECT", "mailto:push@volatalk.org");
        //WEB-PUSH VAPID KEYS; generate USING ./node_modules/.bin/web-push generate-vapid-keys
        const VAPID_PUBKEY = (0, Generic_1.ENV_VAR)("VAPID_PUBKEY", "BChZg2Ky1uKIDRdYWapWKZXZ19VvFedmK0bjqir9kMsyUK42cguvoAr4Pau4yQr2aY4IWGIsr3W1lWK5okZ6O84");
        const VAPID_PRIVKEY = (0, Generic_1.ENV_VAR)("VAPID_PRIVKEY", "CvQGYBs-AzSHF55J7mqTR8VE7l-qwiBiSslqeaMfx8o");
        this.app.use(express_1.default.json());
        web_push_1.default.setVapidDetails(VAPID_SUBJECT, VAPID_PUBKEY, VAPID_PRIVKEY);
        //Blob needed to measure request size
        const { Blob } = require("buffer");
        /**
         * Generate a VAPID key for requester
         */
        this.app.get(WEBPUSH_CONTEXT, (request, response) => {
            //TODO Validate token in request
            const VAPIDKeys = (0, web_push_1.generateVAPIDKeys)();
            console.info("QueryParams", request.query);
            response.write(JSON.stringify(VAPIDKeys));
        });
        /**
         * Respond to Push Posts
         */
        this.app.post(WEBPUSH_CONTEXT, (request, response) => {
            if (this.DEBUG)
                console.log("Push request", request);
            const body = request.body;
            const peerid = body.peerid;
            const token = body.token;
            if (!isTokenValid(WEBPUSH_CONTEXT, token, peerid)) {
                console.warn("Token Invalid: not pushing", request);
            }
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
exports.VolaTALK = VolaTALK;
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
        return pubKey && (0, CryptoService_1.verifyMessage)(context, new TextEncoder().encode(token), pubKey);
    });
}
//# sourceMappingURL=Server.js.map