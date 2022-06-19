import { useContext, useEffect, useState } from 'react';
import MoreOptionsIcon from '@mui/icons-material/MoreVert';

import {
  Box,
  css,
  Dialog,
  DialogContent,
  DialogContentText,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { DatabaseContext } from '../../providers/DatabaseProvider';
import { PeerContext } from '../../providers/PeerProvider';

import { descriptiveTimeAgo, round } from '../../services/Generic';
import { IContact, IMessage } from '../../types';
import Identification from 'components/Identification/Identification';
import { UserContext } from 'providers/UserProvider';
import Distance, { bearingFrom } from 'util/geo/Distance';
import { fetchLocationDescription, fetchLocationWeather } from 'services/LocationService';

import BearingIcon from '@mui/icons-material/North';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';

export const ContactItem = (props: { contact: IContact }) => {
  const { user } = useContext(UserContext);
  const peerMngr = useContext(PeerContext);
  const db = useContext(DatabaseContext);
  const [contact, setContact] = useState<IContact>(props.contact);

  const [cntUnread, setCntUnread] = useState<number>();

  const [online, setOnline] = useState(peerMngr?.isConnected(props.contact) || false);
  const [distance, setDistance] = useState('');
  const [bearing, setBearing] = useState(180);
  const [north, setNorth] = useState(0);
  const [location, setLocation] = useState<{
    city: string;
    state: string;
    country: string;
    flag: string;
  }>();
  const [weather, setWeather] = useState<{
    description: string;
    celcius: number;
    icon: string;
  }>();
  const lastTimeSeen = 'Seen: ' + descriptiveTimeAgo(new Date(contact.dateTimeResponded));

  const bearingStyle = {
    transform: 'rotate(' + bearing + north + 'deg)',
    //transition: 'transform 1500ms ease', // smooth transition
  };
  const compassStyle = {
    transform: 'rotate(' + north + 'deg)',
    //transition: 'transform 1500ms ease', // smooth transition
  };
  /**
   * Watch device orientation to follow contact location
   */
  useEffect(() => {
    function handleOrientation(ev: DeviceOrientationEvent) {
      ev.alpha && setNorth(ev.alpha);
    }
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  /**
   * Calculates distance from me in km, if coords are known.
   */
  useEffect(() => {
    if (!user?.position || !contact.position || distance) return;
    console.debug('useEffect distanceFromMe');
    const distanceFromMe = Distance(user.position, contact.position);
    setBearing(bearingFrom(user.position, contact.position));
    console.debug('Contact distance: ' + distanceFromMe);
    if (distanceFromMe) setDistance(`${round(distanceFromMe, 1)} km away.`);
    fetchLocationDescription(contact.position).then(setLocation);
    fetchLocationWeather(contact.position).then(setWeather);
  }, [contact, distance, user]);

  /**
   * Selects unread messages;
   */
  useEffect(() => {
    console.debug('usEffect unreadMessages');
    !cntUnread && db?.selectUnreadMessages(contact).count().then(setCntUnread);
  }, [db, contact, cntUnread]);

  /**
   * Receives handles events from peermanager;
   * 1. new messages, if from peer, add +1 to count unread
   * 2. status change; if from this contact, show peer on/offline
   */
  useEffect(() => {
    console.debug('useEffect messageHandler');

    function messageHandler(message: IMessage) {
      if (message.sender === contact.peerid) {
        console.log('Message received in messageHandler', message);
        setCntUnread((cntUnread ? cntUnread : 0) + 1);
      }
    }

    async function onContactStatusChangeHandle(statchange: { contact: IContact; status: boolean }) {
      if (statchange.contact.peerid === contact.peerid) {
        console.log('contactStatusHandler', statchange);
        setContact(statchange.contact);
        setOnline(statchange.status);
      }
    }

    if (!peerMngr) return;
    console.debug('useEffect onMessage/onContactChange');
    peerMngr.on('onMessage', messageHandler);
    peerMngr.on('onContactStatusChange', onContactStatusChangeHandle);

    return () => {
      peerMngr.removeListener('onMessage', messageHandler);
      peerMngr.removeListener('onContactStatusChange', onContactStatusChangeHandle);
    };
  }, [peerMngr, contact, cntUnread, online]);

  /**
   *
   * @returns
   */
  const MoreOptionsButton = () => {
    const [showOptions, setShowOptions] = useState(false);
    return (
      <>
        <IconButton
          onClick={(_e) => {
            //  e.preventDefault();
            setShowOptions(true);
          }}
        >
          <MoreOptionsIcon></MoreOptionsIcon>
        </IconButton>
        <Dialog open={showOptions} onClose={() => setShowOptions(false)}>
          <DialogContent>
            <DialogContentText>No options yet</DialogContentText>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        ///alignItems: 'baseline',
        //  overflow: 'hidden',

        //overflow: 'hidden',
        //width: 1,
        // height: 63,
        //padding: (theme) => theme.spacing(1),
      }}
    >
      <Box
        component="span"
        sx={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Identification
          id={contact.peerid}
          name={contact.nickname}
          avatar={contact.avatar}
          status={online}
          badgeCnt={cntUnread}
        ></Identification>
        <div>{north}</div>
        <MoreOptionsButton></MoreOptionsButton>
      </Box>

      <Box
        sx={{
          //username can move to bottom or disappear if to small
          display: 'flex',
          flexDirection: 'column',
          alignItems: { xs: 'left', md: 'flex-start' },
          //m: 3,
          border: 0,
          minWidth: 180,
        }}
      >
        <Typography variant="h6" sx={{ minWidth: 200, maxWidth: 200, border: 0 }}>
          {contact.nickname}
        </Typography>
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' } }}>
          <Typography variant="subtitle2" noWrap>
            <div>{lastTimeSeen}</div>
          </Typography>
          {distance && (
            <Typography variant="subtitle2" noWrap>
              <span>
                {distance}
                <BearingIcon style={bearingStyle} />
                <GpsNotFixedIcon style={compassStyle} />
              </span>
              <span>
                near {location?.city}
                {location?.flag}
              </span>
              <div>
                {weather?.description}, {weather?.celcius} ℃
              </div>
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};
