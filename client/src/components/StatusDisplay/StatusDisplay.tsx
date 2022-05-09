/** @jsxImportSource @emotion/react */

import { PeerContext } from 'providers/PeerProvider';
import { identicon } from 'minidenticons';
import ICON_ONLINE from '@mui/icons-material/ConnectWithoutContactRounded';
import ICON_OFFLINE from '@mui/icons-material/CloudOffRounded';

import { useContext, useEffect, useState } from 'react';
import { UserContext } from 'providers/UserProvider';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import { Box } from '@mui/material';

const StatusDisplay = () => {
  const userCtx = useContext(UserContext);

  const peerCtx = useContext(PeerContext);

  const [online, setOnline] = useState(false);

  useEffect(() => {
    peerCtx?.on('statusChange', (status) => {
      setOnline(status);
    });

    return () => {
      console.log('When?');
    };
  }, [peerCtx]);

  function myPeerid() {
    return peerCtx?.peer.id ? peerCtx.peer.id : '123';
  }

  function OnlineDiv() {
    return online ? <ICON_ONLINE /> : <ICON_OFFLINE />;
  }

  function userDiv() {
    return !userCtx.user ? (
      <div>Not logged in</div>
    ) : (
      <div className="userInfo">{userCtx.user?.nickname}</div>
    );
  }

  function peerDiv() {
    return  (
      <Box className="peerInfo">
        <Badge
          color="info"
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
        >
          <Avatar
            src={`data:image/svg+xml;utf8,${identicon(myPeerid())}`}
            alt={`${userCtx?.user?.nickname} 's personsal identification icon`}
          ></Avatar>
        </Badge>

        <Badge
          color="primary"
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
        >
          <Avatar
            src={userCtx?.user?.avatar}
            alt={`${userCtx?.user?.nickname} 's personsal identification icon`}
          ></Avatar>
        </Badge>
        {OnlineDiv()}
      </Box>
    ) 
  }

  return (
    <div>
      {userDiv()} {peerDiv()}
    </div>
  );
};

export default StatusDisplay;
