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
      contacts: 'peerid , dateTimeAccepted, dateTimeDelined',
      messages:
        '++id, sender, receiver, dateTimeCreated, dateTimeSent, dateTimeRead, [sender+dateTimeRead],[receiver+dateTimeSent]',
    });

    this.userProfile = this.table(tableUser);
    this.contacts = this.table(tableContacts);
    this.messages = this.table(tableMessages);
  }

  async getContact(contactid: string) {
    const ctc = await this.contacts.get(contactid);
    if (ctc === undefined) throw Error('Unknown contact...' + contactid);
    return ctc;
  }
  selectUnreadMessages(contact: IContact) {
    //TODO include dataRead===0
    return this.messages.where({ sender: contact.peerid, dateTimeRead: 0 });
  }
  selectContactMessages(contact: IContact) {
    return this.messages
      .where('receiver')
      .equals(contact.peerid)
      .or('sender')
      .equals(contact.peerid)
      .sortBy('dateTimeCreated');
  }

  selectUnsentMessages(c: IContact): IMessage[] | PromiseLike<IMessage[]> {
    return this.messages.where({ receiver: c.peerid, dateTimeSent: 0 }).sortBy('dateTimeCreated');
  }
}
