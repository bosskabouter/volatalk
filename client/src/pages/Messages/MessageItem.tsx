import { useContext, useEffect } from 'react';
import { Box, ListItemText, ListItemIcon, Tooltip } from '@mui/material';

import PendingIcon from '@mui/icons-material/HourglassBottom';
import DeliveredIcon from '@mui/icons-material/Check';
import PushedIcon from '@mui/icons-material/ForwardToInbox';
import PushFailedIcon from '@mui/icons-material/CancelScheduleSend';
import ReadIcon from '@mui/icons-material/MarkChatRead';

import { UserContext } from '../../providers/UserProvider';
import { PeerContext } from '../../providers/PeerProvider';
import { IContactResume, IMessage } from '../../types';
import { descriptiveTimeAgo } from '../../services/Generic';
import Linkify from 'linkify-react';

export const MessageItem = ({
  contact,
  message,
}: {
  contact: IContactResume;
  message: IMessage;
}) => {
  const peerManager = useContext(PeerContext);
  const { user } = useContext(UserContext);

  const isMine = message.sender === user?.peerid;

  const senderText = isMine ? 'You' : contact.nickname;
  const secondaryText =
    (isMine ? 'Sent ' : 'Received ') + descriptiveTimeAgo(new Date(message.dateTimeCreated));

  const StatusIcon = () => {
    let el;
    const isPushed = message.dateTimePushed > 1000;
    const isPushFailed = isPushed && message.dateTimePushed < 1000; /* HTTP error code */
    const isSent = message.dateTimeSent > 0;
    const isRead = message.dateTimeRead > 0;
    if (!isMine) el = <></>;
    else if (isRead) {
      el = (
        <Tooltip title={'Message was read'}>
          <ReadIcon />
        </Tooltip>
      );
    } else if (isSent) {
      el = (
        <Tooltip title={'Message was delivered but not yet read'}>
          <DeliveredIcon />
        </Tooltip>
      );
    } else if (isPushFailed) {
      el = (
        <Tooltip title={'Push error: ' + message.dateTimePushed}>
          <PushFailedIcon />
        </Tooltip>
      );
    } else if (isPushed) {
      el = (
        <Tooltip title={'A push message has been sent.'}>
          <PushedIcon />
        </Tooltip>
      );
    } else {
      el = (
        <Tooltip title={'Contact does not receive push messages. Wait the person to be online...'}>
          <PendingIcon color="warning" />
        </Tooltip>
      );
    }
    return el;
  };

  useEffect(() => {
    if (!peerManager) return;
    const onMessageDeliverHandler = (msg: IMessage) => {
      if (msg.id === message.id) {
        message.dateTimePushed = msg.dateTimePushed;
        message.dateTimeSent = msg.dateTimeSent;
        message.dateTimeRead = msg.dateTimeRead;
      }
    };
    const pushed = message.dateTimePushed > 1000;
    const sent = message.dateTimeSent > 0;

    if (peerManager && !pushed && !sent) {
      //watch message untill read
      peerManager.addListener('onMessageDelivered', onMessageDeliverHandler);
    }
    return () => {
      peerManager?.removeListener('onMessageDelivered', onMessageDeliverHandler);
    };
  }, [peerManager, message.dateTimeSent, message.dateTimeRead, message]);

  return (
    <Box component="span">
      <ListItemIcon>
        <StatusIcon />
      </ListItemIcon>
      <ListItemText
        id={'id-' + message.id}
        primary={
          <p
            dangerouslySetInnerHTML={{
              __html: '<em>' + senderText + '</em>: ' + message.payload,
            }}
          />
        }
        secondary={secondaryText}
      />
    </Box>
  );
};
