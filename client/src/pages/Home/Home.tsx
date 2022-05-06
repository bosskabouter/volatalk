import { UserContext } from 'providers/UserProvider';
import * as React from 'react';


const Home = () => {
  const usrCtx = React.useContext(UserContext);

  return (
    <>
      Hi {usrCtx?.user?.nickname}
     
    </>
  );
};

export default Home;
