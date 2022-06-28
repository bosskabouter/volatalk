import { IUserProfile } from 'types';
import enrollUser, { verifyAddress } from './UserService';

export const aUser: IUserProfile = {
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

test('Register User', async () => {
  expect(await enrollUser(aUser));

  expect(aUser.security.privateKey).toBeDefined();
  expect(aUser.peerid.length).toBeGreaterThan(18);

  expect(await verifyAddress(aUser.peerid)).toBeTruthy();
});
test('verifyAddress(#invalid + user.peerid)).toBeFalsy()', async () => {
  expect(await enrollUser(aUser));

  expect(aUser.security.privateKey).toBeDefined();
  expect(aUser.peerid.length).toBeGreaterThan(18);

  expect(await verifyAddress(aUser.peerid)).toBeTruthy();
  expect(await verifyAddress('#invalid' + aUser.peerid)).toBeFalsy();
});
