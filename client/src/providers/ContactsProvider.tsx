/* eslint-disable */
// @ts-nocheck
import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { IContact, IContactClass } from 'types';
import { useDatabase } from './DatabaseProvider';
import { usePeerManager } from './PeerProvider';

export type IContactContext = {
  contacts: Map<IContactClass, IContact[]>;
  setContacts: (getContacts: Map<IContactClass, IContact[]>) => void;
};

export const ContactsContext = React.createContext<IContactContext>({
  contacts: new Map(),
  setContacts: () => {
    return;
  },
});
export type ContactsProviderProps = {
  defaultContacts?: Map<IContactClass, IContact[]>;
  children: ReactNode;
};

export const useContacts = () => useContext(ContactsContext);

const ContactsProvider: React.FC<ContactsProviderProps> = ({ children }) => {
  const db = useDatabase();
  const peerManager = usePeerManager();

  const [contacts, setContacts] = useState<Map<IContactClass, IContact[]>>();

  /**
   * New incoming Contact Request effect
   */
  useEffect(() => {
    if (!peerManager) return;
    console.debug('useEffect handleNewContact');

    const handleNewContact = (newContact: IContact) => {
      setContactList((prevCtcList) => [...prevCtcList, newContact]);
    };
    peerManager.addListener('onNewContact', handleNewContact);
    return () => {
      peerManager.removeListener('onNewContact', handleNewContact);
    };
  }, [peerManager]);

  const contextValue = React.useMemo(
    () => ({
      contacts,
      setContacts,
    }),
    [contacts, setContacts]
  );

  useEffect(() => {
    async function loadContacts() {
      setContacts(await db?.selectCategorizedContacts());
    }
    loadContacts();
  }, [db]);

  return <ContactsContext.Provider value={contextValue}>{children}</ContactsContext.Provider>;
};

export default ContactsProvider;
