import { ConnectionMetadata, IContact, IMessage, IUserProfile } from 'types';
import { AppDatabase } from 'Database/Database';
import { genSignature, importPublicKey, peerIdToPublicKey, verifyMessage } from './Crypto';

import EventEmitter from 'events';
import StrictEventEmitter from 'strict-event-emitter-types/types/src';
import { default as Peer, DataConnection, MediaConnection } from 'peerjs';
import { decryptString, encryptString, generateKeyFromString } from 'dha-encryption';
import { pushMessage } from './PushMessage';

export interface PeerManagerEvents {
  statusChange: (status: boolean) => void;
  onContactStatusChange: (statchange: { contact: IContact; status: boolean }) => void;
  onMessage: (message: IMessage) => void;
  onNewContact: (contact: IContact) => void;
  onMessageDelivered: (message: IMessage) => void;
  onIncomingMediaConnection: (mediaConnection: MediaConnection) => void;
}

//try reconnect with peerserver/other contact every RECONNECT_TIMEOUT seconds
const RECONNECT_TIMEOUT = 60 * 1000;

/**
 * Stateful module class to hook into react peerprovider. React components can listen to events fired through PeerManagerEvents
 */
export class PeerManager
  extends EventEmitter
  implements StrictEventEmitter<PeerManager, PeerManagerEvents>
{
  online: boolean;
  peerid: string;

  _user: IUserProfile;
  _db: AppDatabase;
  _peer: Peer;

  /*
   * https://peerjs.com/docs/#peerconnections
   * We recommend keeping track of connections yourself rather than relying on this hash.
   */
  _connectedContacts = new Map<string /*peerid*/, DataConnection>();

  constructor(user: IUserProfile, db: AppDatabase) {
    super();
    this.online = false;
    this._user = user;
    this._db = db;

    //TODO connect several peers
    this._peer = this.initPeer();
    this.peerid = this._peer.id;
  }

  initPeer() {
    this._peer = new Peer(this._user.peerid, {
      host: 'peer.pm',
      port: 999,
      path: '/',
      secure: true,
      key: 'volakey',
      debug: 1,
    });
    this._peer.on('open', (pid) => {
      console.log('Peer connected: ' + this._peer.id);
      if (pid !== this._user.peerid) {
        throw Error('Signaller assigned different id: ' + pid);
      }
      this.emit('statusChange', true);
      this._db.contacts.each((contact: IContact) => {
        this.initiateConnection(contact);
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
    this._peer.on('call', async (mediaConnection: MediaConnection) => {
      //verify id someone legit is

      this.emit('onIncomingMediaConnection', mediaConnection);
    });
    this._peer.on('disconnected', () => {
      console.warn(`this._peer.on('disconnected', () =>`);
      this.emit('statusChange', false);
    });
    this._peer.on('close', () => {
      console.warn("this._peer.on('close', () =>");
      this.emit('statusChange', false);
    });

    this._peer.on('error', (err) => {
      if (err.toString().includes('Could not connect to peer')) {
        console.warn('Peer unavailable. Should try again later...');
      } else {
        this.emit('statusChange', false);
        console.warn("this._peer.on('error', (err) => " + err.name, err);
        this.initPeer();
      }
    });

    return this._peer;
  }
  /**
   * Received connection open from someone. Validate his signature first.
   * Requester must have signed a message containing this user's peerid
   * @param {*} conn
   */
  async _hasValidSignatureMetadata(conn: DataConnection): Promise<boolean> {
    const md: ConnectionMetadata = conn.metadata;
    if (!md) return false;
    const pubKey = peerIdToPublicKey(conn.peer);
    const contactPubKey = await importPublicKey(pubKey);
    const sigDecoded = new Uint8Array(JSON.parse(md.signature)).buffer;
    return verifyMessage(this._user.peerid, sigDecoded, contactPubKey);
  }

  /**
   * Incoming connection with valid signature, find the contact or create a new one
   */
  async _acceptTrustedConnection(conn: DataConnection): Promise<IContact> {
    const contact = await this._db.contacts.get(conn.peer);
    if (!contact) {
      const newContact = await this._createNewContactFromTrustedConnection(conn);
      console.info('New contact saved. Emitting onNewContact', newContact);
      this.emit('onNewContact', newContact);
      //close this connection for now
      conn.close();
      //and reestablish sending our metadata
      this.initiateConnection(newContact);
      return newContact;
    } else {
      const updatedContact = this._receiveRegisteredContact(contact, conn);
      console.info('Emitting onContactStatusChange');
      this.emit('onContactStatusChange', { contact: updatedContact, status: true });
      return updatedContact;
    }
  }

  /**
   * New user connecting. Saves Contact info from ConnectionMetadata in db
   * @param conn
   * @returns
   */
  async _createNewContactFromTrustedConnection(conn: DataConnection): Promise<IContact> {
    /* New user trying to connect.
     * Save for now, notify, user will decide to accept
     */
    const sig = await genSignature(conn.peer, this._user.privateKey);

    const metaData: ConnectionMetadata = conn.metadata;

    const newContact = metaData.contact;
    //let user decide to accept or decline this new contact
    if (newContact.peerid !== conn.peer)
      throw Error('Contact sending different peerid in metadata');
    newContact.dateTimeCreated = new Date().getTime();
    newContact.dateTimeAccepted = 0;
    newContact.dateTimeDeclined = 0;
    newContact.signature = sig;

    this._db.contacts.add(newContact);
    return newContact;
  }
  /**
   * Known contact incoming. Update his metadata, and Validate if we have 1. accepted 2. not declined.
   */
  _receiveRegisteredContact(oldContact: IContact, conn: DataConnection): IContact {
    const md: ConnectionMetadata = conn.metadata;
    //persist updated contact info
    const updatedContact = md.contact;

    if (updatedContact.peerid !== oldContact.peerid) throw Error('Something fishy');

    //keep our signature
    updatedContact.signature = oldContact.signature;
    //keep our flags
    updatedContact.dateTimeAccepted = oldContact.dateTimeAccepted;
    updatedContact.dateTimeCreated = oldContact.dateTimeCreated;
    updatedContact.dateTimeDeclined = oldContact.dateTimeDeclined;

    updatedContact.dateTimeResponded = new Date().getTime();

    this._db.contacts.put(updatedContact);
    console.debug('contact updated', updatedContact);
    if (updatedContact.dateTimeAccepted === 0) {
      console.info(
        'Unaccepted contact trying to connect. Closing connection for now.',
        updatedContact,
        conn
      );
      conn.close();
    } else if (updatedContact.dateTimeDeclined !== 0) {
      console.warn('Declined contact trying to connect. I said no.', updatedContact, conn);
      conn.close();
    } else {
      //conn.send('Hi ' + contact.nickname + ', ' + this.user.nickname + ' is online!');
      this._connectedContacts.set(updatedContact.peerid, conn);
      console.info('Accepted connection from known peer', updatedContact, conn);
    }
    return updatedContact;
  }

  async _processMessageData(msg: string, contact: IContact): Promise<boolean> {
    console.debug('Persist message', msg);
    const justNow = new Date();
    const m: IMessage = {
      dateTimeCreated: justNow.getTime(),
      dateTimeSent: justNow.getTime(),
      dateTimeReceived: justNow.getTime(),
      receiver: this._user.peerid,
      sender: contact.peerid,

      payload: msg,
      dateTimeRead: 0,
    };
    m.id = await this._db.messages.put(m);
    console.debug('Emitting onMessage', m);

    return m.id != null && this.emit('onMessage', m);
  }

  /**
   * Start a new connection request handshake with contact, sending user's'
   * Public info and our signature for the other peer for validation.
   * @param {*} contact
   */

  initiateConnection(contact: IContact): DataConnection | null {
    if (contact.dateTimeDeclined !== 0) {
      console.debug(
        'Not initiating connection with declined contact: ' + contact.nickname,
        contact
      );
      return null;
    }
    if (contact.dateTimeAccepted === 0) {
      console.debug(
        'Not initiating connection with not yet accepted contact: ' + contact.nickname,
        contact
      );
      return null;
    }
    if (!contact.signature) {
      console.debug('Not initiating connection without signature: ' + contact.nickname, contact);
      return null;
    }

    /**
     * Sending (updated) personal user info (nick, avatar, etc.) in the fom of a contact within connection metadata to receiver.
     */
    const connMetada: ConnectionMetadata = {
      contact: {
        peerid: this._user.peerid,

        nickname: this._user.nickname,
        avatar: this._user.avatar,
        signature: new ArrayBuffer(0), //not mine

        //TODO ask if user accepts push messages from contact, oherwise dont share
        pushSubscription: this._user.pushSubscription,

        dateTimeCreated: new Date().getTime(),

        //requester can try to sent himself 'as accepted', receiver should reset and control himself.
        dateTimeAccepted: new Date().getTime(),
        //same for trying to reset declined
        dateTimeDeclined: 0,
        dateTimeResponded: 0,
      },
      signature: JSON.stringify(Array.from(new Uint8Array(contact.signature))),
    };
    const connection = this._peer.connect(contact.peerid, {
      metadata: connMetada,
    });
    connection.on('open', () => {
      console.info("connection.on('open', () =>", contact, connection);
      this._connectedContacts.set(contact.peerid, connection);

      this.emit('onContactStatusChange', { contact: contact, status: true });

      this.handleOnConnectionData(connection, contact);
    });
    connection.on('close', () => {
      console.info("connection.on('close', () => ", contact, connection);
      this._connectedContacts.delete(contact.peerid);
      this.emit('onContactStatusChange', { contact: contact, status: false });
    });
    return connection;
  }

  handleOnConnectionData(connection: DataConnection, c: IContact) {
    connection.on('data', (data) => {
      console.info(`received DATA:` + data);
      const dataDecoded = JSON.parse(data);
      const key = generateKeyFromString('1234');
      const decryptedString = decryptString(dataDecoded, key);
      this._processMessageData(decryptedString, c);

      //not that simple, or is it
      // connection.send("ok");
    });

    this.syncUnsentMessages(c);
  }

  async syncUnsentMessages(c: IContact) {
    console.info('Sending unsent messages...');
    const unsentMsgs: IMessage[] = await this._db.selectUnsentMessages(c);
    for (const msg of unsentMsgs) {
      this.attemptTransmitMessage(msg);
    }
    return unsentMsgs;
  }

  /**
   * Composes an IMessage object, saves to db and tries transmitMessage.
   * @param text text to be send to a contact.
   * @param contactId
   * @returns
   */
  async sendText(text: string, contact: IContact): Promise<IMessage> {
    const msg: IMessage = {
      dateTimeCreated: new Date().getTime(),
      receiver: contact.peerid,
      payload: text,
      sender: this._user.peerid,
      dateTimeSent: 0,
      dateTimeReceived: 0,
      dateTimeRead: 0,
    };
    msg.id = await this._db.messages.add(msg);
    console.debug('New message saved', msg);

    this.attemptTransmitMessage(msg).then((sent) => {
      !sent && pushMessage(msg, contact);
    });
    return msg;
  }

  async attemptTransmitMessage(msg: IMessage): Promise<boolean> {
    //TODO use contact sig to encrypt
    const stringToEncrypt = encryptString(msg.payload, generateKeyFromString('1234'));

    const conn = this._connectedContacts.get(msg.receiver);
    return new Promise((resolve, _reject) => {
      if (conn && conn.open) {
        console.info('Sending message', MessageEvent);

        conn.send(JSON.stringify(stringToEncrypt));
        msg.dateTimeSent = new Date().getTime();
        this._db.messages.put(msg);
        this.emit('onMessageDelivered', msg);
        console.info('Message delivered.', msg);
        resolve(true);
      } else {
        console.info('Receiver is not connected...');
        resolve(false);
      }
    });
  }
  /* Just a quick test (without signature to see if peer is online)
   * once the  invitation is accepted, we'll reconnect with a real signature.
   * Other side will bounce and close since we didn't send signature.
   */
  testPeerOnline(peerid: string): Promise<boolean> {
    return new Promise((resolve, _reject) => {
      const conn = this._peer.connect(peerid);
      if (!conn) resolve(false);

      conn.on('open', () => {
        conn.send('test. bye.');
        conn.close();
        resolve(true);
      });
    });
  }
  /**
   * Checks if connection exists and open with known contact
   * @param contact
   * @returns
   */
  checkConnection(contact: IContact): boolean {
    const conn = this._connectedContacts.get(contact.peerid);
    return (conn && conn.open) || false;
  }

  /**
   *
   * @param contact Disconnect connection with contact. Possibly after declining contact.
   */
  disconnectFrom(contact: IContact) {
    const conn = this._connectedContacts.get(contact.peerid);
    if (conn && conn.open) conn.close();
  }

  /**
   * Gracefully disconnects from peerserver, after closing all connections with contacts.
   * TODO check say bye
   */
  disconnectGracefully() {
    console.warn('Disconnecting Peer Gracefully.');

    this._connectedContacts.forEach((conn) => conn.close());
    this._peer.destroy();
  }
}
