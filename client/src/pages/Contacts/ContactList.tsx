import { PeerContext } from 'providers/PeerProvider';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { IContact } from 'types';

import { ContactListItem } from './ContactListItem';

import { useContext, useEffect, useState } from 'react';
import { Link, List, ListSubheader, Typography } from '@mui/material';
import { Box } from '@mui/system';
import Invite from 'components/Invite/Invite';

import AddLinkIcon from '@mui/icons-material/AddLink';

import {
  //Link,
  Link as RouterLink,
} from 'react-router-dom';

const ContactList = () => {
  const db = useContext(DatabaseContext);
  const peerManager = useContext(PeerContext);
  const [contactList, setContactList] = useState<IContact[]>([]);

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

      <div hidden={(contactList.length > 0)}>
        <Box>
          <Typography variant="h5">No contacts yet</Typography>
          <Typography variant="button">
            <Link component={RouterLink} to="/Invite">
              <AddLinkIcon />
              Invite someone!
            </Link>
          </Typography>
        </Box>
      </div>
    </div>
  );
};
export default ContactList;
