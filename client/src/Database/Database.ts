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
    //TODO REVIEW DB ENCRYPTION all indexed fields are visible. avoid including identifying info in indexes.. (contact.nickname, msg.payload etc.)
    this.version(2).stores({
      userProfile: '++id',
      contacts: 'peerid , dateAccepted, dateDelined',
      messages: '++id, sender, receiver, dateCreated, dateSent, dateRead, [sender+dateRead]',
    });

    this.userProfile = this.table(tableUser);
    this.contacts = this.table(tableContacts);
    this.messages = this.table(tableMessages);
  }

  cntUnreadMessages(contact: IContact) {
    return this.messages.where({ sender: contact.peerid }).count();
  }
  selectContactMessages(contact: IContact) {
    return this.messages
      .where('receiver')
      .equals(contact.peerid)
      .or('sender')
      .equals(contact.peerid)
      .sortBy('dateCreated');
  }
}
