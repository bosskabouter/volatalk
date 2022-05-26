import { IContact, IMessage } from 'types';
import { PeerContext } from 'providers/PeerProvider';
import { MouseEvent, useContext, useEffect, useState } from 'react';
import CallIcon from '@mui/icons-material/Call';
import AddTaskIcon from '@mui/icons-material/AddTask';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';

import { IconButton, ListItem, ListItemAvatar, ListItemText, Tooltip } from '@mui/material';
import { VideoCameraFront } from '@mui/icons-material';
import { descriptiveTimeAgo } from 'services/Generic';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { useNavigate } from 'react-router-dom';

interface ContactListItemProps {
  contact: IContact;
}

export const ContactListItem = (props: ContactListItemProps) => {
  const peerMngr = useContext(PeerContext);
  const db = useContext(DatabaseContext);
  const navigate = useNavigate();
  const [contact, setContact] = useState<IContact>(props.contact);

  const [cntUnread, setCntUnread] = useState(0);
  const [online, setOnline] = useState(peerMngr?.checkConnection(props.contact));

  const handleClickMessageContact = (_e: MouseEvent) => {
    navigate('/messages/' + props.contact.peerid);
  };
  const handleClickAudioCallContact = (e: MouseEvent) => {
    navigate('/call/' + props.contact.peerid);
    //avoid onclick listitem handleClickMessageContact
    e.stopPropagation();
  };
  const handleClickVideoCallContact = (e: MouseEvent) => {
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

    if (!peerMngr) return;
    peerMngr.on('onMessage', messageHandler);
    peerMngr.on('onContactStatusChange', onContactStatusChangeHandle);

    return () => {
      peerMngr.removeListener('onMessage', messageHandler);
      peerMngr.removeListener('onContactStatusChange', onContactStatusChangeHandle);
    };
  }, [peerMngr, contact, cntUnread, online]);

  const AcceptContactButton = () => {
    const acceptContact = () => {
      if (db) {
        contact.dateTimeAccepted = new Date().getTime();
        db.contacts.put(contact);
        setContact(contact);
        if (peerMngr) {
          peerMngr.initiateConnection(contact);

          setOnline(peerMngr.checkConnection(contact));
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
      <div>
        <IconButton
          onClick={handleClickVideoCallContact}
          edge="end"
          aria-label="Video Call"
          color="success"
          size="small"
        >
          <VideoCameraFront />
        </IconButton>
        <IconButton
          onClick={handleClickAudioCallContact}
          edge="end"
          aria-label="Audio Call"
          color="success"
          size="small"
        >
          <CallIcon />
        </IconButton>
      </div>
    );
  };

  const BlockContactButton = () => {
    const isBlocked = contact.dateTimeDeclined !== 0;

    const blockContact = async () => {
      if (!peerMngr || !db) return;
      if (isBlocked) contact.dateTimeDeclined = 0;
      else contact.dateTimeDeclined = new Date().getTime();
      db.contacts.put(contact);

      if (isBlocked) {
        const conn = peerMngr._connectedContacts.get(contact.peerid);
        conn?.send('bye');
        conn?.close();
      } else {
        peerMngr.initiateConnection(contact);
        setOnline(peerMngr.checkConnection(contact));
      }
      setContact(contact);
    };
    const label = (isBlocked ? 'un' : '') + 'block this user';
    const color = !isBlocked ? 'success' : 'error';
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
  );
};
