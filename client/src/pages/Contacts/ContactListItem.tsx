import { IContact, IMessage } from 'types';
import { PeerContext, usePeer } from 'providers/PeerProvider';
import React, { useContext, useEffect, useState } from 'react';
import CallIcon from '@mui/icons-material/Call';
import AddTaskIcon from '@mui/icons-material/AddTask';

import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import { identicon } from 'minidenticons';

import { Divider, IconButton, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { VideoCameraFront } from '@mui/icons-material';
import { getLocalDateString } from 'services/Generic';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { ContactService } from 'services/ContactService';
import { UserContext } from 'providers/UserProvider';
import { PeerManager, PeerManagerEvents } from 'services/PeerManager';
import StrictEventEmitter from 'strict-event-emitter-types/types/src';

interface ContactListItemProps {
  contact: IContact;
}

export const ContactListItem = (props: ContactListItemProps) => {
  const peer = useContext(PeerContext);
  const user = useContext(UserContext);
  const db = useContext(DatabaseContext);

  const [contact, setContact] = useState<IContact>(props.contact);
  const [online, setOnline] = useState(peer?.isConnectedWith(props.contact));
  const [connection, setConnection] = useState(peer?.connectedContacts.get(props.contact.peerid));

  const handleClickContact = (action: string) => () => {
    console.log(action + ' contact ' + props.contact.nickname);
  };

  useEffect(() => {
    function messageHandler(message: IMessage) {
      console.log('Message received in messageHandler: ' + message);
    }
    function contactStatusHandle(contact: IContact, statusChange: boolean) {
      console.log('contactStatusHandle Handler: ', contact);
      if (contact.peerid === props.contact.peerid) {
        setContact(contact);
        setOnline(statusChange);
      }
    }
    peer?.on('onMessage', messageHandler);
    peer?.on('onContactStatusChange', contactStatusHandle);

    return () => {
      peer?.removeListener('onMessage', messageHandler);
      // peer?.removeListener('onContactStatusChange', contactStatusHandle);
    };
  }, [peer, props.contact]);

  const AcceptContactButton = () => {
    const acceptContact = () => {
      if (db && peer) {
        new ContactService(user.user, db).acceptContact(props.contact);
        props.contact.accepted = true;
        setContact(props.contact);
        peer.checkConnection(props.contact);
      }
    };
    return !props.contact.accepted ? (
      <IconButton
        onClick={acceptContact}
        edge="start"
        aria-label="Accept Contact?"
        color="success"
        size="small"
      >
        <AddTaskIcon />
      </IconButton>
    ) : (
      <></>
    );
  };

  const BlockContactButton = () => {
    const blockContact = () => {
      props.contact.declined = !props.contact.declined;
      db?.contacts.put(props.contact);
      setOnline(peer?.checkConnection(props.contact));
      setContact(props.contact);
    };
    function getIconColor() {
      return props.contact.declined ? 'error' : 'success';
    }
    return (
      <IconButton
        onClick={blockContact}
        edge="start"
        aria-label="Block Contact"
        color={getIconColor()}
        size="small"
      >
        <RemoveCircleOutlineIcon />
      </IconButton>
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
          size="small"
        >
          <VideoCameraFront />
        </IconButton>
        <IconButton
          onClick={handleClickContact('audiocall')}
          edge="end"
          aria-label="Audio Call"
          color="success"
          size="small"
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
          color={online ? 'success' : 'default'}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
        >
          <ListItemAvatar>
            <Avatar src={props.contact.avatar}></Avatar>
          </ListItemAvatar>
        </Badge>
        <Badge
          color={props.contact.declined ? 'error' : 'default'}
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          variant="dot"
        >
          <ListItemAvatar>
            <Avatar
              sizes="small"
              src={`data:image/svg+xml;utf8,${identicon(props.contact.peerid)}`}
              alt={`${props.contact.nickname} 's personsal identification icon`}
            ></Avatar>
          </ListItemAvatar>
        </Badge>
        <ListItemText
          id={props.contact.peerid}
          primary={props.contact.nickname}
          secondary={`connected since ${getLocalDateString(props.contact.dateCreated)}`}
        />
      </ListItem>
      <Divider variant="inset" component="li" />
    </>
  );
};
