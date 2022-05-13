import { IConnectionMetadata, IContact, IMessage, IUserProfile } from 'types';
import { AppDatabase } from 'Database/Database';
import { genSignature, importPublicKey, peerIdToPublicKey, verifyMessage } from './Crypto';

import EventEmitter from 'events';
import StrictEventEmitter from 'strict-event-emitter-types/types/src';
import { default as Peer, DataConnection } from 'peerjs';

export interface PeerManagerEvents {
  statusChange: (status: boolean) => void;
  onContactOnline: (contact: IContact) => void;
  onMessage: (message: IMessage) => void;
  onNewContact: (contact: IContact) => void;
}

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
        !contact.declined
          ? this.checkConnection(contact)
          : console.info('Not checking declined contact', contact);
      });
    });
    this._peer.on('connection', async (conn: DataConnection) => {
      conn.on('open', async () => {
        console.debug('Connection open', conn);
        if (await this._hasValidSignatureMetadata(conn)) {
          this._acceptTrustedConnection(conn);
        } else {
          console.warn('Invalid signature, closing connection.', conn);
          conn.close();
        }
      });
    });
    this._peer.on('disconnected', () => {
      console.warn('Peer disconnected.');
      this.emit('statusChange', false);
      setTimeout(() => this._peer.reconnect(), 15000);
    });
    this._peer.on('close', () => {
      console.warn('Peer closed.');
      this.emit('statusChange', false);
    });

    this._peer.on('error', (err) => {
      if (err.type === 'peer-unavailable') {
        console.warn('PEER UNREACHABLE:' + err);
      } else {
        this.emit('statusChange', false);
        console.warn(err);
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
      //just save for now, notify, user will decide to accept or not

      const sig = await genSignature(conn.peer, this.user.privateKey);

      const newContact: IContact = {
        peerid: conn.peer,
        signature: sig,
        nickname: conn.metadata.nickname,
        avatar: conn.metadata.avatar,
        dateCreated: new Date(),
        accepted: false,
        declined: false,
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
   * Known contact incoming. First Update his metadata, the Validate if we have 1. accepted 2. not declined.
   *
   *
   *
   */
  _receiveRegisteredContact(contact: IContact, conn: DataConnection) {
    const md: IConnectionMetadata = conn.metadata;
    contact.nickname = md.nickname;
    contact.avatar = md.avatar;
    this._db.contacts.put(contact);
    console.debug('Updated metadata', contact);
    if (!contact.accepted) {
      console.info('Unaccepted contact trying to connect. Closing connection', contact, conn);
      conn.close();
    } else if (contact.declined) {
      console.warn('Declined contact trying to connect. Closing connection.', contact, conn);
      conn.close();
    } else {
      conn.send('Hi!');
      console.info('Accepted known peer', contact, conn);
    }
    return contact;
  }

  _receiveMessageData(msg: string, contact: IContact) {
    console.debug('Persist message', msg);
    const m: IMessage = {
      dateCreated: new Date(),
      receiver: this.user.peerid,
      sender: contact.peerid,
      dateReceived: new Date(),
      payload: msg,
    };
    this._db.messages.put(m);
    console.debug('Emitting onMessage', msg);
    this.emit('onMessage', m);
  }

  /**
   * Start a new connection request handshake with contact, sending user's'
   * Public info and the signature to other peer for validation.
   * @param {*} contact
   */

  _initiateConnection(contact: IContact) {
    if (contact.declined) {
      console.debug(
        'Not initiating connection with declined contact: ' + contact.nickname,
        contact
      );
      return;
    }
    if (!contact.signature) {
      throw Error('No signature for contact: ' + contact.nickname);
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
    console.info('Trying to connecting with: ' + contact.nickname, connection);
    connection.on('open', () => {
      this.connectedContacts.set(connection.peer, connection);
      this.emit('onContactOnline', contact);
    });
    connection.on('data', (data) => {
      console.info(`received DATA message from contact:` + contact.nickname, data);
      this._receiveMessageData(data, contact);
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
        console.debug('Reopening connection with contact: ' + contact.nickname, contact);
        conn.close();
      }
    }
    console.info('Opening connection with contact: ' + contact.nickname, contact);
    conn = this._initiateConnection(contact);
    return conn && conn.open;
  }

  sendMessage(m: IMessage) {
    console.info('Sending message: ' + m.payload + ' to: ' + m.receiver);
    this.connectedContacts.get(m.receiver)?.send(m.payload);
  }

  isConnectedWith(contact: IContact) {
    const conn = this.connectedContacts.get(contact.peerid);
    return conn && conn.open;
  }


  disconnectFrom(contact: IContact) {
    const conn = this._peer.connections[contact.peerid];
    if (conn && conn.open) conn.close();
  }
}
