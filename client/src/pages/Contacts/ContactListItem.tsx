import { IContact, IMessage } from 'types';
import { PeerContext } from 'providers/PeerProvider';
import { useContext, useEffect, useState } from 'react';
import CallIcon from '@mui/icons-material/Call';
import AddTaskIcon from '@mui/icons-material/AddTask';

import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';

import {
  Divider,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { VideoCameraFront } from '@mui/icons-material';
import { descriptiveTimeAgo } from 'services/Generic';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { useNavigate } from 'react-router-dom';

interface ContactListItemProps {
  contact: IContact;
}

export const ContactListItem = (props: ContactListItemProps) => {
  const peer = useContext(PeerContext);
  const db = useContext(DatabaseContext);
  const navigate = useNavigate();
  const [contact, setContact] = useState<IContact>(props.contact);

  const [cntUnread, setCntUnread] = useState(0);
  const [online, setOnline] = useState(peer?.connectedContacts.get(props.contact.peerid)?.open);

  const handleClickContact = (_action: string) => () => {
    //    console.log(action + ' contact ' + props.contact.nickname);
    navigate('/messages/' + props.contact.peerid);
  };
  useEffect(() => {
    //unread messages
    if (db) {
      db.selectUnreadMessages(contact)
        .count()
        .then((cnt) => {
          setCntUnread(cnt);
        });
    }
  }, [db, contact]);

  useEffect(() => {
    function messageHandler(message: IMessage) {
      console.log('Message received in messageHandler', message);
      setCntUnread(cntUnread + 1);
    }
    async function contactStatusHandle(c: IContact) {
      console.log('contactStatusHandler', c);
      if (c.peerid === contact.peerid) {
        setContact(c);
        setOnline(true);
      }
    }
    peer?.on('onMessage', messageHandler);
    peer?.on('onContactOnline', contactStatusHandle);

    return () => {
      peer?.removeListener('onMessage', messageHandler);
      peer?.removeListener('onContactOnline', contactStatusHandle);
    };
  }, [peer, contact, cntUnread]);

  const AcceptContactButton = () => {
    const acceptContact = () => {
      if (db) {
        contact.dateTimeAccepted = new Date().getTime();
        db.contacts.put(contact);
        setContact(contact);
        if (peer) {
          peer._initiateConnection(contact);
          setOnline(peer.connectedContacts.get(contact.peerid)?.open);
        }
      }
    };
    return contact.dateTimeAccepted === 0 ? (
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
      if (!peer || !db) return;
      if (contact.dateTimeDeclined !== 0) contact.dateTimeDeclined = 0;
      else contact.dateTimeDeclined = new Date().getTime();
      db.contacts.put(contact);

      if (contact.dateTimeDeclined !== 0) {
        const conn = peer.connectedContacts.get(contact.peerid);
        conn?.send('bye');
        conn?.close();
      } else {
        peer._initiateConnection(contact);
        setOnline(peer.checkConnection(contact));
      }
      setContact(contact);
    };
    function getIconColor() {
      return contact.dateTimeDeclined === 0 ? 'success' : 'error';
    }
    return (
      <Tooltip title="Block this user">
        <IconButton
          onClick={blockContact}
          edge="start"
          aria-label="Block Contact"
          color={getIconColor()}
          size="small"
        >
          <RemoveCircleOutlineIcon />
        </IconButton>
      </Tooltip>
    );
  };

  const secondaryOptions = () => {
    return (
      <>
        <AcceptContactButton />
        <BlockContactButton />
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
  const badgeOnline = () => (online ? 'success' : 'error');

  return (
    <>
      <Divider variant="inset" component="li" />
      <ListItem
        // alignItems="flex-start"
        key={contact.peerid}
        onClick={handleClickContact('messages')}
        secondaryAction={secondaryOptions()}
      >
        <ListItemAvatar>
          <Badge
            variant="standard"
            color={badgeOnline()}
            // overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={cntUnread}
            //showZero
          >
            <Avatar src={contact.avatar}></Avatar>
          </Badge>
        </ListItemAvatar>
        <ListItemText
          id={contact.peerid}
          primary={contact.nickname}
          secondary={`connected since ${descriptiveTimeAgo(new Date(contact.dateTimeCreated))}`}
        />
      </ListItem>
      <Divider variant="inset" component="li" />
    </>
  );
};
