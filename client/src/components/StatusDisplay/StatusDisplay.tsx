import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Tooltip } from '@mui/material';
import { UserContext } from '../../providers/UserProvider';
import { PeerContext } from '../../providers/PeerProvider';
import CalleeComponent from '../../pages/Messages/CalleeComponent';
import Identification from 'components/Identification/Identification';
import ContactRequestsButton from 'components/AppBar/ContactRequestsButton';
import { requestFollowMe } from 'util/Widgets/LocationInfo';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationOffIcon from '@mui/icons-material/LocationOff';

const StatusDisplay = () => {
  const peerCtx = useContext(PeerContext);
  const userCtx = useContext(UserContext);
  const navigate = useNavigate();
  const [online, setOnline] = useState(false);

  const [currentPosition, setCurrentPosition] = useState<GeolocationCoordinates | null>();

  useEffect(() => {
    async function fetchData() {
      const currentCoords = await requestFollowMe();
      console.debug('Current coords', currentCoords);
      setCurrentPosition(currentCoords);
    }
    fetchData();
  }, []);

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

  const PeerInfo = () => {
    return (
      <Box
        onClick={() => {
          return navigate('/AccountSetup');
        }}
      >
        <Identification
          id={userCtx?.user?.peerid}
          status={online}
          name="Your"
          avatar={userCtx?.user?.avatar}
          badgeCnt={0}
        />
      </Box>
    );
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'stretch',
          // alignItems: 'flex-start',
          justifyContent: 'space-around',
        }}
      >
        <CalleeComponent />
        <ContactRequestsButton />
        <PeerInfo />

        <Tooltip title={'GPS ' + (currentPosition ? 'enabled' : 'disabled')}>
          {currentPosition ? <LocationOnIcon /> : <LocationOffIcon></LocationOffIcon>}
        </Tooltip>
      </Box>
    </>
  );
};

export default StatusDisplay;
