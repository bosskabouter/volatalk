import { IContact, IMessage } from 'types';
import { PeerContext } from 'providers/PeerProvider';
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

interface ContactListItemProps {
  contact: IContact;
}

export const ContactListItem = (props: ContactListItemProps) => {
  const peer = useContext(PeerContext);
  const db = useContext(DatabaseContext);

  const [contact, setContact] = useState<IContact>(props.contact);

  const [cntUnread, setCntUnread] = useState(0);
  const [online, setOnline] = useState(peer?.connectedContacts.get(props.contact.peerid)?.open);

  const handleClickContact = (action: string) => () => {
    console.log(action + ' contact ' + props.contact.nickname);
  };
  useEffect(() => {
    if (db) {
      db.messages
        .where('sender')
        .equals(contact.peerid)
        .count()
        .then((cnt) => {
          setCntUnread(cnt);
        });
    }
  }, [db, contact.peerid]);

  useEffect(() => {
    function messageHandler(message: IMessage) {
      console.log('Message received in messageHandler', message);
      setCntUnread(cntUnread+1);
    }
    async function contactStatusHandle(c: IContact) {
      if (c.peerid === contact.peerid) {
        setContact(c);
        setOnline(true);
      }
    }
    peer?.on('onMessage', messageHandler);
    peer?.on('onContactOnline', contactStatusHandle);

    return () => {
      peer?.removeListener('onMessage', messageHandler);
      // peer?.removeListener('onContactOnline', contactStatusHandle);
    };
  }, [peer, contact, cntUnread]);

  const AcceptContactButton = () => {
    const acceptContact = () => {
      if (db) {
        contact.accepted = true;
        db.contacts.put(contact);
        setContact(contact);
        if (peer) {
          peer.checkConnection(contact);
          setOnline(peer.connectedContacts.get(contact.peerid)?.open);
        }
      }
    };
    return !contact.accepted ? (
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
    const blockContact = async () => {
      contact.declined = !contact.declined;
      db?.contacts.put(contact);

      if (contact.declined) {
        const conn = peer?.connectedContacts.get(contact.peerid);
        conn?.send('bye');
        conn?.close();
      } else {
        peer?.checkConnection(contact);
        setOnline(peer?.connectedContacts.get(contact.peerid)?.open);
      }
      setContact(contact);
    };
    function getIconColor() {
      return contact.declined ? 'error' : 'success';
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
    <> <Divider variant="inset" component="li" />
      <ListItem
        key={contact.peerid}
        onClick={handleClickContact('messages')}
        alignItems="flex-start"
        secondaryAction={secondaryOptions()}
        disablePadding
      >
        <ListItemAvatar>
          <Avatar
            sizes="small"
            src={`data:image/svg+xml;utf8,${identicon(contact.peerid)}`}
            alt={`${contact.nickname} 's personsal identification icon`}
          ></Avatar>
        </ListItemAvatar>

        <Badge
          variant="standard"
          color={online ? 'success' : 'primary'}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={cntUnread}
        >
          <ListItemAvatar>
            <Avatar src={contact.avatar}></Avatar>
          </ListItemAvatar>
        </Badge>

        <ListItemText
          id={contact.peerid}
          primary={contact.nickname}
          secondary={`connected since ${getLocalDateString(contact.dateCreated)}`}
        />
      </ListItem>
      <Divider variant="inset" component="li" />
    </>
  );
};
