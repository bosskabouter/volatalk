import Typography from '@mui/material/Typography';
import { PeerContext } from 'providers/PeerProvider';

import { UserContext } from 'providers/UserProvider';
import * as React from 'react';
import PeerMan2 from 'services/PeerMan2';

const Home = () => {
  const usrCtx = React.useContext(UserContext);
  const peer = React.useContext(PeerContext);
  return !peer ? (
    <>Not connected</>
  ) : (
    <>
      <Typography variant="h5">Hi {usrCtx?.user?.nickname}</Typography>

      <PeerMan2 peer={peer} user={usrCtx.user}></PeerMan2>
    </>
  );
};

export default Home;
