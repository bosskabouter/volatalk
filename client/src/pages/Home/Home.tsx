import Typography from '@mui/material/Typography';

import { UserContext } from 'providers/UserProvider';
import * as React from 'react';

const Home = () => {
  const usrCtx = React.useContext(UserContext);
  return (<><Typography  variant="h1">Hi {usrCtx?.user?.nickname}</Typography></>);
};

export default Home;
