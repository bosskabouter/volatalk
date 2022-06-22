import { IContact } from 'types';
import { AppDatabase, DB_CURRENT_VERSION } from './Database';

const db = new AppDatabase();

export const aContact: IContact = {
  signature: '',
  dateTimeCreated: 0,
  dateTimeAccepted: 0,
  dateTimeDeclined: 0,
  dateTimeResponded: 0,
  peerid: '',
  dateRegistered: new Date(),
  nickname: 'test',
  avatar: '',
  avatarThumb: '',
  position: null,
  pushSubscription: null,
};

test('should create', async () => {
  expect(db).toBeDefined();
});
test('should insert aContact', async () => {
  //   const key = await db.contacts.add(aContact);
  //   expect(key).toBeDefined();
});
