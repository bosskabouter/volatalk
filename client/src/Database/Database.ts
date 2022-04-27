import Dexie from 'dexie';

const tableUser = 'userProfile';
const tableContacts = 'contacts';
const tableMessages = 'messages';

// defines the interface for the db
export interface IUserProfile {
  id?: string;

  isSecured: boolean;
  pin: string;
  question1: string;
  answer1: string;
  question2: string;
  answer2: string;

  peerid: string;
  privateKey: string;

  nickname: string;
  avatar: string;

  dateRegistered: Date;
}

export interface IContact {
  peerid: string;
  nickname: string;
  dateCreated: Date;

  signature: ArrayBuffer;
  avatar?: string;

  dateResponded?: Date;

  accepted?: boolean;
  declined?: boolean;
}
export interface IMessage {
  id?: string;

  sender: string;
  receiver: string;
  dateCreated: Date;
  dateSent: Date;
  dateReceived: Date;
  dateRead: Date;
}
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
