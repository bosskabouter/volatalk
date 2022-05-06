import { AppDatabase } from 'Database/Database';
import Peer, { DataConnection } from 'peerjs';
import { IConnectionMetadata, IContact, IMessage, IUserProfile } from 'types';

import {
  importPrivateKey,
  importPublicKey,
  peerIdToPublicKey,
  signMessage,
  verifyMessage,
} from './Crypto';
import { convertBase64ToAb, convertAbToBase64 } from './Generic';

export class PeerManager extends Peer {
  user: IUserProfile;
  db: AppDatabase;

  connectedContacts = new Map();

  constructor(user: IUserProfile, db: AppDatabase) {
    super(user.peerid, {
      host: 'peer.pm',
      port: 999,
      path: '/',
      secure: true,
      key: 'volakey',
      debug: 1,
    });

    this.user = user;
    this.db = db;
    this.on('open', (pid) => {
      console.log('connected: ' + this.id);
      if (pid !== user.peerid) {
        throw Error('Broker assigned different id: ' + pid);
      }
    });
    this.on('connection', (conn: DataConnection) => {
      conn.on('open', () => {
        console.debug('Connection open', conn);
        this.hasValidSignatureMetadata(conn).then((valid) => {
          if (valid) this.acceptTrustedConnection(conn);
          else alert('Invalid signature from contact: ' + conn.metadata);
        });
      });
    });
    this.on('disconnected', () => {
      console.warn('Peer disconnected.');
    });
    this.on('close', function () {
      console.warn('Peer closed.');
    });

    this.on('error', function (err) {
      if (err.type === 'peer-unavailable') {
        console.warn('PEER UNREACHABLE:' + err);
      } else {
        alert('Peer error: ' + err);
        console.warn(err);
      }
    });
  }

  /**
   * Received connection open from someone. Validate his signature first.
   * @param {*} conn
   */
  async hasValidSignatureMetadata(conn: DataConnection) {
    const md: IConnectionMetadata = conn.metadata;
    if (!md) {
      return false;
    }

    // Requester must sign a message containing the requested peerid (this.user.peerid)
    const pubKey = peerIdToPublicKey(conn.peer);
    const contactPubKey = await importPublicKey(pubKey);

    console.debug('Contact PubKey imported', contactPubKey);

    const sigDecoded = new Uint8Array(JSON.parse(conn.metadata.signature)).buffer;

    const valid = await verifyMessage(this.user.peerid, sigDecoded, contactPubKey);
    console.debug(`Signature valid: ` + valid);
    return valid;
  }

  /**
   * Incoming connection with valid signature, find the contact
   */
  async acceptTrustedConnection(conn: DataConnection) {
    const contact = await this.db.contacts.get(conn.peer);

    if (!contact || !contact.signature) {
      alert('Trusted connection with NEW contact' + conn.peer);
      //just save for now, then notify react somehow, user will decide to accept or not

      this.createContactAndHandshake(conn);
      
    } else {
      console.info('Trusted connection with KNOWN contact', contact, conn);
      this.receiveRegisteredContact(contact, conn);
    }
  }

  /**
   */
  createContactAndHandshake(conn: DataConnection) {
    const md: IConnectionMetadata = conn.metadata;

    const contact: IContact = {
      peerid: conn.peer,
      signature: convertBase64ToAb(md.signature),
      nickname: md.nickname,
      avatar: md.avatar,
      dateCreated: new Date(),
      dateResponded: new Date(),
      accepted: false,
      declined: false,
    };
    this.db.contacts.add(contact);
    alert('Contact added: ' + contact.nickname + ' with signature: ' + md.signature);
    //let's close for now and reestablish a connection from our side to send our signature
    conn.close();
    this.initiateConnection(contact);
  }

  /**
   * Contact is signature validated and known. Now Validate if we have accepted
   */
  receiveRegisteredContact(contact: IContact, conn: DataConnection) {
    contact.nickname = conn.metadata.nickname; //update user info
    this.db.contacts.put(contact);
    if (contact.declined) {
      console.warn('Declined contact connecting. Aborting connection.', contact);
      conn.close();
    } else if (contact.accepted) {
      conn.send('Hi!');
      console.debug('Accept peer connection', contact, conn);
      alert('Contact online: ' + contact.nickname);
    }
  }

  receiveMessage(msg: string, contact: IContact) {
    console.log('Received message: ' + msg + ' from contact: ' + contact);
    const m: IMessage = {
      dateCreated: new Date(),
      receiver: this.user.peerid,
      sender: contact.peerid,
      dateReceived: new Date(),
      payload: msg,
    };
    this.db.messages.put(m);
  }

  /**
   * Start a new connection request handshake with contact, sending user's'
   * Public info and the signature to other peer for validation.
   * @param {*} contact
   */

  initiateConnection(contact: IContact) {
    //do not send private key / passwordhash to other side
    if (!contact.signature) {
      throw Error('No signature for contact: ' + contact.nickname);
    }
    const md: IConnectionMetadata = {
      signature: JSON.stringify(Array.from(new Uint8Array(contact.signature))),
      nickname: JSON.stringify(this.user.nickname),
      avatar: JSON.stringify(this.user.avatar),
      dateRegistered: this.user.dateRegistered,
      peerid: JSON.stringify(this.user.peerid),
    };
    console.info('Initiate connection with contact: ' + contact.nickname, contact, {
      metadata: md,
    });

    const options = {
      metadata: md,
    };

    const connection = this.connect(contact.peerid, options);
    console.info('Connecting to: ' + connection.metadata, connection);

    this.connectedContacts.set(connection.peer, connection);

    connection.on('data', (data) => {
      console.info(`received DATA message from contact:` + contact.nickname, data);
      this.receiveMessage(data, contact);
    });
    return connection;
  }

  checkConnection(contact: IContact) {
    const conn = this.connectedContacts.get(contact.peerid);
    if (conn) {
      if (conn.open) {
        console.info('Connection open with contact: ', contact.peerid);
      } else {
        console.info('Waiting to open connection with contact: ', contact.peerid);
      }
    } else {
      console.info('Opening connection with contact: ' + contact.nickname, contact);
      this.initiateConnection(contact);
    }
  }

  sendMessage(m: IMessage) {
    console.info('Sending message: ' + m.payload + ' to: ' + m.receiver);
    this.connectedContacts.get(m.receiver)?.send(m.payload);
  }

  isOnline() {
    return !this.disconnected;
  }

  isConnectedWith(contact: IContact) {
    const conn = this.connectedContacts.get(contact.peerid);
    return conn && conn.open;
  }

  disconnectFrom(contact: IContact) {
    const conn = this.connectedContacts.get(contact.peerid);
    if (conn && conn.open) conn.close();
  }

  genSignature(peerid: string) {
    return importPrivateKey(JSON.parse(this.user.privateKey)).then((privKey) => {
      return signMessage(peerid, privKey);
    });
  }
}
