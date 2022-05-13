import Typography from '@mui/material/Typography';
import { PeerContext } from 'providers/PeerProvider';

import { UserContext } from 'providers/UserProvider';
import * as React from 'react';
import PeerMan2 from 'services/PeerMan2';

const Home = () => {
  const usrCtx = React.useContext(UserContext);
  const peer = React.useContext(PeerContext);

  const greeting = <Typography variant="h5">Hi {usrCtx?.user?.nickname}</Typography>;
  const peerMan = peer ? (
    <PeerMan2 peer={peer} user={usrCtx.user}></PeerMan2>
  ) : (
    <em>Not connected</em>
  );

  return (
    <>
      {greeting}
      {peerMan}
    </>
  );
};

export default Home;
