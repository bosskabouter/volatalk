import { IUserProfile } from 'types';
import { extractInvite, makeInviteURL } from './InvitationService';
import enrollUser from './UserService';
import { aUser } from './UserService.test';

let url: URL;
let user: IUserProfile;
test('makeInvite', async () => {
  user = await enrollUser(aUser());
  url = await makeInviteURL(user, 'Halloo');
  expect(url).toBeDefined();
  expect(url.searchParams.set.length).toBeGreaterThanOrEqual(2);
});
test('extract Invite', async () => {
  const inviteBackAgain = await extractInvite(url.searchParams);
  expect(inviteBackAgain).toBeDefined();
  expect(inviteBackAgain?.peerid === user.peerid).toBeTruthy();
});
