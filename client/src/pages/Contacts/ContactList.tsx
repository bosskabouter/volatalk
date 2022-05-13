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
  const [contactList, setContactList] = useState<IContact[]>([]);

  useEffect(() => {
    db?.contacts.toArray().then((cts) => {
      setContactList(cts);
    });
  }, [db]);

  useEffect(() => {
    if (!peerManager) return;
    const updateContactList = (newContactEvent: PeerManagerEvents['onNewContact']) => {
      contactList.push(newContactEvent.arguments);
      setContactList(contactList);
    };
    peerManager.addListener('onNewContact', updateContactList);
    return () => {
      peerManager.removeListener('onNewContact', updateContactList);
    };
  }, [contactList, peerManager]);

  return (
    <div>
      <List
        sx={{
          width: '100%',
          bgcolor: 'background.paper',
          position: 'relative',
          overflow: 'auto',
          maxHeight: 300,
          '& ul': { padding: 0 },
        }}
        dense={true}
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            Contact List
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
