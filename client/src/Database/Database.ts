import Dexie from 'dexie';
import { IContact, IMessage, IUserProfile } from 'types';

const tableUser = 'userProfile';
const tableContacts = 'contacts';
const tableMessages = 'messages';

export class AppDatabase extends Dexie {
  userProfile: Dexie.Table<IUserProfile, number>;

  contacts: Dexie.Table<IContact, string>;

  messages: Dexie.Table<IMessage, number>;

  constructor() {
    super('appDatabase');
    // Makes ID the only only index in the table indexable
    this.version(1).stores({
      userProfile: '++id',
      contacts: 'peerid, nickname',
      messages: '++id, sender, receiver, dateCreated, dateSent, dateRead',
    });

    this.userProfile = this.table(tableUser);
    this.contacts = this.table(tableContacts);
    this.messages = this.table(tableMessages);
  }
}
