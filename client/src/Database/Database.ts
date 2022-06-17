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
    this.version(1).stores({
      userProfile: '++id',
      contacts: 'peerid , dateAccepted, dateDelined',
      messages:
        '++id, sender, receiver, dateCreated, dateSent, dateRead, ' +
        '[sender+dateRead],[receiver+dateSent]',
    });

    this.version(DB_CURRENT_VERSION)
      .stores({
        userProfile: '++id',
        contacts: 'peerid , dateTimeAccepted, dateTimeDeclined',
        messages:
          '++id, sender, receiver, dateTimeCreated, dateTimeSent, dateTimeRead, ' +
          '[sender+dateTimeRead],[receiver+dateTimeSent]',
      })
      .upgrade((trans) => {
        console.warn('Upgrading contacts table');
        return trans
          .table('contacts')
          .toCollection()
          .modify((contact) => {
            console.warn('Modifying contact', contact);

            contact.dateTimeCreated = contact.dateCreated ? contact.dateCreated.getTime() : 0;
            delete contact.dateCreated;

            contact.dateTimeAccepted = contact.dateAccepted ? contact.dateAccepted.getTime() : 0;
            delete contact.dateAccepted;

            contact.dateTimeDeclined = contact.dateDelined ? contact.dateDelined.getTime() : 0;

            delete contact.accepted;
            delete contact.declined;

            console.warn('Finished modify contact', contact);
          });
      })
      .upgrade((trans) => {
        console.warn('Upgrading messages table');

        return trans
          .table('messages')
          .toCollection()
          .modify((message) => {
            console.warn('Modifying message', message);
            message.dateTimeCreated = message.dateCreated ? message.dateCreated.getTime() : 0;
            delete message.dateCreated;

            message.dateTimeSent = message.dateSent ? message.dateSent.getTime() : 0;
            delete message.dateSent;

            message.dateTimeRead = message.dateRead ? message.dateRead.getTime() : 0;
            delete message.dateRead;
            console.warn('Finished Modifying message', message);
          });
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

  selectContacts() {
    return this.contacts.orderBy('dateTimeDeclined').toArray();
  }

  selectUnacceptedContacts() {
    return this.contacts.where({ dateTimeAccepted: 0 });
  }

  selectUnsentMessages(c: IContact) {
    return this.messages.where({ receiver: c.peerid, dateTimeSent: 0 }).sortBy('dateTimeCreated');
  }
  async selectLastMessage(contact: IContact): Promise<IMessage | null> {
    const msg: IMessage | undefined = await this.messages
      .where('sender')
      .equals(contact.peerid)
      .or('receiver')
      .equals(contact.peerid)
      .last();

    return msg ? msg : null;
  }
}
