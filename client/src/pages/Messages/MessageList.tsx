import { useContext, useEffect, useState, useRef } from 'react';
import { Box, CssBaseline, List, ListItem, ListSubheader, useTheme } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import IconButton from '@mui/material/IconButton';

import CallIcon from '@mui/icons-material/Call';
import VideoCallIcon from '@mui/icons-material/VideoCall';

import BackIcon from '@mui/icons-material/ChevronLeft';
import { DatabaseContext } from '../../providers/DatabaseProvider';
import { PeerContext } from '../../providers/PeerProvider';
import { ContactItem } from '../Contacts/ContactItem';
import { ComposeMessage } from './ComposeMessage';
import { MessageItem } from './MessageItem';
import { IContact, IMessage } from '../../types';

const MessageList = () => {
  const db = useContext(DatabaseContext);
  const peerManager = useContext(PeerContext);
  const navigate = useNavigate();

  const contactId = useParams().contactid ?? '';

  const [contact, setContact] = useState<IContact>();
  const [messageList, setMessageList] = useState<IMessage[]>([]);

  const listElement = useRef<HTMLUListElement>(null);

  /**
   *
   */
  useEffect(() => {
    console.debug('useEffect loadContact');

    async function loadContact() {
      if (!db) return;
      setContact(await db.contacts.get(contactId));
    }

    loadContact();
  }, [contactId, db]);

  /**
   *
   */
  useEffect(() => {
    console.debug('useEffect loadMessages');

    async function loadMessages() {
      if (!db || !contact) return;
      const timeRead = new Date().getTime();
      const msgs = await db.selectUnreadMessages(contact).toArray();

      msgs.forEach((msg) => {
        db.messages.update(msg, { dateTimeRead: timeRead });
      });
      db.selectMessages(contact).then(setMessageList);
    }

    loadMessages();
  }, [contact, db, messageList.length]);

  useEffect(() => {
    const onMessageHandler = (msg: IMessage) => {
      if (msg.sender === contactId) {
        setMessageList((prevMessageList) => [...prevMessageList, msg]);
      }
    };

    if (peerManager) {
      console.debug('useEffect onMessageHandler');
      peerManager.addListener('onMessage', onMessageHandler);
    }
    return () => {
      peerManager?.removeListener('onMessage', onMessageHandler);
    };
  }, [contact, contactId, messageList.length, peerManager]);

  useEffect(() => {
    console.debug('useEffect scrollDown');
    listElement.current && (listElement.current.scrollTop = 1000 * messageList.length);
  }, [messageList.length]);

  const theme = useTheme();

  return contact ? (
    <>
      <CssBaseline />

      <List
        ref={listElement}
        sx={{
          mb: '5rem',
        }}
        dense={true}
        subheader={
          <ListSubheader
            component="div"
            id="nested-list-subheader"
            sx={{
              display: 'flex',
              pt: 7,
              pb: 2,
              margin: 0,

              bgcolor: theme.palette.primary.main,
              borderRadius: '18px',
              boxShadow: 9,
            }}
          >
            <BackIcon onClick={() => navigate('/contacts')} />
            <Box color={'primary'}>
              <ContactItem contact={contact} />
            </Box>

            <IconButton onClick={() => navigate('/video/' + contactId)} size="medium">
              <VideoCallIcon />
            </IconButton>

            <IconButton onClick={() => navigate('/call/' + contact && contactId)} size="medium">
              <CallIcon />
            </IconButton>
          </ListSubheader>
        }
      >
        {messageList &&
          messageList.map((msg) => {
            return (
              <ListItem key={msg.id} divider>
                <MessageItem contact={contact} message={msg} key={msg.id} />
              </ListItem>
            );
          })}
      </List>
      <ComposeMessage
        contact={contact}
        onSend={(msg) => setMessageList((prevMessageList) => [...prevMessageList, msg])}
      />
    </>
  ) : (
    <em>no contact?</em>
  );
};

export default MessageList;
