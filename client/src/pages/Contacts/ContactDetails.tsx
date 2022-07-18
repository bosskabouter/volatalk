import { useContext, useEffect, useState } from 'react';

import {
  Avatar,
  Dialog,
  DialogContent,
  DialogContentText,
  Typography,
  IconButton,
  DialogActions,
} from '@mui/material';
import { DatabaseContext } from '../../providers/DatabaseProvider';
import { PeerContext } from '../../providers/PeerProvider';

import { descriptiveTimeAgo } from '../../services/util/Generic';
import { IContact, IMessage } from '../../types';
import Identification from 'components/Identification/Identification';

import { DistanceInfo } from 'components/Identification/DistanceInfo';
import MoreOptionsIcon from '@mui/icons-material/MoreVert';
import BlockIcon from '@mui/icons-material/Block';
import AddTaskIcon from '@mui/icons-material/AddTask';
import PushedIcon from '@mui/icons-material/ForwardToInbox';

import { ContactActions } from './ContactActions';

export const ContactDetails = (props: { contact: IContact }) => {
  const peerMngr = useContext(PeerContext);
  const db = useContext(DatabaseContext);

  const [contact, setContact] = useState<IContact>(props.contact);

  const [cntUnread, setCntUnread] = useState<number>();

  const [online, setOnline] = useState(peerMngr?.isConnected(props.contact) || false);

  const lastTimeSeen =
    'Last time connected: ' + descriptiveTimeAgo(new Date(contact.dateTimeResponded));

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

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <IconButton
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        <MoreOptionsIcon />
      </IconButton>

      <Dialog
        open={isOpen}
        onClose={(e) => {
          setIsOpen(!isOpen);
        }}
      >
        <DialogContent>
          <DialogContentText>
            <Typography variant="h5" sx={{ minWidth: 200, maxWidth: 400, border: 0 }}>
              {contact.nickname}
            </Typography>
          </DialogContentText>

          <Avatar variant="rounded" src={contact.avatar} sx={{ width: '360px', height: '360px' }} />
          <Identification
            id={contact.peerid}
            name={contact.nickname}
            status={peerMngr?.isConnected(contact)}
          />

          <Typography>{lastTimeSeen}</Typography>
          <DistanceInfo contact={contact} detailed={true} />

          {contact.pushSubscription && <PushedIcon />}
        </DialogContent>

        <DialogActions>
          <ContactActions contact={contact} detailed />
        </DialogActions>
      </Dialog>
    </>
  );
};
