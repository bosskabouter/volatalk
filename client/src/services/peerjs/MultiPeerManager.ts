import { StrictEventEmitter } from 'strict-event-emitter';

import { IContact, IContactResume, IMessage, IUserProfile } from '../../types';
import { AppDatabase } from '../../Database/Database';
import { generateSignature, peerIdToPublicKey, verifyMessage } from '../crypto/CryptoService';

import { default as Peer, DataConnection, MediaConnection } from 'peerjs';
import { decryptString, encryptString, generateKeyFromString } from 'dha-encryption';
import pushMessage from '../push/PushMessage';
import { verifyAddress } from '../UserService';
import { PeerManager } from './PeerManager';


/**
 * Stateful module class to hook into react peerprovider. React components can listen to events fired through PeerManagerEvents
 */
export class MultiPeerManager extends PeerManager {

  constructor(user: IUserProfile, db: AppDatabase) {
  super(user,db)
  }
}
