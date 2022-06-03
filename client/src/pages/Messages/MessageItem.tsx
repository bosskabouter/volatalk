import { useContext, useEffect, useState } from 'react';
import { Box, ListItem, ListItemText, ListItemIcon, Tooltip } from '@mui/material';

import PendingIcon from '@mui/icons-material/HourglassBottom';
import DeliveredIcon from '@mui/icons-material/Check';
import PushedIcon from '@mui/icons-material/ScheduleSend';
import PushFailedIcon from '@mui/icons-material/CancelScheduleSend';
import ReadIcon from '@mui/icons-material/MarkChatRead';

import { UserContext } from '../../providers/UserProvider';
import { PeerContext } from '../../providers/PeerProvider';
import { IContact, IMessage } from '../../types';
import { descriptiveTimeAgo } from '../../services/Generic';

export const MessageItem = ({ contact, message }: { contact: IContact; message: IMessage }) => {
  const peerManager = useContext(PeerContext);
  const userCtx = useContext(UserContext);

  const isMine = message.sender === userCtx.user.peerid;

  const isPushed = message.dateTimePushed > 1000;
  const isPushFailed = isPushed && message.dateTimePushed < 1000; /* HTTP error code */
  const isSent = message.dateTimeSent > 0;
  const isRead = message.dateTimeRead > 0;

  const senderText = isMine ? 'You' : contact.nickname;
  const secondaryText =
    (isMine ? 'Sent ' : 'Received ') + descriptiveTimeAgo(new Date(message.dateTimeCreated));

  const StatusIcon = () => {
    if (!isMine) return <></>;
    else if (isRead) return <ReadIcon />;
    else if (isSent) return <DeliveredIcon />;
    else if (isPushFailed) {
      return (
        <Tooltip title={'Push error: ' + message.dateTimePushed}>
          <PushFailedIcon />
        </Tooltip>
      );
    } else if (isPushed) return <PushedIcon />;
    else return <PendingIcon />;
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
    if (peerManager && message.dateTimeRead === 0) {
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
        primary={senderText + ': ' + message.payload}
        secondary={secondaryText}
      />
    </Box>
  );
};
