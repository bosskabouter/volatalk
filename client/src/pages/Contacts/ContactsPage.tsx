import { Box, Button, ListSubheader, Stack, Typography } from '@mui/material';
import {  useContactsContext } from 'providers/ContactsProvider';
import { useNavigate } from 'react-router-dom';
import ContactList from './ContactList';
import AddLinkIcon from '@mui/icons-material/AddLink';
import { IContact, IContactClass } from 'types';

const ContactsPage = () => {
  const contacts = useContactsContext()?.sortedContacts;

  const navigate = useNavigate();

  function getContactsInCategory(cat: IContactClass): IContact[] {
    const cts = contacts?.get(cat);
    return cts ? cts : [];
  }
  return (
    contacts && (
      <Stack
        direction={'column'}
        sx={{
          pt: 7,
        }}
      >
        <ContactList
          contacts={getContactsInCategory('new')}
          subHeader={<ListSubheader>New Contact Requests!</ListSubheader>}
        />
        <ContactList
          contacts={getContactsInCategory('unread')}
          subHeader={<ListSubheader>Unread</ListSubheader>}
        />
        <ContactList
          contacts={getContactsInCategory('fav')}
          subHeader={<ListSubheader>Favorites</ListSubheader>}
        />
        <ContactList
          contacts={getContactsInCategory('rest')}
          subHeader={<ListSubheader>Contacts</ListSubheader>}
        />
        <ContactList
          contacts={getContactsInCategory('block')}
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
