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

    const sigDecoded = new Uint8Array(JSON.parse(md.signature)).buffer;

    const valid = await verifyMessage(this.user.peerid, sigDecoded, contactPubKey);
    console.debug(`Signature valid: ` + valid);
    return valid;
  }

  /**
   * Incoming connection with valid signature, find the contact
   */
  async acceptTrustedConnection(conn: DataConnection) {
    const contact = await this.db.contacts.get(conn.peer);

    if (!contact) {
      alert('Trusted connection with NEW contact' + conn.peer);
      //just save for now, then notify react somehow, user will decide to accept or not

      this.registerContactForAproval(conn);
    } else {
      console.info('Trusted connection with KNOWN contact', contact, conn);
      this.receiveRegisteredContact(contact, conn);
    }
  }

  /**
   */
  async registerContactForAproval(conn: DataConnection) {
    const md: IConnectionMetadata = conn.metadata;

    //create signature for contact
    const sig = await this.genSignature(conn.peer);

    const contact: IContact = {
      peerid: conn.peer,
      signature: sig,
      nickname: md.nickname,
      avatar: md.avatar,
      dateCreated: new Date(),
      dateResponded: new Date(),
      accepted: false,
      declined: false,
    };
    await this.db.contacts.add(contact);
    //alert('Contact added: ' + contact.nickname + ' with signature: ' + md.signature);
    //let's close for now and reestablish a connection from our side to send our signature
    console.debug(`Created contact. Closing connection and wait user aproval.`, contact, conn);
    conn.close();
  }

  /**
   * Know contact incoming. Validate if we have 1. accepted 2. not declined 3.
   */
  receiveRegisteredContact(contact: IContact, conn: DataConnection) {
    const md: IConnectionMetadata = conn.metadata;
    contact.nickname = md.nickname;
    contact.avatar = md.avatar;
    this.db.contacts.put(contact);
    if (!contact.accepted) {
      console.warn('Unaccepted contact trying to connect. Aborting.', contact);
      conn.close();
    } else if (contact.declined) {
      console.warn('Declined contact trying to connect. Aborting connection.', contact);
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
    if (contact.declined) {
      console.debug(
        'Not initiating connection with declined contact: ' + contact.nickname,
        contact
      );
      return;
    }
    //do not send private key / passwordhash to other side
    if (!contact.signature) {
      throw Error('No signature for contact: ' + contact.nickname);
    }
    const md: IConnectionMetadata = {
      signature: JSON.stringify(Array.from(new Uint8Array(contact.signature))),
      nickname: this.user.nickname,
      avatar: this.user.avatar,
      dateRegistered: this.user.dateRegistered,
      peerid: JSON.stringify(this.user.peerid),
    };

    const connection = this.connect(contact.peerid, {
      metadata: md,
    });
    console.info('Connecting with: ' + contact.nickname, connection);

    this.connectedContacts.set(connection.peer, connection);

    connection.on('data', (data) => {
      console.info(`received DATA message from contact:` + contact.nickname, data);
      this.receiveMessage(data, contact);
    });
    return connection;
  }

  checkConnection(contact: IContact) {
    let conn = this.connectedContacts.get(contact.peerid);
    if (conn) {
      if (conn.open) {
        console.debug('Connection open with: ' + contact.nickname, contact);
        return true;
      } else {
        console.debug('Waiting for connection to open with contact: ' + contact.nickname, contact, conn);
        return false;
      }
    } else {
      console.info('Opening connection with contact: ' + contact.nickname, contact);
      conn = this.initiateConnection(contact);
      return conn && conn.open;
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
