import { Button, Typography } from '@mui/material';
import MouseTracker from 'components/Example/MouseTracker';
import TicTacToe from 'components/Example/TicTacToe';
import Invite from 'components/Invite/Invite';
import ContactList from 'pages/Contacts/ContactList';
import { UserContext } from 'providers/UserProvider';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { State } from 'store/rootReducer';
import { incrementCounter } from 'store/slices/counterSlice';

const ContactsPage = () => {
  const usrCtx = React.useContext(UserContext);

  const dispatch = useDispatch();

  return (
    <>
      <Typography gutterBottom>Contacts</Typography>
      <ContactList></ContactList>
    </>
  );
};

export default ContactsPage;
