
import User from "../model/User";
import {
  digestSHA256,
  exportCryptoKey,
  generateKeyPair,
  importPrivateKey,
  importPublicKey,
  peerIdFromPublicKey,
  peerIdToPublicKey,
  signMessage,
  verifyMessage,
} from "./Crypto";
import { localLoad, localSave } from "./Generic";

/**
 * Global exported user object, loaded from localstorage
 * TODO: encrypt local storage
 */

const USER_LOCAL_STORAGE_PARAM = "user";

export function initUser() {
  let u = localLoad(USER_LOCAL_STORAGE_PARAM);
  if (!u) {
    console.log("No user found. Creating new KeyPair for new user...");
    generateKeyPair().then((keyPair) => {
      console.log("New KeyPair created.", keyPair);

      //export public key to hex
      let publicKey = exportCryptoKey(keyPair.publicKey);
      //export public key to hex
      let privateKey = exportCryptoKey(keyPair.privateKey);

      Promise.all([publicKey, privateKey]).then((keys) => {
        let peerid = peerIdFromPublicKey(keys[0]);

        //create global user object
        u = new User(peerid, keys[0], keys[1]);
        testEncryption(u);

        u.avatar =
          "https://thispersondoesnotexist.com/image?forcereload=" +
          Math.random();

        localSave(USER_LOCAL_STORAGE_PARAM, u);
        console.log("Saved new user", u);
      });
    });
  }
  return u;
}

/**
 *
 * @param {*} u
 */
function testEncryption(u) {
  let privateKey = importPrivateKey(u.privateKey);
  let publicKey = importPublicKey(peerIdToPublicKey(u.peerid));
  let someText = "TEST ENCRYPTION - " + new Date();

  Promise.all([publicKey, privateKey]).then((keys) => {
    signMessage(someText, keys[1]).then((signature) =>
      verifyMessage(someText, signature, keys[0]).then((valid) => {
        if (!valid) throw Error("Test Signature invalid..");
      })
    );
  });
}

/**
 * action for login button
 */
export async function login(nickname, password) {
  let pwHash = await digestSHA256(password);
  let u = localLoad("user");
  if (nickname !== u.nickname || pwHash !== u.pwHash) {
    throw Error("Invalid user/password");
  } else {
    return u;
  }
}

/**
 * Action for registration form button
 */
export async function registerUser(user, pw1, pw2) {
  if (pw1 !== pw2) throw Error("Password do not match");

  let pw1Hash = digestSHA256(pw1);
  let pw2Hash = digestSHA256(pw2);

  Promise.all([pw1Hash, pw2Hash]).then((passwords) => {
    if (!user.usePassword) {
      //user doesnt want to create password, remember him
      user.rememberMe = true;
    }
    if (!user.nickname || user.nickname.trim() === "") {
      alert("You need a nickname! ");
    } else if (passwords[0] !== passwords[1]) {
      alert("Passwords didn't match!");
    } else {
      localSave(USER_LOCAL_STORAGE_PARAM, user);
      console.log("Saved user info", user);
    }
  });
  return false;
}
