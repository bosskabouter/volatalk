import { IContact, IMessage } from 'types';
import { PeerContext } from 'providers/PeerProvider';
import { MouseEvent, useContext, useEffect, useState } from 'react';
import CallIcon from '@mui/icons-material/Call';
import AddTaskIcon from '@mui/icons-material/AddTask';
import ChatIcon from '@mui/icons-material/Chat';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';

import {
  Divider,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { VideoCameraFront } from '@mui/icons-material';
import { descriptiveTimeAgo } from 'services/Generic';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { NavigateOptions, useNavigate } from 'react-router-dom';

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

  const handleClickMessageContact = (_e: MouseEvent) => {
    navigate('/messages/' + props.contact.peerid);
  };
  const handleClickCallContact = (e: MouseEvent) => {
    navigate('/call/' + props.contact.peerid);
    //avoid onclick listitem handleClickMessageContact
    e.stopPropagation();
  };
  const handleClickVideoContact = (e: MouseEvent) => {
    navigate('/video/' + props.contact.peerid);
    //avoid onclick listitem handleClickMessageContact
    e.stopPropagation();
  };
  useEffect(() => {
    async function selectUnreadMsg() {
      if (db) {
        setCntUnread(await db.selectUnreadMessages(contact).count());
      }
    }
    selectUnreadMsg();
    //unread messages
  }, [db, contact]);

  useEffect(() => {
    function messageHandler(message: IMessage) {
      if (message.sender === contact.peerid) {
        console.log('Message received in messageHandler', message);
        setCntUnread(cntUnread + 1);
      }
    }

    async function onContactStatusChangeHandle(statchange: { contact: IContact; status: boolean }) {
      if (statchange.contact.peerid === contact.peerid) {
        console.log('contactStatusHandler', statchange);
        setContact(statchange.contact);
        setOnline(statchange.status);
      }
    }

    if (!peer) return;
    peer.on('onMessage', messageHandler);
    peer.on('onContactStatusChange', onContactStatusChangeHandle);

    return () => {
      peer.removeListener('onMessage', messageHandler);
      peer.removeListener('onContactStatusChange', onContactStatusChangeHandle);
    };
  }, [peer, contact, cntUnread, online]);

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
      <>
        {' '}
        <IconButton
          onClick={handleClickVideoContact}
          edge="end"
          aria-label="Video Call"
          color="success"
          size="small"
        >
          <VideoCameraFront />
        </IconButton>
        <IconButton
          onClick={handleClickCallContact}
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

  const BlockContactButton = () => {
    const isBlocked =contact.dateTimeDeclined !== 0;
    
    const blockContact = async () => {
      if (!peer || !db) return;
      if (isBlocked) contact.dateTimeDeclined = 0;
      else contact.dateTimeDeclined = new Date().getTime();
      db.contacts.put(contact);

      if (isBlocked) {
        const conn = peer.connectedContacts.get(contact.peerid);
        conn?.send('bye');
        conn?.close();
      } else {
        peer._initiateConnection(contact);
        setOnline(peer.checkConnection(contact));
      }
      setContact(contact);
    };
    const label = (isBlocked ? 'un' : '') + 'block this user';
    const color = (!isBlocked ? 'success' : 'error');
    return (
      <Tooltip title={label}>
        <IconButton
          onClick={blockContact}
          edge="start"
          aria-label={label}
          color={color}
          size="small"
        >
          <RemoveCircleOutlineIcon />
        </IconButton>
      </Tooltip>
    );
  };

  const SecondaryOptions = () => {
    return (
      <>
        <AcceptContactButton />
        <BlockContactButton />
      </>
    );
  };

  return (
    <>
      <ListItem
        alignItems="flex-start"
        divider
        key={contact.peerid}
        onClick={handleClickMessageContact}
        secondaryAction={SecondaryOptions()}
      >
        <ListItemAvatar>
          <Badge
            variant={cntUnread > 0 ? 'standard' : 'dot'}
            color={online ? 'success' : 'error'}
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={cntUnread}
            showZero
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
    </>
  );
};
