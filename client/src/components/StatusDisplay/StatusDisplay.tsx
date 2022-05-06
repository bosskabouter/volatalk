/** @jsxImportSource @emotion/react */

import { PeerContext } from 'providers/PeerProvider';
import { identicon } from 'minidenticons';
import ICON_ONLINE from '@mui/icons-material/ConnectWithoutContactRounded';
import ICON_OFFLINE from '@mui/icons-material/CloudOffRounded';

import { useContext } from 'react';
import { UserContext } from 'providers/UserProvider';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import { Box } from '@mui/material';

const StatusDisplay = () => {
  const userCtx = useContext(UserContext);

  const peerCtx = useContext(PeerContext);

  function myPeerid() {
    return peerCtx?.id ? peerCtx.id : '123';
  }

  function online() {
    return peerCtx?.disconnected ? <ICON_OFFLINE /> : <ICON_ONLINE />;
  }

  function userDiv() {
    return !userCtx.user ? (
      <div>Not logged in</div>
    ) : (
      <div className="userInfo">{userCtx.user?.nickname}</div>
    );
  }

  function peerDiv() {
    return peerCtx?.isOnline() ? (
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
            src={`data:image/svg+xml;utf8,${userCtx?.user?.avatar}`}
            alt={`${userCtx?.user?.nickname} 's personsal identification icon`}
          ></Avatar>
        </Badge>
        {online()}
      </Box>
    ) : (
      <div>User without peer</div>
    );
  }

  return (
    <div>
      {userDiv()} {peerDiv()}
    </div>
  );
};

export default StatusDisplay;
