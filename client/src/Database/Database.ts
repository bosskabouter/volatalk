import Dexie from 'dexie';

const tableUser = 'userProfile';

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
const tableContacts = 'contacts';

export interface IContact {
  id?: string;

  peerid: string;
  nickname: string;
  dateCreated: Date;

  signature?: string;
  avatar?: string;

  dateResponded?: Date;

  accepted?: boolean;
  declined?: boolean;
}

export class AppDatabase extends Dexie {
  userProfile: Dexie.Table<IUserProfile, number>;

  contacts: Dexie.Table<IContact, number>;

  constructor() {
    super('appDatabase');
    // Makes ID the only only index in the table indexable
    this.version(1).stores({
      userProfile: '++id',
      contacts: '++id',
    });

    this.userProfile = this.table(tableUser);
    this.contacts = this.table(tableContacts);
  }
}
