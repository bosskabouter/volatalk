import { IContact } from 'types';
import { PeerContext } from 'providers/PeerProvider';
import React, { useContext, useEffect, useState } from 'react';
import CallIcon from '@mui/icons-material/Call';
import AddTaskIcon from '@mui/icons-material/AddTask';

import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

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
import { VideoCameraFront } from '@mui/icons-material';
import { getLocalDateString } from 'services/Generic';

interface ContactListItemProps {
  contact: IContact;
}

export const ContactListItem = (props: ContactListItemProps) => {
  const peer = useContext(PeerContext);
  const [accepted, setAccepted] = useState(props.contact.accepted);
  const [declined, setDeclined] = useState(props.contact.declined);
  const [online, setOnline] = useState(peer?.isConnectedWith(props.contact));

  const handleClickContact = (action: string) => () => {
    alert(action + ' contact ' + props.contact.nickname);
  };

  const AcceptContactButton = () => {
    return !props.contact.accepted ? (
      <IconButton
        onClick={handleClickContact('accept')}
        edge="start"
        aria-label="Accept Contact?"
        color="success"
      >
        <AddTaskIcon />
      </IconButton>
    ) : (
      <></>
    );
  };

  const BlockContactButton = () => {
    return !props.contact.declined ? (
      <IconButton
        onClick={handleClickContact('block')}
        edge="start"
        aria-label="Block Contact"
        color="error"
      >
        <RemoveCircleOutlineIcon />
      </IconButton>
    ) : (
      <></>
    );
  };

  const secondaryOptions = () => {
    return (
      <>
        <AcceptContactButton></AcceptContactButton>
        <BlockContactButton></BlockContactButton>
        <IconButton
          onClick={handleClickContact('videocall')}
          edge="end"
          aria-label="Video Call"
          color="success"
        >
          <VideoCameraFront />
        </IconButton>
        <IconButton
          onClick={handleClickContact('audiocall')}
          edge="end"
          aria-label="Audio Call"
          color="success"
        >
          <CallIcon />
        </IconButton>
      </>
    );
  };

  return (
    <>
      <ListItem
        key={props.contact.peerid}
        onClick={handleClickContact('messages')}
        alignItems="flex-start"
        secondaryAction={secondaryOptions()}
        disablePadding
      >
        <Badge
          about={online ? 'user online' : 'user off-line'}
          color={online ? 'success' : 'default'}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
        >
          <ListItemAvatar>
            <img src={props.contact.avatar} />
            <Avatar src={props.contact.avatar}></Avatar>
          </ListItemAvatar>
        </Badge>
        <Badge
          color={declined ? 'error' : accepted ? 'default' : 'warning'}
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          variant="dot"
        >
          <ListItemAvatar>
            <Avatar
              src={`data:image/svg+xml;utf8,${identicon(props.contact.peerid)}`}
              alt={`${props.contact.nickname} 's personsal identification icon`}
            ></Avatar>
          </ListItemAvatar>
        </Badge>
        <ListItemText
          id={props.contact.peerid}
          primary={props.contact.nickname}
          secondary={`since ${getLocalDateString(props.contact.dateCreated)}`}
        />
      </ListItem>
      <Divider variant="inset" component="li" />
    </>
  );
};
