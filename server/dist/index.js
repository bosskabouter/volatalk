"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * First attempt to convert to ts server. Not working yet.
 */
const Server_1 = __importDefault(require("./Server"));
const port = process.env.PORT || 3000;
Server_1.default.disable("x-powered-by");
// app.listen(port, () => {
//   console.log(`Server is listening on port ${port}.`);
// });
//# sourceMappingURL=index.js.map