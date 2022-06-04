import { useContext, useEffect, useState } from 'react';
import MoreOptionsIcon from '@mui/icons-material/MoreVert';

import {
  Box,
  Dialog,
  DialogContent,
  DialogContentText,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { DatabaseContext } from '../../providers/DatabaseProvider';
import { PeerContext } from '../../providers/PeerProvider';

import { descriptiveTimeAgo } from '../../services/Generic';
import { IContact, IMessage } from '../../types';
import Identification from 'components/Identification/Identification';
import { UserContext } from 'providers/UserProvider';
import Distance from 'util/geo/Distance';

export const ContactItem = (props: { contact: IContact }) => {
  const userCtx = useContext(UserContext);
  const peerMngr = useContext(PeerContext);
  const db = useContext(DatabaseContext);
  const [contact, setContact] = useState<IContact>(props.contact);

  const [cntUnread, setCntUnread] = useState(0);

  const [online, setOnline] = useState(peerMngr?.isConnected(props.contact) || false);
  const [distance, setDistance] = useState('');

  const lastTimeSeen =
    'Connected last time: ' + descriptiveTimeAgo(new Date(contact.dateTimeResponded));

  useEffect(() => {
    if (!userCtx.user.position || !contact.position) return;
    const distanceFromMe = Distance(userCtx.user.position, contact.position);
    if (distanceFromMe) setDistance(`Distance from me: ${distanceFromMe} km.`);
  }, [contact, userCtx.user]);
  //const theme = useTheme();

  useEffect(() => {
    async function selectUnreadMsg() {
      if (db) {
        setCntUnread(await db.selectUnreadMessages(contact).count());
      }
    }
    selectUnreadMsg();
    //unread messages
  }, [db, contact]);

  useEffect(() => {
    function messageHandler(message: IMessage) {
      if (message.sender === contact.peerid) {
        console.log('Message received in messageHandler', message);
        setCntUnread(cntUnread + 1);
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
        <Tooltip title="More Options">
          <IconButton
            onClick={(e) => {
              e.preventDefault();
              setShowOptions(true);
            }}
          >
            <MoreOptionsIcon></MoreOptionsIcon>
          </IconButton>
        </Tooltip>{' '}
        <Dialog open={showOptions} onClose={() => setShowOptions(false)}>
          <DialogContent>
            <DialogContentText></DialogContentText>{' '}
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
        alignItems: 'baseline',
        //  overflow: 'hidden',

        //overflow: 'hidden',
        //width: 1,
        // height: 63,
        padding: (theme) => theme.spacing(1),
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

        <MoreOptionsButton></MoreOptionsButton>
      </Box>

      {/*username can move to bottom or disappear if to small*/}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: { xs: 'left', md: 'flex-start' },
          //m: 3,
          borderwidth: '1',
          minWidth: { md: 180 },
        }}
      >
        <Typography variant="subtitle1">{contact.nickname}</Typography>
        <Box component="span" sx={{ visibility: { xs: 'hidden', md: 'visible' } }}>
          {lastTimeSeen}
        </Box>
        <Box component="span" sx={{ visibility: { xs: 'hidden', md: 'visible' } }}>
          {distance}
        </Box>
      </Box>
    </Box>
  );
};
