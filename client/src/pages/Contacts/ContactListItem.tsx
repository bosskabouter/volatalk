import { IContact } from 'types';
import { PeerContext } from 'providers/PeerProvider';
import React, { useContext, useEffect, useState } from 'react';

import CommentIcon from '@mui/icons-material/Comment';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import { identicon } from 'minidenticons';
import {
  Checkbox,
  Divider,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
interface ContactListItemProps {
  contact: IContact;
}

export const ContactListItem = (props: ContactListItemProps) => {
  const peer = useContext(PeerContext);
  const [accepted, setAccepted] = useState(props.contact.accepted);
  const [declined, setDeclined] = useState(props.contact.declined);
  const [online, setOnline] = useState(peer?.isConnectedWith(props.contact));

  useEffect(() => {
    return () => {
      <></>;
    };
  }, [
    accepted,
    declined,
    online,
    props.contact.avatar,
    props.contact.nickname,
    props.contact.peerid,
  ]);

  return (
    <>
      <ListItem
        alignItems="flex-start"
        key={props.contact.peerid}
        secondaryAction={
          <IconButton edge="end" aria-label="comments">
            <CommentIcon />
          </IconButton>
        }
        disablePadding
      >
        <Badge
          color={online ? 'success' : 'default'}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
        >
          <ListItemAvatar>
            <Avatar
              src={`data:image/svg+xml;utf8,${identicon(props.contact.peerid)}`}
              alt={`${props.contact.nickname} 's personsal identification icon`}
            ></Avatar>
          </ListItemAvatar>
        </Badge>
        <ListItemAvatar>
          <Avatar src={props.contact.avatar}></Avatar>
        </ListItemAvatar>

        <ListItemButton role={undefined} onClick={undefined} dense>
          <ListItemIcon>
            <IconButton edge="end" aria-label="comments">
              <CommentIcon />
            </IconButton>
          </ListItemIcon>
        </ListItemButton>
        <ListItemText>
          {props.contact.nickname} - {props.contact.avatar}
        </ListItemText>
      </ListItem>
      <Divider variant="inset" component="li" />
    </>
  );
};
