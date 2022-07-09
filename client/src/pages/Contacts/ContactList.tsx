import { useContext, useEffect, useState } from 'react';
import { Button, IconButton, List, ListSubheader, Typography } from '@mui/material';
import { Box } from '@mui/system';

import { useNavigate } from 'react-router-dom';
import AddLinkIcon from '@mui/icons-material/AddLink';
import NewContactRequestsIcon from '@mui/icons-material/AccessibilityNew';
import FavoritesOnlyContactIcon from '@mui/icons-material/StarBorderPurple500';
import FavoritesNotOnlyContactIcon from '@mui/icons-material/Star';
import { DatabaseContext } from '../../providers/DatabaseProvider';
import { PeerContext } from '../../providers/PeerProvider';
import { IContact } from '../../types';
import { ContactListItem } from './ContactListItem';
/**

 *
 * @returns List will all contacts. Enables the user to accept or decline, make a call and enter the messages page from a clicked contact.
 */
const ContactList = ({ filter }: { filter: 'new' | 'starred' | 'unread' | 'none' | undefined }) => {
  const db = useContext(DatabaseContext);
  const peerManager = useContext(PeerContext);
  const [contactList, setContactList] = useState<IContact[]>([]);

  const navigate = useNavigate();

  /**
   * Initial load all contacts effect
   */
  useEffect(() => {
    if (!db) return;
    console.debug('useEffect selectContacts' + filter);
    if (filter === 'new') db.selectUnacceptedContacts().toArray().then(setContactList);
    else if (filter === 'starred') db.selectFavoriteContacts().then(setContactList);
    else if (filter === 'unread') db.selectUnreadContacts().then(setContactList);
    else db.selectContacts().then(setContactList);
  }, [db, filter]);

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

  return contactList.length > 0 ? (
    <div>
      <List
        sx={{
          pt: 7,
          //pt: '5rem',
          //height: 1,
          // bgcolor: 'primary',
          //  position: 'relative',
          // overflow: 'scroll',
          //maxHeight: 1,
          '& ul': { padding: 0 },
        }}
        dense={true}
        subheader={<ContactListHeader />}
      >
        {contactList.map((contact) => {
          return <ContactListItem contact={contact} key={contact.peerid} />;
        })}
      </List>
    </div>
  ) : (
    <Box
      sx={{
        pt: 7,
        '& ul': { padding: 0 },
      }}
    >
      <Typography variant="h5">No contacts yet</Typography>
      <Typography variant="button"></Typography>

      <Button onClick={() => navigate('/Invite')}>
        <AddLinkIcon />
        Invite someone!
      </Button>
    </Box>
  );
};

const ContactListHeader = () => {
  //TODO create options for filtering

  return (
    <ListSubheader component="div" id="nested-list-subheader">
      <IconButton>
        <NewContactRequestsIcon></NewContactRequestsIcon>
      </IconButton>
      <IconButton>
        <FavoritesOnlyContactIcon></FavoritesOnlyContactIcon>
        <FavoritesNotOnlyContactIcon></FavoritesNotOnlyContactIcon>
      </IconButton>
    </ListSubheader>
  );
};
export default ContactList;
