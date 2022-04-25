import { Typography } from '@mui/material';
import MouseTracker from 'components/Example/MouseTracker';
import TicTacToe from 'components/Example/TicTacToe';
import { UserContext } from 'providers/UserProvider';
import * as React from 'react';
import Geolocation from 'util/GeoLocation';

const Home = () => {
  const usrCtx = React.useContext(UserContext);

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
