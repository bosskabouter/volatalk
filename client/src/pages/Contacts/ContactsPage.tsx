import { Box, Button, ListSubheader, Stack, Typography } from '@mui/material';
import { useContacts } from 'providers/ContactsProvider';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactList from './ContactList';
import AddLinkIcon from '@mui/icons-material/AddLink';

const ContactsPage = () => {
  const contacts = useContacts().contacts;

  const navigate = useNavigate();

  // useEffect(() => {
  // }, [])

  const newContacts = contacts ? contacts.get('new') : [];
  const favoriteContacts = contacts ? contacts.get('fav') : [];
  const restContacts = contacts ? contacts.get('rest') : [];
  const blockedContacts = contacts ? contacts.get('block') : [];

  return (
    contacts && (
      <Stack
        direction={'column'}
        sx={{
          pt: 7,
        }}
      >
        <ContactList
          contacts={newContacts}
          subHeader={<ListSubheader>New Contact Requests</ListSubheader>}
        />
        <ContactList
          contacts={favoriteContacts}
          subHeader={<ListSubheader>Favorites</ListSubheader>}
        />
        <ContactList contacts={restContacts} subHeader={<ListSubheader>Contacts</ListSubheader>} />
        <ContactList
          contacts={blockedContacts}
          subHeader={<ListSubheader>Blocked</ListSubheader>}
        />

        <Box
          sx={{
            pt: 7,
            '& ul': { padding: 0 },
          }}
        >
          <Typography variant="h5">{contacts.size === 0 && 'No contacts yet'}</Typography>
          <Typography variant="button"></Typography>

          <Button onClick={() => navigate('/Invite')}>
            <AddLinkIcon />
            Invite someone!
          </Button>
        </Box>
      </Stack>
    )
  );
};

export default ContactsPage;
