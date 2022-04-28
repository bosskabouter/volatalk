import { UserContext } from 'providers/UserProvider';
import * as React from 'react';
import Geolocation from 'util/GeoLocation';

const Home = () => {
  const usrCtx = React.useContext(UserContext);

  return (
    <>
      Hi {usrCtx?.user?.nickname}
      <Geolocation></Geolocation>
    </>
  );
};

export default Home;
