import { IContact, IMessage } from 'types';
import { PeerContext } from 'providers/PeerProvider';
import React, { useContext, useEffect, useState } from 'react';
import CallIcon from '@mui/icons-material/Call';
import AddTaskIcon from '@mui/icons-material/AddTask';

import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import { identicon } from 'minidenticons';

import {
  Divider,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { VideoCameraFront } from '@mui/icons-material';
import { getLocalDateString } from 'services/Generic';
import { DatabaseContext } from 'providers/DatabaseProvider';

interface MessageListItemProps {
  message: IMessage;
  contact: IContact;
}

export const MessageListItem = (props: MessageListItemProps) => {
  const peer = useContext(PeerContext);
  const db = useContext(DatabaseContext);
  const [message, setMessage] = useState<IMessage>(props.message);

  const [delivered, setDelivered] = useState(props.message.dateSent instanceof Date);

  const handleClickContact = (action: string) => () => {
    console.log(action + ' message ' + props.message.payload);
  };

 
  return (
    <>
      <Divider variant="inset" component="li" />
      <ListItem
        alignItems="center"

        key={message.id}
        onClick={handleClickContact('messages')}
        disablePadding
      >
        <ListItemAvatar>
          <Tooltip title="Personal Identification Icon">
            <Avatar
              sizes="small"
              src={`data:image/svg+xml;utf8,${identicon(props.contact.peerid)}`}
              alt={`${props.contact.nickname} 's personsal identification icon`}
            ></Avatar>
          </Tooltip>
        </ListItemAvatar>

        <Badge
          variant="standard"
          color={delivered ? 'success' : 'primary'}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <ListItemAvatar>
            <Avatar src={props.contact.avatar}></Avatar>
          </ListItemAvatar>
        </Badge>

        <ListItemText
          id={message.id}
          primary={message.payload}
          secondary={props.contact.nickname}
        />
      </ListItem>
      <Divider variant="inset" component="li" />
    </>
  );
};
