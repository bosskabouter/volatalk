import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Badge, Box, Tooltip } from '@mui/material';
import { UserContext } from '../../providers/UserProvider';
import { PeerContext } from '../../providers/PeerProvider';
import CalleeComponent from '../../pages/Messages/CalleeComponent';
import Identification from 'components/Identification/Identification';
import ContactRequestsButton from 'components/AppBar/ContactRequestsButton';
import { PeerIdenticon } from './PeerIdenticon';

const PeerDisplay = () => {
  const peerCtx = useContext(PeerContext);
  const userCtx = useContext(UserContext);
  const navigate = useNavigate();
  const [status, setStatus] = useState(false);
  const [peerIdenticon, setPeerIdenticon] = useState('');

  useEffect(() => {
    if (userCtx?.user?.id && !peerIdenticon)
      setPeerIdenticon(PeerIdenticon({ peerid: userCtx.user.peerid }));
  }, [peerIdenticon, userCtx]);

  useEffect(() => {
    peerCtx?.on('statusChange', setStatus);
  }, [peerCtx]);

  return (
    <>
      <CalleeComponent />

      <Box>
        <Badge
          variant={'dot'}
          color={status ? 'success' : 'error'}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Tooltip title={status ? 'Online' : 'Offline'}>
            <Avatar src={peerIdenticon} sx={{ width: 36, height: 36, border: 3 }} />
          </Tooltip>
        </Badge>
      </Box>
    </>
  );
};

export default PeerDisplay;
