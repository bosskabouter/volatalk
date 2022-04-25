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
import Geolocation from 'util/GeoLocation';
import { WeatherInfo } from 'util/WeatherInfo';

const Home = () => {
  const usrCtx = React.useContext(UserContext);

  const dispatch = useDispatch();

  const handleIncrementClick = (event: React.ChangeEvent<unknown>) => {
    dispatch(incrementCounter());
  };

  return (
    <>
      <Typography gutterBottom>Hi {usrCtx?.user?.nickname}</Typography>
      You are home
      <Geolocation></Geolocation>

      <TicTacToe></TicTacToe>
      <MouseTracker />
    </>
  );
};

export default Home;
