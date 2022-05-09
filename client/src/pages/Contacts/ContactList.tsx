import { PeerContext } from 'providers/PeerProvider';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { IContact } from 'types';

import { ContactListItem } from './ContactListItem';

import { useContext, useEffect, useState } from 'react';
import { List, ListSubheader } from '@mui/material';
import { PeerManagerEvents } from 'services/PeerManager';

const ContactList = () => {
  const db = useContext(DatabaseContext);
  const peerManager = useContext(PeerContext);
  const [contactList, setContactList] = useState<IContact[]>();

  useEffect(() => {
    if (db !== null && peerManager) {
      db.contacts.toArray().then((cts) => {
        setContactList(cts);
        cts.forEach((contact) => {
          peerManager?.checkConnection(contact);
        });
      });
    }
  }, [db, peerManager]);
  /*
  const updateContact = (event:PeerManagerEvents["onNewContact"]) => {
    const newContacts = contactList.map(c => {
      if (event[peerId] == c.peerId) {
        return { ...c, name: event.target.value}
      }
      return item;
    });
    setItems(newItems);
  }
  */
  return (
    <div>
      <List
        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
        dense={false}
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            Contacts
          </ListSubheader>
        }
      >
        {contactList &&
          contactList.map((contact) => {
            return <ContactListItem contact={contact} key={contact.peerid} />;
          })}
      </List>
    </div>
  );
};
export default ContactList;
