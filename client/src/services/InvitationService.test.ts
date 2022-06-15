import { IUserProfile } from 'types';
import { makeInviteURL } from './InvitationService';
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
test('makeInvite', async () => {
  // const url = await makeInviteURL(user, 'Halloo');
  // expect(url).toBeDefined();
  // expect(url.searchParams.getAll.length).toBeGreaterThanOrEqual(3);
});
