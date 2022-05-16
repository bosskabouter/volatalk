import { IConnectionMetadata, IContact, IMessage, IUserProfile } from 'types';
import { AppDatabase } from 'Database/Database';
import { genSignature, importPublicKey, peerIdToPublicKey, verifyMessage } from './Crypto';

import EventEmitter from 'events';
import StrictEventEmitter from 'strict-event-emitter-types/types/src';
import { default as Peer, DataConnection } from 'peerjs';
import { decryptString, encryptString, generateKeyFromString } from 'dha-encryption';

export interface PeerManagerEvents {
  statusChange: (status: boolean) => void;
  onContactOnline: (contact: IContact) => void;
  onMessage: (message: IMessage) => void;
  onNewContact: (contact: IContact) => void;
}

const RECONNECT_TIMEOUT = 60 * 1000;

export class PeerManager
  extends EventEmitter
  implements StrictEventEmitter<PeerManager, PeerManagerEvents>
{
  online: boolean;

  user: IUserProfile;
  _db: AppDatabase;
  _peer: Peer;
  /*
 * https://peerjs.com/docs/#peerconnections
 We recommend keeping track of connections yourself rather than relying on this hash.
 */
  connectedContacts = new Map<string, DataConnection>();

  constructor(user: IUserProfile, db: AppDatabase) {
    super();
    this.online = false;
    this.user = user;
    this._db = db;

    //TODO connect several peers

    this._peer = new Peer(user.peerid, {
      host: 'peer.pm',
      port: 999,
      path: '/',
      secure: true,
      key: 'volakey',
      debug: 1,
    });
    this._peer.on('open', (pid) => {
      console.log('Peer connected: ' + this._peer.id);
      if (pid !== user.peerid) {
        throw Error('Signaller assigned different id: ' + pid);
      }
      this.emit('statusChange', true);
      this._db.contacts.each((contact: IContact) => {
        this._initiateConnection(contact);
      });
    });
    this._peer.on('connection', async (conn: DataConnection) => {
      conn.on('open', async () => {
        console.debug('Connection open', conn);
        if (await this._hasValidSignatureMetadata(conn)) {
          this._acceptTrustedConnection(conn).then((ctc) => {
            this.handleOnConnectionData(conn, ctc);
          });
        } else {
          console.warn('Invalid signature, closing connection.', conn);
          conn.close();
        }
      });
    });
    this._peer.on('disconnected', () => {
      console.warn('Peer disconnected.');
      this.emit('statusChange', false);
      setTimeout(() => this._peer.reconnect(), RECONNECT_TIMEOUT);
    });
    this._peer.on('close', () => {
      console.warn('Peer closed.');
      this.emit('statusChange', false);
    });

    this._peer.on('error', (err) => {
      if (err.toString().includes('Could not connect to peer')) {
        console.warn('Peer unavailable. Should try again later...');
      } else {
        this.emit('statusChange', false);
        console.warn('error name: ' + err.name, err);
      }
    });
  }

  /**
   * Received connection open from someone. Validate his signature first.
   * Requester must have signed a message containing this user's peerid
   * @param {*} conn
   */
  async _hasValidSignatureMetadata(conn: DataConnection) {
    const md: IConnectionMetadata = conn.metadata;
    if (!md) return false;
    const pubKey = peerIdToPublicKey(conn.peer);
    const contactPubKey = await importPublicKey(pubKey);
    const sigDecoded = new Uint8Array(JSON.parse(md.signature)).buffer;
    return verifyMessage(this.user.peerid, sigDecoded, contactPubKey);
  }

  /**
   * Incoming connection with valid signature, find the contact or create a new one
   */
  async _acceptTrustedConnection(conn: DataConnection) {
    const contact = await this._db.contacts.get(conn.peer);
    if (!contact) {
      /* New user trying to connect.
       * Save for now, notify, user will decide to accept
       */
      const sig = await genSignature(conn.peer, this.user.privateKey);

      const newContact: IContact = {
        peerid: conn.peer,
        signature: sig,
        nickname: conn.metadata.nickname,
        avatar: conn.metadata.avatar,
        dateCreated: new Date(),
      };
      await this._db.contacts.add(newContact);
      console.info('Emitting onNewContact request!', newContact);
      this.emit('onNewContact', newContact);
      //TODO keep connection open?
      conn.close();
      return newContact;
    } else {
      console.info('Emitting onContactOnline', contact, conn);
      this.emit('onContactOnline', contact);
      return this._receiveRegisteredContact(contact, conn);
    }
  }

  /**
   * Known contact incoming. Update his metadata, and Validate if we have 1. accepted 2. not declined.
   */
  _receiveRegisteredContact(contact: IContact, conn: DataConnection) {
    const md: IConnectionMetadata = conn.metadata;
    contact.nickname = md.nickname;
    contact.avatar = md.avatar;
    this._db.contacts.put(contact);
    console.debug('Updated metadata', contact);
    if (!contact.dateAccepted) {
      console.info('Unaccepted contact trying to connect. Closing connection', contact, conn);
      conn.close();
    } else if (contact.dateDeclined) {
      console.warn('Declined contact trying to connect. Closing connection.', contact, conn);
      conn.close();
    } else {
      //conn.send('Hi ' + contact.nickname + ', ' + this.user.nickname + ' is online!');
      this.connectedContacts.set(contact.peerid, conn);
      console.info('Accepted connection from known peer', contact, conn);
    }
    return contact;
  }

  async _receiveMessageData(msg: string, contact: IContact) {
    console.debug('Persist message', msg);
    const justNow = new Date();
    const m: IMessage = {
      dateCreated: justNow,
      dateSent: justNow,
      dateReceived: justNow,
      receiver: this.user.peerid,
      sender: contact.peerid,

      payload: msg,
    };
    m.id = await this._db.messages.put(m);
    console.debug('Emitting onMessage', msg);
    this.emit('onMessage', m);
  }

  /**
   * Start a new connection request handshake with contact, sending user's'
   * Public info and the signature to other peer for validation.
   * @param {*} contact
   */

  _initiateConnection(contact: IContact) {
    if (contact.dateDeclined) {
      console.debug(
        'Not initiating connection with declined contact: ' + contact.nickname,
        contact
      );
      return;
    }
    if (!contact.dateAccepted) {
      console.debug(
        'Not initiating connection with not yet accepted contact: ' + contact.nickname,
        contact
      );
      return;
    }
    if (!contact.signature) {
      console.debug('Not initiating connection without signature: ' + contact.nickname, contact);
      return;
    }

    const connection = this._peer.connect(contact.peerid, {
      metadata: {
        signature: JSON.stringify(Array.from(new Uint8Array(contact.signature))),
        nickname: this.user.nickname,
        avatar: this.user.avatar,
        dateRegistered: this.user.dateRegistered,
        peerid: this.user.peerid,
      },
    });
    connection.on('open', () => {
      console.info('Connected with: ' + contact.nickname, connection);
      this.connectedContacts.set(contact.peerid, connection);
      this.emit('onContactOnline', contact);
      this.handleOnConnectionData(connection, contact);
    });

    return connection;
  }

  handleOnConnectionData(connection: DataConnection, c: IContact) {
    connection.on('data', (data) => {
      console.info(`received DATA:` + data);
      const dataDecoded = JSON.parse(data);
      const key = generateKeyFromString('1234');
      const decryptedString = decryptString(dataDecoded, key);
      this._receiveMessageData(decryptedString, c);
    });
  }

  checkConnection(contact: IContact) {
    const conn = this.connectedContacts.get(contact.peerid);
    return (conn && conn.open) || false;
  }

  async sendMessage(text: string, contactId: string) {
    const msg: IMessage = {
      dateCreated: new Date(),
      receiver: contactId,
      payload: text,
      sender: this.user.peerid,
    };
    msg.id = await this._db.messages.put(msg);
    console.debug('New message saved', msg);

    const conn = this.connectedContacts.get(contactId);

    if (conn && conn.open) {
      console.info('Sending message: ' + text + ' to: ' + contactId);

      //TODO exchange key
      const key = generateKeyFromString('1234');
      const stringToEncrypt = encryptString(text, key);

      conn.send(JSON.stringify(stringToEncrypt));
      msg.dateSent = new Date();
      this._db.messages.put(msg);
      console.info('Message delivered: ' + text + ' to: ' + contactId);
    } else {
      console.info('Receiver is not connected...');
    }
    return msg;
  }

  isConnectedWith(contact: IContact) {
    const conn = this.connectedContacts.get(contact.peerid);
    return conn && conn.open;
  }

  disconnectFrom(contact: IContact) {
    const conn = this.connectedContacts.get(contact.peerid);
    if (conn && conn.open) conn.close();
  }
}
