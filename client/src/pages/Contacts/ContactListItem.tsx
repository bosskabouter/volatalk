import { MouseEvent, useContext, useEffect, useState } from 'react';

import CallIcon from '@mui/icons-material/Call';
import AddTaskIcon from '@mui/icons-material/AddTask';

import { IconButton, ListItem, ListItemText } from '@mui/material';
import { VideoCameraFront as CallContactIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { ContactItem } from './ContactItem';

import { IContact, IMessage } from '../../types';
import { PeerContext } from '../../providers/PeerProvider';
import { DatabaseContext } from '../../providers/DatabaseProvider';
import { descriptiveTimeAgo } from '../../services/Generic';

export const ContactListItem = (props: { contact: IContact }) => {
  const peerMngr = useContext(PeerContext);
  const db = useContext(DatabaseContext);
  const navigate = useNavigate();

  const [online, setOnline] = useState(peerMngr?.isConnected(props.contact));

  const [lastMessage, setLastMessage] = useState<IMessage>();

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
    db?.selectLastMessage(props.contact).then(setLastMessage);
  }, [db, props.contact]);

  useEffect(() => {
    function messageHandler(message: IMessage) {
      if (message.sender === props.contact?.peerid) {
        console.log('Message received in messageHandler', message);
        setLastMessage(message);
      }
    }

    if (!peerMngr) return;
    peerMngr.on('onMessage', messageHandler);

    return () => {
      peerMngr.removeListener('onMessage', messageHandler);
    };
  }, [peerMngr, props.contact, online]);

  const AcceptContactButton = () => {
    const acceptContact = () => {
      if (db) {
        props.contact.dateTimeAccepted = new Date().getTime();
        db.contacts.put(props.contact);
        if (peerMngr) {
          peerMngr.connectContact(props.contact);

          setOnline(peerMngr.isConnected(props.contact));
        }
      }
    };
    return props.contact.dateTimeAccepted === 0 ? (
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
          <CallContactIcon />
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

  const SecondaryOptions = () => {
    return <AcceptContactButton />;
  };

  return (
    <ListItem
      alignItems="flex-start"
      divider
      key={props.contact.peerid}
      onClick={handleClickMessageContact}
      secondaryAction={SecondaryOptions()}
      sx={{
        borderRadius: '12px',
        boxShadow: 1,
        '&:hover': {
          backgroundColor: 'primary.main',
          opacity: [0.9, 0.8, 0.7],
          boxShadow: 6,
        },
      }}
    >
      <ContactItem contact={props.contact}></ContactItem>

      {lastMessage ? (
        <ListItemText
          id={lastMessage.sender + lastMessage.receiver}
          primary={lastMessage?.payload}
          secondary={`sent ${descriptiveTimeAgo(new Date(lastMessage.dateTimeSent))}`}
        />
      ) : (
        <ListItemText primary="No message sent yet" />
      )}
    </ListItem>
  );
};
