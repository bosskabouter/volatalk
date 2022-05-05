import { UserContext } from 'providers/UserProvider';
import * as React from 'react';
import PeerMan from 'services/PeerMan';
import Geolocation from 'util/GeoLocation';

const Home = () => {
  const usrCtx = React.useContext(UserContext);

  return (
    <>
      Hi {usrCtx?.user?.nickname}
      <Geolocation></Geolocation>
      <PeerMan></PeerMan>
    </>
  );
};

export default Home;
