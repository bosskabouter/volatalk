import { StrictEventEmitter } from 'strict-event-emitter';

import { IContact, IContactResume, IMessage, IUserProfile } from '../types';
import { AppDatabase } from '../Database/Database';
import { generateSignature, peerIdToPublicKey, verifyMessage } from './CryptoService';

import { default as Peer, DataConnection, MediaConnection } from 'peerjs';
import { decryptString, encryptString, generateKeyFromString } from 'dha-encryption';
import pushMessage from './PushMessage';
import { verifyAddress } from './UserService';

export interface PeerManagerEvents {
  statusChange: (status: boolean) => void;
  onContactStatusChange: (statchange: { contact: IContact; status: boolean }) => void;
  onMessage: (message: IMessage) => void;
  onNewContact: (contact: IContact) => void;
  onMessageDelivered: (message: IMessage) => void;
  onIncomingCall: (contact: IContact, mediaConnection: MediaConnection) => void;
}

//try reconnect with peerserver/other contact every RECONNECT_TIMEOUT seconds
const RECONNECT_TIMEOUT = 10 * 1000;

interface ConnectionMetadata {
  contactStringified: string;
  signature: string;
}
/**
 * Stateful module class to hook into react peerprovider. React components can listen to events fired through PeerManagerEvents
 */
export class PeerManager extends StrictEventEmitter<PeerManagerEvents> {
  #user: IUserProfile;
  #db: AppDatabase;
  #peer: Peer;

  /*
   * https://peerjs.com/docs/#peerconnections
   * We recommend keeping track of connections yourself rather than relying on this hash.
   */
  #connectedContacts = new Map<string /*peerid*/, DataConnection>();

  #calls = new Map<string /*peerid*/, MediaConnection>();

