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
        !contact.declined
          ? this.checkConnection(contact)
          : console.info('Not checking declined contact', contact);
      });
    });
    this._peer.on('connection', async (conn: DataConnection) => {
      conn.on('open', async () => {
        console.debug('Connection open', conn);
        if (await this._hasValidSignatureMetadata(conn)) {
          this._acceptTrustedConnection(conn).then((ctc) => {
            this.handleConnectionData(conn, ctc);
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
      if (err.type === 'peer-unavailable') {
        console.warn('Peer unavailable. Will try again later...', err);

        //TODO find peer id to reconnect
        //"Error: Could not connect to peer 7b0a2022637276223a2022502d333834222c0a2022657874223a20747275652c0a20226b65795f6f7073223a205b0a202022766572696679220a205d2c0a20226b7479223a20224543222c0a202278223a2022586f434b5278484e6230764c58437634695f5a42422d776c4d415277444d61714a6f74306d4d416b503268353430734859666a6d6239504269564438484d5843222c0a202279223a202235356552323878514a5179425235756a514c457049656a6978515550365244335749436c776c5f4764486149694c4f5443746d4730697856555f6d6172695230220a7d"
        const errMsg = err.toString();
        //errMsg.
        //"Error: Could not connect to peer "
        //   setTimeout(() => this._peer.reconnect(), RECONNECT_TIMEOUT);
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
   * Known contact incoming. Update his metadata, and Validate if we have 1. accepted 2. not declined.
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
      //conn.send('Hi ' + contact.nickname + ', ' + this.user.nickname + ' is online!');
      this.connectedContacts.set(contact.peerid, conn);
      console.info('Accepted connection from known peer', contact, conn);
    }
    return contact;
  }

  _receiveMessageData(msg: string, contact: IContact) {
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
    });
    this.handleConnectionData(connection, contact);
    return connection;
  }

  handleConnectionData(connection: DataConnection, c: IContact) {
    connection.on('data', (data) => {
      console.info(`received DATA:` + data);
      const dataDecoded = JSON.parse(data);
      this._receiveMessageData(dataDecoded, c);
    });
  }

  checkConnection(contact: IContact) {
    let conn = this.connectedContacts.get(contact.peerid);
    if (conn) {
      if (conn.open) {
        console.debug('Connection open with: ' + contact.nickname, contact);

        //TODO check unsent messages

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

      conn.send(JSON.stringify(text));
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
    const conn = this._peer.connections[contact.peerid];
    if (conn && conn.open) conn.close();
  }
}
