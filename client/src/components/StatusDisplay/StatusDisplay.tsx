/** @jsxImportSource @emotion/react */

import { PeerContext } from 'providers/PeerProvider';
import { identicon } from 'minidenticons';

import PersonAddIcon from '@mui/icons-material/PersonAdd';

import { useContext, useEffect, useState } from 'react';
import { UserContext } from 'providers/UserProvider';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import { Box } from '@mui/material';
import { DatabaseContext } from 'providers/DatabaseProvider';
import CalleeComponent from 'pages/Messages/CalleeComponent';

const StatusDisplay = () => {
  const userCtx = useContext(UserContext);

  const db = useContext(DatabaseContext);
  const peerCtx = useContext(PeerContext);

  const [online, setOnline] = useState(false);

  const [contactRequests, setContactRequests] = useState(db?.selectUnacceptedContacts().count());

  useEffect(() => {
    if (!peerCtx) return;
    function handleStatusChange(status: boolean) {
      //alert('Status change;' + status);
      setOnline(status);
    }

    peerCtx.on('statusChange', handleStatusChange);

    return () => {
      peerCtx.removeListener('statusChange', handleStatusChange);
    };
  }, [peerCtx]);

  function myPeerid() {
    return peerCtx?._peer.id ? peerCtx._peer.id : '123';
  }

  const UserInfo = () => {
    return !userCtx.user ? <>Not logged in</> : <>{userCtx.user?.nickname}</>;
  };

  const ContactRequestInfo = () => {
    return (
      <>
        <PersonAddIcon />
      </>
    );
  };

  const PeerInfo = () => {
    return (
      <>
        <Avatar
          src={`data:image/svg+xml;utf8,${identicon(myPeerid())}`}
          alt={`${userCtx?.user?.nickname} 's personsal identification icon`}
        />
        <Badge
          color={online ? 'success' : 'error'}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
        >
          <Avatar
            src={userCtx?.user?.avatar}
            alt={`${userCtx?.user?.nickname} 's personsal identification icon`}
          />
        </Badge>
      </>
    );
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'stretch',
          // alignItems: 'flex-start',
          //justifyContent: 'left',
        }}
      >
        <CalleeComponent />
        <ContactRequestInfo />
        <UserInfo />
        <PeerInfo />
      </Box>
    </>
  );
};

export default StatusDisplay;
