import { PeerContext } from 'providers/PeerProvider';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { IContact } from 'types';

import { ContactListItem } from './ContactListItem';

import { useContext, useEffect, useState } from 'react';
import { Button, List, ListSubheader, Typography } from '@mui/material';
import { Box } from '@mui/system';

import { Navigate, useNavigate } from 'react-router-dom';
import AddLinkIcon from '@mui/icons-material/AddLink';

const ContactList = () => {
  const db = useContext(DatabaseContext);
  const peerManager = useContext(PeerContext);
  const [contactList, setContactList] = useState<IContact[]>([]);

  const navigate = useNavigate();
  useEffect(() => {
    db?.selectContacts().then((cts) => {
      setContactList(cts);
    });
  }, [db]);

  useEffect(() => {
    if (!peerManager) return;

    const updateContactList = (newContact: IContact) => {
      setContactList((prevCtcList) => [...prevCtcList, newContact]);
    };

    peerManager.addListener('onNewContact', updateContactList);

    return () => {
      peerManager.removeListener('onNewContact', updateContactList);
    };
  }, [contactList, peerManager]);

  return (
    <div>
      <div hidden={!(contactList.length > 0)}>
        <List
          sx={{
            width: '100%',
            bgcolor: 'background.paper',
            //  position: 'relative',
            //  overflow: 'auto',
            //  maxHeight: 300,
            // '& ul': { padding: 0 },
          }}
          // dense={true}
          subheader={
            <ListSubheader component="div" id="nested-list-subheader">
              Contact List
            </ListSubheader>
          }
        >
          {contactList.length > 0 &&
            contactList.map((contact) => {
              return <ContactListItem contact={contact} key={contact.peerid} />;
            })}
        </List>
      </div>

      <div hidden={contactList.length > 0}>
        <Box>
          <Typography variant="h5">No contacts yet</Typography>
          <Typography variant="button"></Typography>

          <Button onClick={() => navigate('/Invite')}>
            <AddLinkIcon />
            Invite someone!
          </Button>
        </Box>
      </div>
    </div>
  );
};
export default ContactList;
