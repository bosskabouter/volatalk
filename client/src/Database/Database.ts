import Dexie from 'dexie';
import { IContact, IMessage, IUserProfile } from '../types';
const tableUser = 'userProfile';
const tableContacts = 'contacts';
const tableMessages = 'messages';

export const DB_CURRENT_VERSION = 11;

export class AppDatabase extends Dexie {
  userProfile: Dexie.Table<IUserProfile, number>;

  contacts: Dexie.Table<IContact, string>;

  messages: Dexie.Table<IMessage, number>;

  constructor() {
    super('appDatabase');
    this.version(DB_CURRENT_VERSION).stores({
      userProfile: '++id',
      contacts: 'peerid , dateTimeAccepted, dateTimeDeclined',
      messages:
        '++id, sender, receiver, dateTimeCreated, [sender+dateTimeRead], [receiver+dateTimeSent]',
    });

    this.userProfile = this.table(tableUser);
    this.contacts = this.table(tableContacts);
    this.messages = this.table(tableMessages);
  }

  getContact(contactid: string) {
    return this.contacts.get(contactid);
  }

  selectContacts() {
    return this.contacts.orderBy('dateTimeDeclined').toArray();
  }

  selectUnacceptedContacts() {
    return this.contacts.where({ dateTimeAccepted: 0 });
  }

  selectUnreadMessages(contact: IContact) {
    return this.messages.where({ sender: contact.peerid, dateTimeRead: 0 });
  }
  selectMessages(contact: IContact): Promise<IMessage[]> {
    const contactId = contact.peerid;

    return this.messages
      .orderBy('dateTimeCreated')
      .filter((msg) => {
        return msg.sender === contactId || msg.receiver === contactId;
      })
      .toArray();

    //this where didnt work in encrypted db
    // .where('sender')
    // .equals(contactId)
    // .or('receiver')
    // .equals(contactId)
    //.sortBy('dateTimeCreated')
  }

  selectUnsentMessages(c: IContact) {
    return this.messages.where({ receiver: c.peerid, dateTimeSent: 0 }).sortBy('dateTimeCreated');
  }
  selectLastMessage(contact: IContact) {
    return this.messages
      .orderBy('dateTimeCreated')
      .filter((msg) => {
        return msg.sender === contact.peerid || msg.receiver === contact.peerid;
      })
      .last();
  }
}
