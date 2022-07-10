import { BaseSyntheticEvent, MouseEvent, useContext, useEffect, useState } from 'react';

import CallIcon from '@mui/icons-material/Call';
import AddTaskIcon from '@mui/icons-material/AddTask';

import { IconButton, ListItem, ListItemText } from '@mui/material';
import { VideoCameraFront as CallContactIcon } from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

import { ContactItem } from './ContactItem';

import { IContact, IMessage } from '../../types';
import { PeerContext } from '../../providers/PeerProvider';
import { DatabaseContext } from '../../providers/DatabaseProvider';
import { MessageItem } from 'pages/Messages/MessageItem';
import { ContactDetails } from './ContactDetails';
import { ContactsContext } from 'providers/ContactsProvider';

export const ContactListItem = (props: { contact: IContact }) => {
  const peerMngr = useContext(PeerContext);
  const db = useContext(DatabaseContext);

  // const [contacts, setContacts]=useContext(ContactsContext);

  const navigate = useNavigate();

  const [online, setOnline] = useState(peerMngr?.isConnected(props.contact));

  const [lastMessage, setLastMessage] = useState<IMessage | null>();

  const handleClickMessageContact = (_e: MouseEvent) => {
    navigate('/messages/' + props.contact.peerid);
  };
  const handleClickAudioCallContact = (e: MouseEvent) => {
    navigate('/call/' + props.contact.peerid);
    //avoid onclick listitem handleClickMessageContact
    e.stopPropagation();
    e.preventDefault();
  };
  const handleClickVideoCallContact = (e: MouseEvent) => {
    navigate('/video/' + props.contact.peerid);
    //avoid onclick listitem handleClickMessageContact
    e.stopPropagation();
    e.preventDefault();
  };

  /**
   * Select initial last message from db
   */
  useEffect(() => {
    if (!db) return;
    console.debug('useEffect selectLastMessage');
    db.selectLastMessage(props.contact).then(setLastMessage);
  }, [db, props.contact]);

  /**
   * Listens for new Messages. If it came from this contact, set as last message
   */
  useEffect(() => {
    function messageHandler(message: IMessage) {
      if (message.sender === props.contact.peerid) {
        console.debug('Message received in messageHandler', message);
        setLastMessage(message);
      }
    }

    if (!peerMngr || !online || !props.contact) return;
    console.debug('useEffect onMessage');

    peerMngr.on('onMessage', messageHandler);

    return () => {
      peerMngr.removeListener('onMessage', messageHandler);
    };
  }, [peerMngr, props.contact, online]);

  /**
   *
   * @returns
   */
  const SecondaryActions = () => {
    const acceptContact = (e: BaseSyntheticEvent) => {
      e.preventDefault();
      props.contact.dateTimeAccepted = new Date().getTime();
      db?.contacts.put(props.contact);
      if (peerMngr) {
        peerMngr.connectContact(props.contact);
        setOnline(peerMngr.isConnected(props.contact));
      }
    };
    return props.contact.dateTimeAccepted === 0 ? (
      <div>
        <IconButton
          onClick={acceptContact}
          edge="start"
          aria-label="Accept Contact?"
          color="success"
          size="small"
          title="Accept Contact"
        >
          <AddTaskIcon />
        </IconButton>
      </div>
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

  return (
    <ListItem
      alignItems="flex-start"
      divider
      key={props.contact.peerid}
      onClick={handleClickMessageContact}
      secondaryAction={<SecondaryActions />}
      dense
      sx={{
        borderRadius: '6px',
        boxShadow: 2,
        '&:hover': {
          backgroundColor: 'primary.main',
          opacity: [0.9, 0.8, 0.7],
          boxShadow: 6,
        },
      }}
    >
      <ContactItem contact={props.contact}></ContactItem>
      {lastMessage ? (
        <MessageItem contact={props.contact} message={lastMessage} />
      ) : (
        <ListItemText primary={'No message yet. Say Hi ' + props.contact.nickname} />
      )}
    </ListItem>
  );
};
