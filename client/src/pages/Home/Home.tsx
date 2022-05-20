import Typography from '@mui/material/Typography';
import ContactList from 'pages/Contacts/ContactList';
import { PeerContext } from 'providers/PeerProvider';

import * as React from 'react';
import logo2 from 'assets/svg/logo.svg';
import logo3 from '/safari-pinned-tab.svg';
const Home = () => {
  return (
    <>
      <ContactList />
    </>
  );
};

export default Home;
