import Dexie from 'dexie';
import { IContact, IContactClass, IMessage, IUserProfile } from '../types';
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

  /**
   *
   * @returns
   */
  async selectContacts() {
    return this.contacts.orderBy('dateTimeDeclined').toArray();
  }

  /**
   * All registered contacts categorized in four:
   * `'new' | 'block' | 'fav' | 'rest'`
   * @returns
   */
  async selectCategorizedContacts() {
    const m = new Map<IContactClass, IContact[]>();

    m.set('new', []);
    m.set('block', []);
    m.set('fav', []);
    m.set('rest', []);

    (await this.selectContacts()).forEach((c) => {
      if (c.dateTimeAccepted === 0) {
        m.get('new')?.push(c);
      } else if (c.dateTimeDeclined >= 0) {
        m.get('block')?.push(c);
      } else if (c.favorite) {
        m.get('fav')?.push(c);
      } else {
        m.get('rest')?.push(c);
      }
    });
    console.debug('selectCategorizedContacts', m);
    return m;
  }
  /**
   *
   * @returns
   */
  async selectContactsMap() {
    const m = new Map<string, IContact>();
    (await this.selectContacts()).forEach((c) => m.set(c.peerid, c));
    return m;
  }
  /**
   *
   * @returns
   */
  async selectUnreadContacts() {
    const allUnreadMessages = await this.messages.where({ dateTimeRead: 0 }).uniqueKeys((key) => {
      console.log('key ', key);
    });
    console.log('allUnreadMessages ', allUnreadMessages);

    return this.contacts.orderBy('dateTimeDeclined').toArray();
  }
  /**
   *
   * @param contact
   * @returns
   */
  selectUnreadMessages(contact: IContact) {
    return this.messages.where({ sender: contact.peerid, dateTimeRead: 0 });
  }
  /**
   *
   * @param contact
   * @returns
   */
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
