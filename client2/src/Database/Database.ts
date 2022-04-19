import Dexie from 'dexie';

const table_name = 'userProfile';

// defines the interface for the db
export interface IUserProfile {
  id?: string;

  isSecured:boolean;
  pin: string;
  question1: string;
  answer1: string;
  question2: string;
  answer2: string;

  peerid:string;  
  privateKey:string;

  nickname:string;
  avatar:string;

  dateRegistered:Date;
}

export class AppDatabase extends Dexie {
  userProfile: Dexie.Table<IUserProfile, number>;

  constructor() {
    super('appDatabase');
    // Makes ID the only only index in the table indexable
    this.version(1).stores({
      userProfile: '++id',
    });

    this.userProfile = this.table(table_name);
  }
}
