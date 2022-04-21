import { Button, Typography } from '@mui/material';
import TicTacToe from 'components/Example/TicTacToe';
import ContactList from 'pages/Contacts/ContactList';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { State } from 'store/rootReducer';
import { incrementCounter } from 'store/slices/counterSlice';

const Home = () => {
  const user = useSelector((state: State) => state.accountState.created);
  const dispatch = useDispatch();

  const handleIncrementClick = (event: React.ChangeEvent<unknown>) => {
    dispatch(incrementCounter());
  };

  return (
    <>
      <Typography gutterBottom>Redux Counter: {user.toString()}</Typography>
      <Button color="primary" onClick={handleIncrementClick} variant="contained">
        Increment
      </Button>

      <TicTacToe></TicTacToe>
      <ContactList></ContactList>
    </>
  );
};

export default Home;
