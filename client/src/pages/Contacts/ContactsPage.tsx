import { Typography } from '@mui/material';
import ContactList from 'pages/Contacts/ContactList';
import * as React from 'react';

const ContactsPage = () => {
  return (
    <>
      <Typography gutterBottom>Contacts</Typography>
      <ContactList></ContactList>
    </>
  );
};

export default ContactsPage;
