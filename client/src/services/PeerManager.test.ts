globalThis.crypto = require('crypto').webcrypto;

import { IUserProfile } from 'types';
import { PeerManager } from './PeerManager';
import { generateKeyPair } from './CryptoService';
import { AppDatabase } from 'Database/Database';

test('Create PeerManager', async () => {
  const key = await generateKeyPair();
  const user: IUserProfile = {
    security: {
      pin: '1234',
      answer1: '1',
      answer2: '',
      isSecured: false,
      privateKey: '',
      question1: '',
      question2: '',
    },
    usePush: false,
    useGps: false,
    peerid: '12213232323284638946238946239846398364983264932649823648912412412124124124412124',
    dateRegistered: new Date(),
    nickname: '',
    avatar: '',
    avatarThumb: '',
    position: null,
    pushSubscription: null,
  };

  const pm = new PeerManager(user, new AppDatabase());
  expect(pm);
});
