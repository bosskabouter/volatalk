import { useContext, useEffect, useState } from 'react';

import { Box, Typography } from '@mui/material';
import { DatabaseContext } from '../../providers/DatabaseProvider';
import { PeerContext } from '../../providers/PeerProvider';

import { descriptiveTimeAgo } from '../../services/util/Generic';
import { IContact, IMessage } from '../../types';
import Identification from 'components/Identification/Identification';

import { DistanceInfo } from 'components/Identification/DistanceInfo';

export const ContactItem = (props: { contact: IContact }) => {
  const peerMngr = useContext(PeerContext);
  const db = useContext(DatabaseContext);

  const [contact, setContact] = useState<IContact>(props.contact);

  const [cntUnread, setCntUnread] = useState<number>();

  const [online, setOnline] = useState(peerMngr?.isConnected(props.contact) || false);

  const lastTimeSeen = 'Seen: ' + descriptiveTimeAgo(new Date(contact.dateTimeResponded));

  /**
   * Selects unread messages;
   */
  useEffect(() => {
    console.debug('usEffect unreadMessages');
    !cntUnread && db?.selectUnreadMessages(contact).count().then(setCntUnread);
  }, [db, contact, cntUnread]);

  /**
   * Handles events from peermanager;
   * 1. new messages, if from peer, add +1 to count unread
   * 2. status change; if from this contact, show peer on/offline
   */
  useEffect(() => {
    console.debug('useEffect messageHandler');

    function messageHandler(message: IMessage) {
      if (message.sender === contact.peerid) {
        console.debug('Message received in messageHandler', message);
        setCntUnread((cntUnread ? cntUnread : 0) + 1);
      }
    }

    async function onContactStatusChangeHandle(statchange: { contact: IContact; status: boolean }) {
      if (statchange.contact.peerid === contact.peerid) {
        console.debug('contactStatusHandler', statchange);
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
        />
      </Box>

      <Box
        sx={{
          //username can move to bottom
          display: 'flex',
          flexDirection: 'column',
          alignItems: { xs: 'left', md: 'flex-start' },
          //m: 3,
          //width: '100%',
          border: 0,
         // minWidth: 180,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ 
            
            //maxWidth: { xs: '150px', md: '600px' }, 
            //minWidth: 150,
             border: 0 }}
        >
          {contact.nickname}
        </Typography>
        <Box component="span">
          <Typography variant="subtitle2" noWrap 
          sx={{ display: { xs: 'none', md: 'block' } }}>
            {lastTimeSeen}
          </Typography>
        </Box>
      </Box>
      <DistanceInfo contact={contact} detailed={true} />
    </Box>
  );
};
