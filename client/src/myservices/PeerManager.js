import Peer from "peerjs";
import { persistMessage } from "./DB.js";

import { Message } from "./peerpm-msg.js.js";
import { createNotification } from "./Notify.js.js";

const ERR_CONTACT_RECUSED = 403;

export class PeerManager {
  static myPeer;
  static connections; //Map <contact.peerid, connection>

  constructor() {
    console.log("PeerManager created");
    
  }

  static peer() {
    if (!PeerManager.myPeer) {
      PeerManager.connections = new Map();
      if (!user) {
        throw Error("No User");
      }

      let peerid = user.peerid;

      if (!peerid || peerid === "") {
        throw Error("User without peerid (public key)");
      }

      let connOpts = {
        host: domain,
        port: 8443,
        path: "/pm",
        secure: true,
        key: "pmkey",
        debug: 0,
      };

      console.debug(
        `Connecting to peerserver with id and (options):`,
        peerid,
        connOpts
      );

      PeerManager.myPeer = new Peer(peerid, connOpts);

      PeerManager.myPeer.on("open", function (pid) {
        console.log("Online. ID: " + pid);
        if (pid !== peerid) {
          throw Error("Broker assigned different id: " + pid);
        }
      });
      PeerManager.myPeer.on("connection", function (conn) {
        conn.on("open", function () {
          console.log("Connection open", conn);
          PeerManager.receiveUnverifiedPeerConnection(conn);
        });
      });
      PeerManager.myPeer.on("disconnected", function () {
        console.warn("Peer disconnected.");
      });
      PeerManager.myPeer.on("close", function () {
        console.warn("Peer closed.");
      });

      PeerManager.myPeer.on("error", function (err) {
        if (err.type === "peer-unavailable") {
          console.warn("PEER offline:" + err);
        } else {
          console.warn(err);
          PeerManager.reconnect();
        }
      });
    }
    return PeerManager.myPeer;
  }

  /**
   * Start a new connection request handshake with contact, sending user's'
   * Public info and the signature to other peer for validation.
   * @param {*} contact
   */
  static initiateConnection(contact) {
    //do not send private key / passwordhash to other side
    let userInfo = PeerManager.myPublicUserinfo();

    let options = {
      metadata: {
        userInfo: userInfo,
        signature: JSON.stringify(
          Array.from(new Uint32Array(contact.signature))
        ),
      },
    };

    let connection = PeerManager.peer().connect(contact.peerid, options);

    PeerManager.connections.set(connection.peer, connection);

    connection.on("data", function (data) {
      console.debug("Connection " + contact + " Received DATA: ", data);
      PeerManager.receiveMessage(data, contact);
    });

    console.debug("Connecting to: " + connection.metadata, connection);
  }

  /**
   * Received connection open from someone. Validate his signature first.
   * @param {*} conn
   */
  static receiveUnverifiedPeerConnection(conn) {
    console.debug("Received connection", conn);

    if (!conn.metadata.userInfo) {
      console.warn("No userinfo in  metada. Aborting.", conn);
      conn.close();
      return;
    }

    let sigEncoded;
    try {
      sigEncoded = new Uint32Array(JSON.parse(conn.metadata.signature));
    } catch (error) {}
    if (!sigEncoded) {
      console.warn("No signature in metada. Aborting.", conn);
      conn.close();
      return;
    }

    // Requester must sign a message containing the requested peerid (this.user.peerid)
    let pubKey = peerIdToPublicKey(conn.peer);
    pubKey = conn.metadata.userInfo.publicKey;
    importPublicKey(pubKey)
      .then((contactPubKey) => {
        console.debug("PubKey imported", contactPubKey);

        verifyMessage(user.peerid, sigEncoded, contactPubKey).then((valid) => {
          console.debug("Signature verification: " + valid);

          //valid signature, continue trusted connection
          if (valid) {
            console.debug("Signature validated", conn);
            PeerManager.acceptTrustedConnection(conn);
          } else {
            console.warn("Invalid signature. Aborting", conn);
            conn.close();
          }
        });
      })
      .catch((error) => {
        console.warn(
          "Invalid pubKey from peer: " + conn.peer + ". REASON: " + error,
          pubKey,
          error
        );
      });
  }

