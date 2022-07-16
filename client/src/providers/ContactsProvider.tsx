/* eslint2-disable */
// @ts2-nocheck
import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { IContact, IContactClass } from 'types';
import { useDatabase } from './DatabaseProvider';
import { usePeerManager } from './PeerProvider';

export type IContactContext = {
  sortedContacts: Map<IContactClass, IContact[]>;
  setSortedContacts: (getContacts: Map<IContactClass, IContact[]>) => void;
};

export const ContactsContext = React.createContext<IContactContext>({
  sortedContacts: new Map(),
  setSortedContacts: () => {
    return;
  },
});
export type ContactsProviderProps = {
  defaultContacts?: Map<IContactClass, IContact[]>;
  children: ReactNode;
};

export const useContactsContext = () => useContext(ContactsContext);

const ContactsProvider: React.FC<ContactsProviderProps> = ({ children }) => {
  const db = useDatabase();
  const pm = usePeerManager();

  const [contacts, setContacts] = useState<IContact[]>([]);

  const [sortedContacts, setSortedContacts] = useState<Map<IContactClass, IContact[]>>(new Map());

  const contextValue = React.useMemo(
    () => ({
      sortedContacts,
      setSortedContacts,
    }),
    [sortedContacts, setSortedContacts]
  );

  /**
   * Load all contacts
   */
  useEffect(() => {
    db && db.selectContacts().then(setContacts);
  }, [db]);

  /**
   * New incoming Contact Request effect
   */
  useEffect(() => {
    if (!pm || !db) return;

    function handleNewContact(contact: IContact) {
      console.debug('New Contact Connected!', contact);
      db?.selectContacts().then(setContacts);
    }
    const handleContactStatusChange = (statchange: { contact: IContact; status: boolean }) => {
      db.selectContacts().then(setContacts);
    };

    pm.addListener('onNewContact', handleNewContact);
    pm.addListener('onContactStatusChange', handleContactStatusChange);
    return () => {
      pm.removeListener('onNewContact', handleNewContact);
      pm.removeListener('onContactStatusChange', handleContactStatusChange);
    };
  }, [db, pm]);

  /**
   * Order contacts by current status
   */
  useEffect(() => {
    if (!contacts) return;
    const m = new Map<IContactClass, IContact[]>();

    m.set('new', []);
    m.set('wait', []);
    m.set('block', []);
    m.set('fav', []);
    m.set('rest', []);

    contacts.forEach((c) => {
      if (c.dateTimeAccepted === 0) {
        m.get('new')?.push(c);
      } else if (c.dateTimeResponded === 0) {
        m.get('wait')?.push(c);
      } else if (c.dateTimeDeclined > 0) {
        m.get('block')?.push(c);
      } else if (c.favorite) {
        m.get('fav')?.push(c);
      } else {
        m.get('rest')?.push(c);
      }
    });
    console.debug('selectCategorizedContacts', m);

    setSortedContacts(m);
  }, [contacts]);

  return <ContactsContext.Provider value={contextValue}>{children}</ContactsContext.Provider>;
};

export default ContactsProvider;
