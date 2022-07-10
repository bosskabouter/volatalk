import { ListSubheader, Stack } from '@mui/material';
import { useContacts } from 'providers/ContactsProvider';
import ContactList from './ContactList';

const ContactsPage = () => {
  const contacts = useContacts().contacts;

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
          subHeader={<ListSubheader>Contact Requests</ListSubheader>}
        />
        <ContactList
          contacts={favoriteContacts}
          subHeader={<ListSubheader>Favorites</ListSubheader>}
        />
        <ContactList
          contacts={restContacts}
          subHeader={<ListSubheader>Rest (Non blocked)</ListSubheader>}
        />
        <ContactList
          contacts={blockedContacts}
          subHeader={<ListSubheader>Blocked Contacts</ListSubheader>}
        />
      </Stack>
    )
  );
};

export default ContactsPage;
