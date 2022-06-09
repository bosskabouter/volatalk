import { useContext, useEffect, useState, useRef } from 'react';
import { Box, CssBaseline, List, ListItem, ListSubheader } from '@mui/material';
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

  useEffect(() => {
    console.debug('useEffect loadMessages');

    async function loadMessages() {
      if (!db) return;
      const ctc = await db.contacts.get(contactId);
      if (!ctc) return;
      setContact(ctc);
      const timeRead = new Date().getTime();
      const msgs = await db.selectUnreadMessages(ctc).toArray();

      msgs.forEach((msg) => {
        db.messages.update(msg, { dateTimeRead: timeRead });
      });

      db.selectContactMessages(ctc).then((allmsgs) => {
        setMessageList(allmsgs);
        console.info(listElement);
        if (listElement?.current) {
          listElement.current.scrollTop = 100 * allmsgs.length;
        }
      });
    }

    loadMessages();
  }, [contactId, db]);

  useEffect(() => {
    console.debug('useEffect onMessageHandler');

    const onMessageHandler = (msg: IMessage) => {
      if (msg.sender === contactId) {
        setMessageList((prevMessageList) => [...prevMessageList, msg]);
      }
    };

    if (peerManager) {
      peerManager.addListener('onMessage', onMessageHandler);
    }
    return () => {
      peerManager?.removeListener('onMessage', onMessageHandler);
    };
  }, [contact, contactId, peerManager]);

  return !contact ? (
    <em>No contact selected</em>
  ) : (
    <Box
      boxShadow={15}
      //height={"100%"}
      //minHeight={600}
      // maxHeight={0.8}
    >
      <CssBaseline />
      <List
        ref={listElement}
        //disablePadding
        sx={{
          //  width: '100%',
          bgcolor: 'background.paper',
          // padding: 5,
          // mt: 5,
          // position: static | relative | absolute | sticky | fixed
          // position: 'static',
          // overflow: visible | hidden | clip | scroll | auto
          overflow: 'auto',
          // height: auto | <length> | <percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)
          height: '81vh',
          // maxHeight: none | <length-percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)
          //maxHeight: '20%',
          paddingLeft: 1,
          width: '90vw',

          scrollBehavior: 'smooth',
        }}
        // dense={true}
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            <Box
              sx={{
                display: 'flex',
                pt: 7,
                pb: 0,
                //flexDirection: 'row',
                //flexDirection: 'column-reverse',
                // alignItems: 'flex-start',
                // justifyContent: 'left',
              }}
            >
              <BackIcon onClick={() => navigate('/contacts')} />

              <ContactItem contact={contact}></ContactItem>
              <IconButton onClick={() => navigate('/video/' + contactId)} size="medium">
                <VideoCallIcon />
              </IconButton>

              <IconButton onClick={() => navigate('/call/' + contact && contactId)} size="medium">
                <CallIcon />
              </IconButton>
            </Box>
          </ListSubheader>
        }
      >
        {messageList &&
          messageList.map((msg) => {
            return (
              <ListItem
                key={msg.id}
                //    disablePadding
                //  alignItems={'center'}
                divider
                sx={{
                  display: 'display-listitem',
                  //flexDirection: !isMine ? 'row' : 'row-reverse',
                  alignItems: 'flex-end',
                  justifyContent: 'right',
                }}
              >
                <MessageItem contact={contact} message={msg} key={msg.id} />
              </ListItem>
            );
          })}
      </List>
      <ComposeMessage
        contact={contact}
        onSend={(msg) => setMessageList((prevMessageList) => [...prevMessageList, msg])}
      />
    </Box>
  );
};

export default MessageList;
