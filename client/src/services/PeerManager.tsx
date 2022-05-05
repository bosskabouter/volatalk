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
        console.log('Connection open', conn);
        this.hasValidSignatureMetadata(conn).then((valid) => {
          if (valid) this.acceptTrustedConnection(conn);
          else alert('Invalid signature from contact: ' + conn.metadata);
        });
      });
    });
    this.on('disconnected', () => {
      alert('Disconnected!');
      console.warn('Peer disconnected.');
    });
    this.on('close', function () {
      console.warn('Peer closed.');
    });

    this.on('error', function (err) {
      if (err.type === 'peer-unavailable') {
        console.warn('PEER UNREACHABLE:' + err);
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
    if (!contact.signature) {
      throw Error('No signature for contact: ' + contact.nickname);
    }
    console.info('Initiate connection: ' + JSON.stringify(contact));
    const md: IConnectionMetadata = {
      signature: convertAbToBase64(contact.signature),
      nickname: JSON.stringify(this.user.nickname),
      avatar: JSON.stringify(this.user.avatar),
      dateRegistered: this.user.dateRegistered,
      peerid: JSON.stringify(this.user.peerid),
    };
    alert('convert Ab ToBase64 signature for contact: ' + contact.nickname + '=' + md.signature);
    const options = {
      metadata: md,
    };

    const connection = this.connect(contact.peerid, options);

    this.connectedContacts.set(connection.peer, connection);

    connection.on('data', (data) => {
      console.info('Connection ' + contact + ' Received DATA: ', data);
      this.receiveMessage(data, contact);
    });
    console.info('Connecting to: ' + connection.metadata, connection);
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
      console.info('Opening new connection', contact);
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

  /**
   * Received connection open from someone. Validate his signature first.
   * @param {*} conn
   */
  async hasValidSignatureMetadata(conn: DataConnection) {
    console.debug('Received connection', conn);
    const md: IConnectionMetadata = conn.metadata;
    if (!md) {
      return false;
    }

    // Requester must sign a message containing the requested peerid (this.user.peerid)
    const pubKey = peerIdToPublicKey(conn.peer);
    const contactPubKey = await importPublicKey(pubKey);

    console.debug('PubKey imported', contactPubKey);

    alert('Received signature from contact: ' + conn.peer + ' => ' + conn.metadata.signature);
    const sigDecoded = convertBase64ToAb(conn.metadata.signature);

    return verifyMessage(this.user.peerid, sigDecoded, contactPubKey);
  }

  /**
   * Incoming connection with valid signature, find the contact
   */
  async acceptTrustedConnection(conn: DataConnection) {
    const contact = await this.db.contacts.get(conn.peer);

    if (!contact || !contact.signature) {
      alert('Trusted connection with NEW contact' + conn.peer);
      this.acceptTrustedNewContact(conn);
    } else {
      console.info('Trusted connection with KNOWN contact', contact, conn);
      this.receiveRegisteredContact(contact, conn);
    }
  }

  /**
   */
  acceptTrustedNewContact(conn: DataConnection) {
    const md: IConnectionMetadata = conn.metadata;

    const contact: IContact = {
      peerid: conn.peer,
      signature: convertBase64ToAb(md.signature),
      nickname: md.nickname,
      avatar: md.avatar,
      dateCreated: new Date(),
      dateResponded: new Date(),
      accepted: true,
      declined: false,
    };
    this.db.contacts.add(contact);
    alert('Contact added: ' + contact.nickname + ' with signature: ' + md.signature);
    //let's close for now and reestablish a connection from our side to send our signature
    conn.close();
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
}
