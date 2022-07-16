import { ENV_VAR, ENV_VARN } from "./Generic";
import path from "path";
import fs from "fs";
import os from "os";

export const HTTPS_PORT = ENV_VARN("PORT_HTTPS", 8443);

const KEY_FILENAME = ENV_VAR("KEY_FILE", "../crt/" + os.hostname() + ".key");
const CERT_FILENAME = ENV_VAR("CERT_FILE", "../crt/" + os.hostname() + ".crt");

const KEY_FILE = fs.readFileSync(path.join(__dirname, KEY_FILENAME), "utf8");
const CERT_FILE = fs.readFileSync(path.join(__dirname, CERT_FILENAME), "utf8");


export const HTTPS_OPTIONS = {
  key: KEY_FILE,
  cert: CERT_FILE,
};
