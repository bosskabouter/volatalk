/** @jsxImportSource @emotion/react */

import { PeerContext } from 'providers/PeerProvider';
import { identicon } from 'minidenticons';

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
    function handleStatusChange(status: boolean) {
      //alert('Status change;' + status);
      setOnline(status);
    }
    peerCtx?.on('statusChange', handleStatusChange);

    return () => {
      peerCtx?.removeListener('statusChange', handleStatusChange);
    };
  }, [peerCtx, online]);

  function myPeerid() {
    return peerCtx?._peer.id ? peerCtx._peer.id : '123';
  }

  function userDiv() {
    return !userCtx.user ? (
      <div>Not logged in</div>
    ) : (
      <div className="userInfo">{userCtx.user?.nickname}</div>
    );
  }

  function peerDiv() {
    return (
      <Box
        className="peerInfo"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'left',
        }}
      >
        <Badge
          color={online?"success":"error"}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
        >
          <Avatar
            src={`data:image/svg+xml;utf8,${identicon(myPeerid())}`}
            alt={`${userCtx?.user?.nickname} 's personsal identification icon`}
          ></Avatar>
        </Badge>

        <Avatar
          src={userCtx?.user?.avatar}
          alt={`${userCtx?.user?.nickname} 's personsal identification icon`}
        ></Avatar>
      </Box>
    );
  }

  return (
    <div>
      {userDiv()} {peerDiv()}
    </div>
  );
};

export default StatusDisplay;
