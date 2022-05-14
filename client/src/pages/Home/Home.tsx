import Typography from '@mui/material/Typography';
import ContactList from 'pages/Contacts/ContactList';
import { PeerContext } from 'providers/PeerProvider';

import * as React from 'react';

const Home = () => {
  return <ContactList />;
};

export default Home;
