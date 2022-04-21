import { AppDatabase, IContact, IUserProfile } from 'Database/Database';

import Peer, { DataConnection } from 'peerjs';

import {
  importPrivateKey,
  importPublicKey,
  peerIdToPublicKey,
  signMessage,
  verifyMessage,
} from './Crypto';
import { convertStr2ab } from './Generic';

const ERR_CONTACT_RECUSED = 403;

const db = new AppDatabase();

export class PeerManager {
  user: IUserProfile;
  myPeer: Peer;
  connections: Map<string, DataConnection>;
  //static user = UserContext.Consumer;
  constructor(user: IUserProfile) {
    this.user = user;
    this.connections = new Map();

    if (!user?.peerid) {
      throw Error('User without peerid (public key)');
    }

    const connOpts = {
      host: 'volatalk.org',
      port: 443,
      path: '/peerjs',
      secure: true,
      key: 'pmkey',
      debug: 3,
    };

    console.debug(`Connecting to peerserver with id and (options):`, user.peerid, connOpts);

    this.myPeer = new Peer(user.peerid, connOpts);

    this.myPeer.on('open', function (pid) {
      console.log('Online. ID: ' + pid);
      if (pid !== user.peerid) {
        throw Error('Broker assigned different id: ' + pid);
      }
    });
    this.myPeer.on('connection', function (conn: DataConnection) {
      conn.on('open', function () {
        console.log('Connection open', conn);
        try {
          receiveUnverifiedPeerConnection(conn);
        } catch (e) {
          console.error('Error receiving connection. Closing: ', conn, e);
          conn.close();
          throw e;
        }
      });
    });
    this.myPeer.on('disconnected', function () {
      console.warn('Peer disconnected.');
    });
    this.myPeer.on('close', function () {
      console.warn('Peer closed.');
    });

    this.myPeer.on('error', function (err) {
      if (err.type === 'peer-unavailable') {
        console.warn('PEER offline:' + err);
      } else {
        console.warn(err);
      }
    });
  }

  /**
   * Start a new connection request handshake with contact, sending user's'
   * Public info and the signature to other peer for validation.
   * @param {*} contact
   */
  initiateConnection(contact: IContact) {
    //do not send private key / passwordhash to other side

    const signature: Uint8Array = convertStr2ab(contact.signature ? contact.signature : '');

    const options = {
      metadata: {
        signature: JSON.stringify(Array.from(new Uint32Array(signature))),
      },
    };

    const connection = this.myPeer.connect(contact.peerid, options);

    this.connections.set(connection.peer, connection);

    connection.on('data', function (data) {
      console.debug('Connection ' + contact + ' Received DATA: ', data);
      receiveMessage(data, contact);
    });

    console.debug('Connecting to: ' + connection.metadata, connection);
  }

  checkConnection(contact: IContact) {
    const conn = this.connections.get(contact.peerid);
    if (conn) {
      if (conn.open) {
        console.debug('Connection is open with contact: ', contact.peerid);
      } else {
        console.debug('Waiting to open connection with contact: ', contact.peerid);
      }
    } else {
      console.debug('Opening new connection', contact);
      this.initiateConnection(contact);
    }
  }

  sendMessage(msg: string, contact: IContact) {
    console.debug('Sending contact: ' + contact + ' message: ' + msg);
    //let m = new Message(contact.peerid, msg, true, true);
    this.connections?.get(contact.peerid)?.send(msg);
    //persistMessage(m);
  }

  online() {
    try {
      return this.myPeer && !this.myPeer?.disconnected;
    } catch (error) {
      console.error('Peer offline: ' + error, error);
      return false;
    }
  }

  isConnectedWith(contact: IContact) {
    const conn = this.connections.get(contact.peerid);
    return conn && conn.open;
  }

  disconnectFrom(contact: IContact) {
    const conn = this.connections.get(contact.peerid);
    if (conn && conn.open) conn.close();
  }

  genSignature(peerid: string) {
    return importPrivateKey(JSON.parse(this.user.privateKey)).then((privKey) => {
      return signMessage(peerid, privKey);
    });
  }
}

/**
 * Received connection open from someone. Validate his signature first.
 * @param {*} conn
 */
function receiveUnverifiedPeerConnection(conn: DataConnection) {
  console.debug('Received connection', conn);

  if (!conn.metadata.userInfo) {
    console.warn('No userinfo in metada. Closing connection:', conn);
    conn.close();
    return;
  }

  try {
    const sigEncoded: Uint32Array = new Uint32Array(JSON.parse(conn.metadata.signature));

    // Requester must sign a message containing the requested peerid (this.user.peerid)
    let pubKey = peerIdToPublicKey(conn.peer);
    pubKey = conn.metadata.userInfo.publicKey;
    importPublicKey(pubKey)
      .then((contactPubKey) => {
        console.debug('PubKey imported', contactPubKey);

        verifyMessage(conn.peer, sigEncoded, contactPubKey).then((valid) => {
          console.debug('Signature verification: ' + valid);

          //valid signature, continue trusted connection
          if (valid) {
            console.debug('Signature validated', conn);
            acceptTrustedConnection(conn);
          } else {
            console.warn('Invalid signature. Aborting', conn);
            conn.close();
          }
        });
      })
      .catch((error) => {
        console.warn(
          'Invalid pubKey from peer: ' + conn.peer + '. REASON: ' + error,
          pubKey,
          error
        );
      });
  } catch (error) {
    console.warn('No signature in metada. Aborting.', conn);
    conn.close();
    return;
  }
}

/**
 * Incoming connection with valid signature, find the contact
 */
async function acceptTrustedConnection(conn: DataConnection) {
  const contact = null; //await loadContact(conn.peer);

  if (!contact) {
    console.debug('Trusted connection with NEW contact', conn);
    acceptTrustedNewContact(conn);
  } else {
    console.debug('Trusted connection with KNOWN contact', contact, conn);
    receiveRegisteredContact(contact, conn);
  }
}

/**
 */
function acceptTrustedNewContact(conn: DataConnection) {
  //let contact = new Contact(conn.peer);
  //contact.userInfo = conn.metadata.userInfo;
  //TODO notify

  //persistContact(contact);
  conn.close();
}
/**
 * Contact is signature validated and known. Now Validate if we have accepted
 */
function receiveRegisteredContact(contact: IContact, conn: DataConnection) {
  contact.nickname = conn.metadata.nickname; //update user info
  //persistContact(contact);
  if (contact.declined) {
    console.warn('Declined contact connecting. Aborting connection.', contact);
    conn.close();
  } else if (contact.accepted) {
    conn.send('Hi!');
    console.debug('Accept peer connection', contact, conn);
    //TODO NOTIFY USER : CONTACT ONLINE
  }
}

function receiveMessage(msg: string, contact: IContact) {
  console.log('Received message: ' + msg + ' from contact: ' + contact);
  // let m = new Message(contact.peerid, msg, false, false);
  //persistMessage(m);
}
