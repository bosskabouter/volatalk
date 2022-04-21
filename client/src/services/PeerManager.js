import Peer from 'peerjs';
import { persistMessage } from './DB.js';

const ERR_CONTACT_RECUSED = 403;

export class PeerManager {
  myPeer;
  connections; //Map <contact.peerid, connection>

  constructor(peerid) {
    if (!this.myPeer) {
      this.connections = new Map();

      if (!peerid || peerid === '') {
        throw Error('User without peerid (public key)');
      }

      let connOpts = {
        host: "volatalk.org",
        port: 443,
        path: '/peerjs',
        secure: true,
        key: 'pmkey',
        debug: 3,
      };

      console.debug(`Connecting to peerserver with id and (options):`, peerid, connOpts);

      this.myPeer = new Peer(peerid, connOpts);

      this.myPeer.on('open', function (pid) {
        console.log('Online. ID: ' + pid);
        if (pid !== peerid) {
          throw Error('Broker assigned different id: ' + pid);
        }
      });
      this.myPeer.on('connection', function (conn) {
        conn.on('open', function () {
          console.log('Connection open', conn);
          this.receiveUnverifiedPeerConnection(conn);
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
          this.reconnect();
        }
      });
    }
    return this.myPeer;
  }

  /**
   * Start a new connection request handshake with contact, sending user's'
   * Public info and the signature to other peer for validation.
   * @param {*} contact
   */
  initiateConnection(contact) {
    //do not send private key / passwordhash to other side
    let userInfo = this.myPublicUserinfo();

    let options = {
      metadata: {
        userInfo: userInfo,
        signature: JSON.stringify(Array.from(new Uint32Array(contact.signature))),
      },
    };

    let connection = this.peer().connect(contact.peerid, options);

    this.connections.set(connection.peer, connection);

    connection.on('data', function (data) {
      console.debug('Connection ' + contact + ' Received DATA: ', data);
      this.receiveMessage(data, contact);
    });

    console.debug('Connecting to: ' + connection.metadata, connection);
  }

  /**
   * Received connection open from someone. Validate his signature first.
   * @param {*} conn
   */
  receiveUnverifiedPeerConnection(conn) {
    console.debug('Received connection', conn);

    if (!conn.metadata.userInfo) {
      console.warn('No userinfo in  metada. Aborting.', conn);
      conn.close();
      return;
    }

    let sigEncoded;
    try {
      sigEncoded = new Uint32Array(JSON.parse(conn.metadata.signature));
    } catch (error) {}
    if (!sigEncoded) {
      console.warn('No signature in metada. Aborting.', conn);
      conn.close();
      return;
    }

    // Requester must sign a message containing the requested peerid (this.user.peerid)
    let pubKey = peerIdToPublicKey(conn.peer);
    pubKey = conn.metadata.userInfo.publicKey;
    importPublicKey(pubKey)
      .then((contactPubKey) => {
        console.debug('PubKey imported', contactPubKey);

        verifyMessage(user.peerid, sigEncoded, contactPubKey).then((valid) => {
          console.debug('Signature verification: ' + valid);

          //valid signature, continue trusted connection
          if (valid) {
            console.debug('Signature validated', conn);
            this.acceptTrustedConnection(conn);
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
  }

  /**
   * Incoming connection with valid signature, find the contact
   */
  async acceptTrustedConnection(conn) {
    let contact = await loadContact(conn.peer);

    if (!contact) {
      console.debug('Trusted connection with NEW contact', conn);
      this.acceptTrustedNewContact(conn);
    } else {
      console.debug('Trusted connection with KNOWN contact', contact, conn);
      this.receiveRegisteredContact(contact, conn);
    }
  }

  /**
   */
  acceptTrustedNewContact(conn) {
    let contact = new Contact(conn.peer);
    contact.userInfo = conn.metadata.userInfo;
    createNotification(
      'New Contact request',
      'You received a contact request from ' +
        contact.userInfo.nickname +
        '. \r\nPlease open your contact list and accept the new contact.'
    );
    persistContact(contact);
    conn.close();
  }
  /**
   * Contact is signature validated and known. Now Validate if we have accepted
   */
  receiveRegisteredContact(contact, conn) {
    contact.userInfo = conn.metadata.userInfo; //update user info
    persistContact(contact);
    if (contact.declined) {
      console.warn('Declined contact connecting. Aborting connection.', contact);
      conn.close();
    } else if (contact.accepted) {
      conn.send('Connected with ' + user.nickname);
      console.debug('Established peer connection', contact, conn);
      createNotification('Connection Manager', contact.userInfo.nickname + ' got online!');
      this.connections.set(conn.peer, conn);
    }
  }

  checkConnection(contact) {
    let conn = this.connections.get(contact.peerid);
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

  disconnect() {
    console.log('Disconnecting connection to peerserver...');
    this.peer().disconnect();
  }

  reconnect() {
    console.log('Reconnecting to peerserver...');
    this.peer().reconnect();
  }
  sendMessage(msg, contact) {
    console.debug('Sending contact: ' + contact + ' message: ' + msg);
    let m = new Message(contact.peerid, msg, true, true);
    this.connections.get(contact.peerid).send(msg);
    persistMessage(m);
  }

  receiveMessage(msg, contact) {
    console.log('Received message: ' + msg + ' from contact: ' + contact);
    let m = new Message(contact.peerid, msg, false, false);
    persistMessage(m);
  }

  online() {
    try {
      let peer = this.peer();
      return peer && !peer.disconnected && peer.open;
    } catch (error) {
      console.error('Peer offline: ' + error, error);
      return false;
    }
  }

  isConnectedWith(contact) {
    let conn = this.connections.get(contact.peerid);
    return conn && conn.open;
  }

  disconnectFrom(contact) {
    let conn = this.connections.get(contact.peerid);
    if (conn && conn.open) conn.close();
  }

  genSignature(peerid) {
    return importPrivateKey(user.privateKey).then((privKey) => {
      return signMessage(peerid, privKey);
    });
  }

  /** User info send out to contacts
   */
  myPublicUserinfo() {
    let ui = new User(user.peerid, user.publicKey, 'secret' /* dont send privkey */);
    ui.nickname = user.nickname;
    ui.avatar = user.avatar;
    ui.dateRegistered = user.dateRegistered;
    return ui;
  }
}
