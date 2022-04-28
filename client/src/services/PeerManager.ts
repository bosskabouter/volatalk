import { AppDatabase, IContact, IUserProfile } from 'Database/Database';

import Peer, { DataConnection } from 'peerjs';
import { DatabaseContext } from 'providers/DatabaseProvider';
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';

import {
  importPrivateKey,
  importPublicKey,
  peerIdToPublicKey,
  signMessage,
  verifyMessage,
} from './Crypto';
import { convertStr2ab } from './Generic';
import { UserContext } from 'providers/UserProvider';
import { PeerContext } from 'providers/PeerProvider';

const ERR_CONTACT_DECLINED_ = 403;

//const db = new AppDatabase();
interface PeerManagerProps {
  user: IUserProfile;
}
interface PeerManagerState {
  peer: Peer;
  connections: Map<string, DataConnection>;
  online: boolean;
}

export class PeerManager extends React.Component<PeerManagerProps, PeerManagerState> {
  //db = useContext(DatabaseContext);
  sometihing(s: string) {
    return s;
  }
  constructor(props: PeerManagerProps) {
    super(props);

    const connOpts = {
      host: 'volatalk.org',
      port: 443,
      path: '/peerjs',
      secure: true,
      key: 'pmkey',
      debug: 1,
    };

    console.debug(
      `Connecting to peerserver using ID and (options):`,
      this.props.user.peerid,
      connOpts
    );

    const myPeer = new Peer(this.props.user.peerid, connOpts);

    myPeer.on('open', (pid) => {
      //this.setState({ online: true });
      console.log('Online. ID: ' + pid);

      if (pid !== props.user.peerid) {
        throw Error('Broker assigned different id: ' + pid);
      }
    });
    myPeer.on('connection', (conn: DataConnection) => {
      conn.on('open', () => {
        console.log('Connection open', conn);
        try {
          this.receiveUnverifiedPeerConnection(conn);
        } catch (e) {
          console.error('Error receiving connection. Closing: ', conn, e);
          conn.close();
          throw e;
        }
      });
    });
    myPeer.on('disconnected', () => {
      this.setState({ online: false });
      console.warn('Peer disconnected.');
    });
    myPeer.on('close', function () {
      console.warn('Peer closed.');
    });

    myPeer.on('error', function (err) {
      if (err.type === 'peer-unavailable') {
        console.warn('PEER UNREACHABLE:' + err);
      } else {
        console.warn(err);
      }
    });



    this.state = { peer: myPeer, connections: new Map(), online: !myPeer.disconnected };


  }

  /**
   * Start a new connection request handshake with contact, sending user's'
   * Public info and the signature to other peer for validation.
   * @param {*} contact
   */
  initiateConnection(contact: IContact) {
    //do not send private key / passwordhash to other side

    const options = {
      metadata: {
        signature: JSON.stringify(contact.signature),
        nickname: JSON.stringify(this.props.user.nickname),
        avatar: JSON.stringify(this.props.user.avatar),
        dateRegistered: JSON.stringify(this.props.user.dateRegistered),
        peerid: JSON.stringify(this.props.user.peerid),
      },
    };

    const connection = this.state.peer.connect(contact.peerid, options);

    //this.state.connections.set(connection.peer, connection);

    connection.on('data', function (data) {
      console.debug('Connection ' + contact + ' Received DATA: ', data);
      // this.receiveMessage(data, contact);
    });
    console.debug('Connecting to: ' + connection.metadata, connection);
    return connection;
  }

  checkConnection(contact: IContact) {
    const conn = this.state.connections.get(contact.peerid);
    if (conn) {
      if (conn.open) {
        console.debug('Connection open with contact: ', contact.peerid);
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
    this.state.connections.get(contact.peerid)?.send(msg);
    //persistMessage(m);
  }

  isOnline() {
    try {
      return this.state.peer && !this.state.peer?.disconnected;
    } catch (error) {
      console.error('Peer offline: ' + error, error);
      return false;
    }
  }

  isConnectedWith(contact: IContact) {
    const conn = this.state.connections.get(contact.peerid);
    return conn && conn.open;
  }

  disconnectFrom(contact: IContact) {
    const conn = this.state.connections.get(contact.peerid);
    if (conn && conn.open) conn.close();
  }

  genSignature(peerid: string) {
    return importPrivateKey(JSON.parse(this.props.user.privateKey)).then((privKey) => {
      return signMessage(peerid, privKey);
    });
  }

  /**
   * Received connection open from someone. Validate his signature first.
   * @param {*} conn
   */
  receiveUnverifiedPeerConnection(conn: DataConnection) {
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
    } catch (error) {
      console.warn('No signature in metada. Aborting.', conn);
      conn.close();
      return;
    }
  }

  /**
   * Incoming connection with valid signature, find the contact
   */
  async acceptTrustedConnection(conn: DataConnection) {
    const contact = null; //await this.db?.contacts.get(conn.peer);

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
  acceptTrustedNewContact(conn: DataConnection) {
    const md = conn.metadata;
    const otherUser: IUserProfile = conn.metadata.userProfile;
    const contact: IContact = {
      peerid: conn.peer,
      signature: md.signature,
      nickname: otherUser.nickname,
      avatar: otherUser.avatar,
      dateCreated: new Date(),
      dateResponded: new Date(),
      accepted: true,
      declined: false,
    };
    //db.contacts.add(contact);
    alert('Contact added: ' + contact.nickname);
    //let's close for now and reestablish a connection from our side to send our signature
    conn.close();
  }

  /**
   * Contact is signature validated and known. Now Validate if we have accepted
   */
  receiveRegisteredContact(contact: IContact, conn: DataConnection) {
    contact.nickname = conn.metadata.nickname; //update user info
    //persistContact(contact);
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
    // let m = new Message(contact.peerid, msg, false, false);
    //persistMessage(m);
  }
}