  /**
   * Incoming connection with valid signature, find the contact
   */
  static async acceptTrustedConnection(conn) {
    let contact = await loadContact(conn.peer);

    if (!contact) {
      console.debug("Trusted connection with NEW contact", conn);
      PeerManager.acceptTrustedNewContact(conn);
    } else {
      console.debug("Trusted connection with KNOWN contact", contact, conn);
      PeerManager.receiveRegisteredContact(contact, conn);
    }
  }

  /**
   */
  static acceptTrustedNewContact(conn) {
    let contact = new Contact(conn.peer);
    contact.userInfo = conn.metadata.userInfo;
    createNotification(
      "New Contact request",
      "You received a contact request from " +
        contact.userInfo.nickname +
        ". \r\nPlease open your contact list and accept the new contact."
    );
    persistContact(contact);
    conn.close();
  }
  /**
   * Contact is signature validated and known. Now Validate if we have accepted
   */
  static receiveRegisteredContact(contact, conn) {
    contact.userInfo = conn.metadata.userInfo; //update user info
    persistContact(contact);
    if (contact.declined) {
      console.warn(
        "Declined contact connecting. Aborting connection.",
        contact
      );
      conn.close();
    } else if (contact.accepted) {
      conn.send("Connected with " + user.nickname);
      console.debug("Established peer connection", contact, conn);
      createNotification(
        "Connection Manager",
        contact.userInfo.nickname + " got online!"
      );
      PeerManager.connections.set(conn.peer, conn);
    }
  }

  static checkConnection(contact) {
    let conn = PeerManager.connections.get(contact.peerid);
    if (conn) {
      if (conn.open) {
        console.debug("Connection is open with contact: ", contact.peerid);
      } else {
        console.debug(
          "Waiting to open connection with contact: ",
          contact.peerid
        );
      }
    } else {
      console.debug("Opening new connection", contact);
      PeerManager.initiateConnection(contact);
    }
  }

  static disconnect() {
    console.log("Disconnecting connection to peerserver...");
    PeerManager.peer().disconnect();
  }

  static reconnect() {
    console.log("Reconnecting to peerserver...");
    PeerManager.peer().reconnect();
  }
  static sendMessage(msg, contact) {
    console.debug("Sending contact: " + contact + " message: " + msg);
    let m = new Message(contact.peerid, msg, true, true);
    PeerManager.connections.get(contact.peerid).send(msg);
    persistMessage(m);
  }

  static receiveMessage(msg, contact) {
    console.log("Received message: " + msg + " from contact: " + contact);
    let m = new Message(contact.peerid, msg, false, false);
    persistMessage(m);
  }

  static online() {
    try {
      let peer = PeerManager.peer();
      return peer && !peer.disconnected && peer.open;
    } catch (error) {
      console.error("Peer offline: " + error, error);
      return false;
    }
  }

  static isConnectedWith(contact) {
    let conn = PeerManager.connections.get(contact.peerid);
    return conn && conn.open;
  }

  static disconnectFrom(contact) {
    let conn = PeerManager.connections.get(contact.peerid);
    if (conn && conn.open) conn.close();
  }

  static genSignature(peerid) {
    return importPrivateKey(user.privateKey).then((privKey) => {
      return signMessage(peerid, privKey);
    });
  }

  /** User info send out to contacts
   */
  static myPublicUserinfo() {
    let ui = new User(
      user.peerid,
      user.publicKey,
      "secret" /* dont send privkey */
    );
    ui.nickname = user.nickname;
    ui.avatar = user.avatar;
    ui.dateRegistered = user.dateRegistered;
    return ui;
  }
}