  #signalingServers = [
    {
      host: 'peer.pm',
      port: 999,
      path: '/',
      secure: true,
      key: 'volakey',
      debug: 1,

      //secure signature, does it arrive?
    },
    {
      //second volatalk instance
      host: 'volatalk.org',
      path: '/vtpeer',
      secure: true,
      key: 'pmkey',
      debug: 1,
    },
    {
      //default peerserver peerjs.org
      debug: 1,
    },
  ];
  #usingSignalingServer = this.#signalingServers[0];

  constructor(user: IUserProfile, db: AppDatabase) {
    if (!verifyAddress(user.peerid)) throw Error('Invalid peerID:' + user.peerid);

    super();
    this.#user = user;
    this.#db = db;

    //TODO connect several peers
    this.#peer = this.#initSignalingServer();
  }

  #initSignalingServer() {
    this.#peer = new Peer(this.#user.peerid, this.#usingSignalingServer);
    this.#peer.on('open', (pid) => {
      console.info('Peer connected', this.#peer.id);
      if (pid !== this.#user.peerid) {
        throw Error('Signaller assigned different id: ' + pid);
      }
      console.info('Emit statusChange ONLINE');
      this.emit('statusChange', true);
      this.#db.contacts.each((contact: IContact) => {
        console.info('Connecting contact', contact);
        this.connectContact(contact);
      });
    });
    this.#peer.on('connection', async (conn: DataConnection) => {
      conn.on('open', async () => {
        console.debug('Connection open', conn);
        const contact = await this.#contactConnected(conn);
        if (contact) {
          this.#handleConnection(conn, contact);
        } else {
          console.warn('Invalid signature, closing connection.', conn);
          conn.close();
        }
      });
    });
    this.#peer.on('call', async (mediaConnection: MediaConnection) => {
      //verify id someone legit is
      console.info('Someone calling', mediaConnection);
      const contact = await this.#contactConnected(mediaConnection);
      if (contact) {
        console.info(`Mom, ${contact.nickname} on the phone!`);
        this.#calls.set(contact.peerid, mediaConnection);
        this.emit('onIncomingCall', contact, mediaConnection);
      } else {
        console.warn('Invalid signature, closing connection.', mediaConnection);
        mediaConnection.close();
      }
    });
    this.#peer.on('disconnected', () => {
      console.warn(`this peer disconnected. Emit statusChange OFFLINE.`);
      this.emit('statusChange', false);
    });
    this.#peer.on('close', () => {
      console.warn('this peer closed. Emitting statusChange OFFLINE');
      this.emit('statusChange', false);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.#peer.on('error', (err: any) => {
      if (err.type === 'peer-unavailable') {
        console.warn('Contact unavailable. Try again later...');
      } else {
        if (err.type === 'invalid-id') {
          console.error('ID Invalid. ');
        } else if (err.type === 'unavailable-id') {
          console.error('UserID occupied on signaling server. ');
        } else {
          console.error('peer error: ' + err.name, err);
        }
        this.emit('statusChange', false);
        setTimeout(() => this.#initSignalingServer(), RECONNECT_TIMEOUT);
      }
    });

    return this.#peer;
  }
  /**
   * Validates signature on Received connection open request.
   * Requester must have sent ConnectionMetadata containing user info
   * and a signed message containing this user's peerid.
   *
   * If first time connection, create a contact, otherwise returns from db.
   * @param conn incoming, unverified connection
   * @returns connecting contact, if valid metadata present in connection, null if otherwise.
   */
  async #contactConnected(conn: DataConnection | MediaConnection): Promise<IContact | null> {
    const md: ConnectionMetadata = conn.metadata;
    if (!md) return null;
    const pubKey = await peerIdToPublicKey(conn.peer);

    const sigDecoded = new Uint8Array(JSON.parse(md.signature)).buffer;
    if (!pubKey || !sigDecoded) return null;
    return (await verifyMessage(this.#user.peerid, sigDecoded, pubKey))
      ? this.#acceptTrustedConnection(conn)
      : null;
  }

  /**
   * Incoming connection with valid signature, find the contact OR create a new one.
   */
  async #acceptTrustedConnection(conn: DataConnection | MediaConnection): Promise<IContact> {
    const contact = await this.#db.contacts.get(conn.peer);
    if (!contact) {
      const newContact = await this.#createNewContactFromTrustedConnection(conn);
      console.info('New contact saved. Emitting onNewContact', newContact);
      this.emit('onNewContact', newContact);
      //close this connection for now
      conn.close();
      //and reestablish sending our metadata
      this.connectContact(newContact);
      return newContact;
    } else {
      const updatedContact = this.#receiveRegisteredContact(contact, conn);
      console.debug('Emitting onContactStatusChange');
      this.emit('onContactStatusChange', { contact: updatedContact, status: true });
      return updatedContact;
    }
  }

  /**
   * New Contact connecting.
   * Generates a signature and save info from ConnectionMetadata.
   *
   * User will have to accept the contact before a connection can be established.
   *
   * @param conn  trusted connection with valid metadata
   * @returns the newly created contact with generated signature
   */
  async #createNewContactFromTrustedConnection(
    conn: DataConnection | MediaConnection
  ): Promise<IContact> {
    const sig = await generateSignature(conn.peer, this.#user.security.privateKey);

    const contactResume: IContactResume = JSON.parse(conn.metadata.contactStringified);
    const newContact: IContact = Object.assign(
      {
        dateTimeCreated: new Date().getTime(),
        dateTimeResponded: new Date().getTime(),
        dateTimeAccepted: 0,
        dateTimeDeclined: 0,
        signature: sig,
      },
      contactResume
    );

    this.#db.contacts.add(newContact);
    return newContact;
  }

  /**
   * Known contact incoming. Update his metadata, and Validate if we have 1. accepted 2. not declined.
   *
   * @param contact
   * @param conn
   * @returns
   */
  #receiveRegisteredContact(contact: IContact, conn: DataConnection | MediaConnection): IContact {
    const md: ConnectionMetadata = conn.metadata;
    //persist updated contact info
    //merge new profile info into existing contact
    const contactResume: IContactResume = JSON.parse(md.contactStringified);
    Object.assign(contact, contactResume);

    contact.dateTimeResponded = new Date().getTime();

    this.#db.contacts.put(contact);

    console.debug('contact updated', contact);
    if (contact.dateTimeAccepted === 0) {
      console.info(
        'Unaccepted contact trying to connect. <<SHOULD BE>> Closing connection for now.',
        contact,
        conn
      );

      //do not close connection while not proper accept screen
      //conn.close();
    } else if (contact.dateTimeDeclined !== 0) {
      console.warn('Declined contact trying to connect. I said no connection.', contact, conn);
      conn.close();
    } else {
      //conn.send('Hi ' + contact.nickname + ', ' + this.user.nickname + ' is online!');

      console.debug('Accepted connection from known peer', contact, conn);
    }
    return contact;
  }

  #handleConnection(connection: DataConnection, contact: IContact) {
    this.#connectedContacts.set(contact.peerid, connection);
    connection.on('data', (data) => {
      console.debug(`received DATA:` + data);
      if (typeof data === 'string') {
        const dataDecoded = JSON.parse(data);
        const key = generateKeyFromString('1234');
        const decryptedString = decryptString(dataDecoded, key);
        this.#handleMessageData(decryptedString, contact);

        //not that simple, or is it
        // connection.send("ok");
      } else {
        console.warn('received strange data object. Ignoring.', data);
      }
    });

    this.#syncUnsentMessages(contact);
  }

  async #handleMessageData(msg: string, contact: IContact): Promise<boolean> {
    const justNow = new Date();
    const m: IMessage = {
      dateTimePushed: 0,
      dateTimeCreated: justNow.getTime(),
      dateTimeSent: justNow.getTime(),
      dateTimeReceived: justNow.getTime(),
      receiver: this.#user.peerid,
      sender: contact.peerid,

      payload: msg,
      dateTimeRead: 0,
    };
    m.id = await this.#db.messages.put(m);

    console.debug('Persisted new message. Emitting onMessage', m);

    return m.id != null && this.emit('onMessage', m);
  }

  /**
   * Send all unsent messages (independent of push delivery).
   * @param c
   * @returns
   */
  async #syncUnsentMessages(c: IContact) {
    console.info('Sending unsent messages...');
    const unsentMsgs: IMessage[] = await this.#db.selectUnsentMessages(c);
    for (const msg of unsentMsgs) {
      this.#attemptTransmitMessage(msg);
    }
    return unsentMsgs;
  }

  /**
   *
   *
   * @param contact
   * @returns
   */
  #initConnectionMetadata(contact: IContact): ConnectionMetadata {
    //create shallow copy of this user as resume to send over, without the security details
    const { security, ...myResume } = this.#user;

    return {
      contactStringified: JSON.stringify(myResume),
      signature: contact.signature,
    };
  }

  /**
   * Public methods
   */
  /**
   *  Start a new connection request handshake with contact, sending user's'
   * Public info and our signature for the other peer for validation.
   * @param contact
   * @returns
   */
  connectContact(contact: IContact): DataConnection | null {
    if (contact.dateTimeDeclined !== 0) {
      console.debug(
        'Not initiating connection with declined contact: ' + contact.nickname,
        contact
      );
      return null;
    }

    const acceptUnaccepted = true; //always allow connection to be established, even if user didnt accept contact yet. Maybe get rid of this prop entirely
    if (!acceptUnaccepted && contact.dateTimeAccepted === 0) {
      //turned off, people couldnt find the 'Accept' button
      //TODO make new contact dialog
      console.debug(
        'Not initiating connection with not yet accepted contact: ' + contact.nickname,
        contact
      );
      return null;
    }
    if (!contact.signature || !contact.signature.length) {
      console.debug('Not initiating connection without signature: ' + contact.nickname, contact);
      return null;
    }

    /**
     * Sending (updated) personal user info (nick, avatar, etc.) in the fom of a contact within connection metadata to receiver.
     */
    const connection = this.#peer.connect(contact.peerid, {
      metadata: this.#initConnectionMetadata(contact),
    });
    connection.on('open', () => {
      console.info("connection.on('open', () =>", contact, connection);

      this.#handleConnection(connection, contact);

      this.emit('onContactStatusChange', { contact: contact, status: true });
    });
    connection.on('close', () => {
      console.info("connection.on('close', () => ", contact, connection);
      this.#connectedContacts.delete(contact.peerid);
      this.emit('onContactStatusChange', { contact: contact, status: false });
    });
    return connection;
  }

  /**
   * Composes an IMessage object, saves to db and tries to transmit the Message. If contact is not online, try to push the message, if he opted for this.
   * @param text text to be send to a contact.
   * @param contactId
   * @returns
   */
  async sendText(text: string, contact: IContact): Promise<IMessage> {
    const msg: IMessage = {
      dateTimeCreated: new Date().getTime(),
      receiver: contact.peerid,
      payload: text,
      sender: this.#user.peerid,
      dateTimePushed: 0,
      dateTimeSent: 0,
      dateTimeReceived: 0,
      dateTimeRead: 0,
    };
    msg.id = await this.#db.messages.add(msg);
    console.debug('New message saved', msg);

    this.#attemptTransmitMessage(msg).then(async (sent) => {
      //if not able to send directly, push and save for later syncing.
      //always push for test
      if (!sent) console.debug('Pushing anyway');
      const pushed = await pushMessage(msg, contact);
      msg.dateTimePushed = pushed;
      this.#db.messages.put(msg);
    });
    return msg;
  }

  /**
   *
   * @param msg
   * @returns true if receiver is connected and received the message, false otherwise
   */
  async #attemptTransmitMessage(msg: IMessage): Promise<boolean> {
    //TODO use contact sig to encrypt
    const stringToEncrypt = encryptString(msg.payload, generateKeyFromString('1234'));

    const conn = this.#connectedContacts.get(msg.receiver);
    return new Promise((resolve, _reject) => {
      if (conn && conn.open) {
        console.debug('Sending message', MessageEvent);

        conn.send(JSON.stringify(stringToEncrypt));
        msg.dateTimeSent = new Date().getTime();
        this.#db.messages.update(msg, ['dateTimeSent', msg.dateTimeSent]);
        this.emit('onMessageDelivered', msg);
        console.info('Message delivered.', msg);
        resolve(true);
      } else {
        console.info('Receiver is not connected...');
        resolve(false);
      }
    });
  }

  /**
   *
   * @returns Verifies if peer exists and is not disconnected
   */
  isOnline(): boolean {
    return this.#peer && !this.#peer.disconnected;
  }
  /* Just a quick test (without signature to see if peer is online)
   * once the  invitation is accepted, we'll reconnect with a real signature.
   * Other side will bounce and close since we didn't send signature.
   */
  isPeerOnline(peerid: string): Promise<boolean> {
    return new Promise((resolve, _reject) => {
      const conn = this.#peer.connect(peerid);
      if (!conn) resolve(false);

      conn.on('open', () => {
        conn.send('test. bye.');
        conn.close();
        resolve(true);
      });
    });
  }
  /**
   *
   * @param contact
   * @param localMediaStream
   * @returns
   */
  async call(
    contact: IContact,
    localMediaStream: MediaStream
  ): Promise<{ ms: MediaStream | null; mc: MediaConnection | null }> {
    return new Promise((resolve, _reject) => {
      console.debug('Calling contact', contact, localMediaStream);
      const mc = this.#peer.call(contact.peerid, localMediaStream, {
        metadata: this.#initConnectionMetadata(contact),
      });
      this.#calls.set(contact.peerid, mc);
      mc.on('stream', (ms: MediaStream) => {
        return resolve({ ms, mc });
      });

      mc.on('error', console.warn);
    });
  }

  /**
   * Accept the call from a waiting contact with local MediaStream.
   * @param contact
   * @param localMediaStream
   */
  async acceptCall(contact: IContact, localMediaStream: MediaStream): Promise<MediaStream> {
    return new Promise((resolve, reject) => {
      const mediaConnection = this.#calls.get(contact.peerid);
      if (mediaConnection) {
        mediaConnection.answer(localMediaStream); // Answer the call with an local A and/or V stream.
        mediaConnection.on('stream', (rms) => {
          console.debug('PeerManager answered and got a remote media stream', rms);
          resolve(rms);
        });
      } else reject('Cannot accept call. No remote MediaConnection (Contact not calling)');
    });
  }

  /**
   *
   * @param contact
   * @returns
   */
  disconnectCall(contact: IContact): boolean {
    const mediaConnection = this.#calls.get(contact.peerid);
    if (mediaConnection) {
      mediaConnection.close();
      console.info('Closed media Connection with contact', contact, mediaConnection);
    }
    return mediaConnection != null;
  }

  /**
   * Checks if connection exists and open with known contact
   * @param contact
   * @returns
   */
  isConnected(contact: IContact): boolean {
    const conn = this.#connectedContacts.get(contact.peerid);
    return (conn && conn.open) || false;
  }

  /**
   *
   * @param contact Disconnect connection with contact. Possibly after declining contact.
   */
  disconnectFrom(contact: IContact) {
    const conn = this.#connectedContacts.get(contact.peerid);
    if (conn && conn.open) conn.close();
  }

  /**
   * Gracefully disconnects from peerserver, after closing all connections with contacts.
   * TODO check say bye
   */
  disconnectGracefully() {
    console.warn('Disconnecting Peer Gracefully.');

    this.#connectedContacts.forEach((conn) => conn.close());
    this.#peer.destroy();
  }
}
