import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
globalThis.crypto = require('crypto').webcrypto;

import { IUserProfile } from 'types';
import enrollUser, { verifyAddress } from './UserService';

export function aUser(): IUserProfile {
  return {
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
    peerid: '',
    dateRegistered: new Date(),
    nickname: '',
    avatar: '',
    avatarThumb: '',
    position: null,
    pushSubscription: null,
  };
}

test('Register User', async () => {
  const user = aUser();
  expect(await enrollUser(user));

  expect(user.security.privateKey).toBeDefined();
  expect(user.peerid.length).toBeGreaterThan(18);

  expect(await verifyAddress(user.peerid)).toBeTruthy();
});
test('verifyAddress(#invalid + user.peerid)).toBeFalsy()', async () => {
  const user = aUser();
  expect(await enrollUser(user));

  expect(user.security.privateKey).toBeDefined();
  expect(user.peerid.length).toBeGreaterThan(18);

  expect(await verifyAddress(user.peerid)).toBeTruthy();
  expect(await verifyAddress('#invalid' + user.peerid)).toBeFalsy();
});
