import { openDB } from 'idb';

const VERSION = 1;
const dbName = () => 'peerdb' + VERSION;

const OBS_CONTACTS = 'CONTACTS';
const OBS_CONTACTS_ID = 'peerid';
const OBS_CONTACTS_NICKNAME = 'user.nickname';

const OBS_MESSAGES = 'MESSAGES';

const dBase = openDB(dbName(), VERSION, {
  upgrade(db, oldVersion, newVersion, _transaction) {
    console.warn(`db needs upgrade from version [${oldVersion}] to version[${newVersion}]`);

    switch (oldVersion) {
      case oldVersion:
        // version 0 means no database; create it
        var objstContacts = db.createObjectStore(OBS_CONTACTS, {
          keyPath: OBS_CONTACTS_ID,
        });
        var objstMessages = db.createObjectStore(OBS_MESSAGES, {
          autoIncrement: true,
        });

        /**
         * Create an index to search contacts by nickname. We may have duplicates
         * so we can't use a unique index.
         */
        objstContacts.createIndex(OBS_CONTACTS_NICKNAME, OBS_CONTACTS_NICKNAME, {
          unique: false,
        });

        /**
         * FK to Contact's peerid
         */
        objstMessages.createIndex(OBS_CONTACTS_ID, OBS_CONTACTS_ID, {
          unique: false,
        });

        // Use transaction oncomplete to make sure the objectStore creation is
        // finished before adding data into it.
        objstContacts.transaction.oncomplete = (e) => {
          // Store values in the newly created objectStore.
          console.log('DB upgraded. ', e);
        };
        break;
      case VERSION:
        // client already has latest version?
        // update
        break;
      default:
        let msg = `Current DB unsupported version(${oldVersion})`;
        console.error(msg);
    }
  },
  blocked() {
    throw Error('Database blocked');
  },
  blocking() {
    throw Error('Database blocking');
  },
  terminated() {
    throw Error('Database Terminated');
  },
});

/**
 * @returns all registered contacts
 */
async function queryContacts() {
  let transaction = dBase.transaction(OBS_CONTACTS, 'readonly');
  let contactStore = transaction.objectStore(OBS_CONTACTS);
  return contactStore.getAll();
}

/**
 *
 * @param {*Contact} c
 */
function persistContact(c) {
  //park transient connection outside while persisting
  console.log('Persisting contact', c);
  let transaction = dBase.transaction(OBS_CONTACTS, 'readwrite');
  let contactStore = transaction.objectStore(OBS_CONTACTS);
  contactStore.put(c);
}

/**
 *
 * @param {*} peerid
 * @returns Contact with given peerid
 */
function loadContact(peerid) {
  console.debug('Loading contact', peerid);
  let contactObjectstore = dBase.transaction(OBS_CONTACTS, 'readonly').objectStore(OBS_CONTACTS);
  return contactObjectstore.get(peerid);
}

function queryMessages(contact) {
  let transaction = dBase.transaction(OBS_MESSAGES, 'readonly');
  let msgStore = transaction.objectStore(OBS_MESSAGES);

  if (!contact) {
    //TODO search unread
    //return msgStore.getAll();
  } else {
    return msgStore.index(OBS_CONTACTS_ID).openCursor(IDBKeyRange.only(contact.peerid));
  }
}

/**
 *
 * @param {*Message} c
 */
function persistMessage(m) {
  //park transient connection outside while persisting
  console.log('Persisting message', m);
  let transaction = dBase.transaction(OBS_MESSAGES, 'readwrite');
  let store = transaction.objectStore(OBS_MESSAGES);
  store.add(m);
}

export { persistContact, loadContact, queryContacts, persistMessage, queryMessages };
