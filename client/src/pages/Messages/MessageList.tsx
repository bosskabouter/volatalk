import { useContext, useEffect, useState } from 'react';
import {
  Box,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  TextField,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import EmojiPicker from 'emoji-picker-react';

import IconButton from '@mui/material/IconButton';

import SendTextIcon from '@mui/icons-material/Send';
import CallIcon from '@mui/icons-material/Call';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import MsgHourglassIcon from '@mui/icons-material/HourglassBottom';
import MsgDeliveredIcon from '@mui/icons-material/Check';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import BackIcon from '@mui/icons-material/ChevronLeft';
import { DatabaseContext } from '../../providers/DatabaseProvider';
import { UserContext } from '../../providers/UserProvider';
import { PeerContext } from '../../providers/PeerProvider';
import { IContact, IMessage } from '../../types';
import { descriptiveTimeAgo } from '../../services/Generic';
import { ContactItem } from '../Contacts/ContactItem';

const MessageList = () => {
  const db = useContext(DatabaseContext);
  const userCtx = useContext(UserContext);
  const peerManager = useContext(PeerContext);
  const navigate = useNavigate();

  const contactId = useParams().contactid ?? '';

  const [contactOnline, setContactOnline] = useState(false);
  const [contact, setContact] = useState<IContact>();
  const [messageList, setMessageList] = useState<IMessage[]>([]);

  useEffect(() => {
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
      });
    }

    loadMessages();
  }, [contactId, db]);

  useEffect(() => {
    const insertNewMessageHandler = (msg: IMessage) => {
      if (msg.sender === contactId) {
        setMessageList((prevMessageList) => [...prevMessageList, msg]);
      }
    };
    function updateContactStatusHandler(statchange: { contact: IContact; status: boolean }) {
      console.info('Contact status change: ' + (statchange.status ? ' online' : 'offline'));
      if (statchange.contact.peerid === contactId) {
        console.info('This Contact ', contactId);
        setContactOnline(statchange.status);
        //update info
        setContact(statchange.contact);
      }
    }
    if (peerManager) {
      if (contact) setContactOnline(peerManager.isConnected(contact));
      peerManager.addListener('onMessage', insertNewMessageHandler);
      peerManager.addListener('onContactStatusChange', updateContactStatusHandler);
    }
    return () => {
      peerManager?.removeListener('onMessage', insertNewMessageHandler);
      peerManager?.removeListener('onContactStatusChange', updateContactStatusHandler);
    };
  }, [contact, contactId, peerManager]);

  const ComposeMessageField = () => {
    const [sndMessageText, setSndMessageText] = useState<string>('');
    const [openEmoji, setOpenEmoji] = useState(false);

    const sendText = async () => {
      if (peerManager && contact && sndMessageText.trim().length > 0) {
        console.log('Sending text: ' + sndMessageText);
        const msg = await peerManager.sendText(sndMessageText, contact);
        setSndMessageText('');
        setMessageList((prevMessageList) => [...prevMessageList, msg]);
      }
    };

    const ChooseEmojiButton = () => {
      return openEmoji ? (
        <EmojiPicker
          native
          onEmojiClick={(_e, picked) => {
            setSndMessageText(sndMessageText + picked.emoji);
            setOpenEmoji(false);
          }}
        />
      ) : (
        <IconButton
          onClick={() => {
            setOpenEmoji(true);
          }}
        >
          <EmojiEmotionsIcon></EmojiEmotionsIcon>
        </IconButton>
      );
    };
    return !contact ? (
      <>No contact selected</>
    ) : (
      <Box
        sx={{
          minWidth: { md: 270 },
          overflow: 'hidden',
        }}
      >
        <TextField
          autoFocus
          //  ref={textfieldRef}
          spellCheck
          label={'Send ' + contact.nickname + ' a message'}
          placeholder={'Hi ' + contact.nickname + '!'}
          sx={{ width: '90%' }}
          //  variant="filled"
          onKeyPress={(e) => {
            if (e.key === 'Enter') sendText();
          }}
          onChange={(e) => {
            setSndMessageText(e.target.value);
          }}
          value={sndMessageText}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <ChooseEmojiButton></ChooseEmojiButton>
              </InputAdornment>
            ),
          }}
        />

        <IconButton onClick={sendText} size="medium" color="secondary">
          <SendTextIcon />
        </IconButton>
      </Box>
    );
  };

  const MessageListItem = (props: { message: IMessage }) => {
    const isMine = props.message.sender === userCtx.user.peerid;

    const [delivered, setDelivered] = useState(props.message.dateTimeSent > 0);

    const senderText = isMine ? 'You' : contact?.nickname;
    const secondaryText =
      (isMine ? 'Sent ' : 'Received ') +
      descriptiveTimeAgo(new Date(props.message.dateTimeCreated));

    const DeliveredIcon = () => {
      return delivered ? <MsgDeliveredIcon /> : <MsgHourglassIcon />;
    };

    useEffect(() => {
      const onMessageDeliverHandler = (msg: IMessage) => {
        if (msg.id === props.message.id) {
          setDelivered(true);
        }
      };
      if (peerManager && props.message.dateTimeSent === 0) {
        peerManager.addListener('onMessageDelivered', onMessageDeliverHandler);
      }
      return () => {
        peerManager?.removeListener('onMessageDelivered', onMessageDeliverHandler);
      };
    }, [props.message.dateTimeSent, props.message.id]);

    return (
      <>
        <ListItem
          key={props.message.id}
          //    disablePadding
          //  alignItems={'center'}
          divider
          sx={{
            display: 'flex',
            flexDirection: 'row-reverse',
            alignItems: 'flex-start',
            justifyContent: 'right',
          }}
        >
          <ListItemIcon color="success">
            <DeliveredIcon />
          </ListItemIcon>
          <ListItemText
            id={'id-' + props.message.id}
            primary={senderText + ': ' + props.message.payload}
            secondary={secondaryText}
          />
        </ListItem>
      </>
    );
  };

  return !contact ? (
    <>No contact selected</>
  ) : (
    <Box
      boxShadow={15}
      //height={"100%"}
      //minHeight={600}
      // maxHeight={0.8}
    >
      <List
        //disablePadding
        sx={{
          //  width: '100%',
          bgcolor: 'background.paper',
          // padding: 5,
          // position: static | relative | absolute | sticky | fixed
          position: 'sticky',
          // overflow: visible | hidden | clip | scroll | auto
          //overflow: 'auto',
          // height: auto | <length> | <percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)
          // height: 'max-content',
          // maxHeight: none | <length-percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)
          maxHeight: '20%',
          //'& ul': { padding: 15 },
        }}
        // dense={true}
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            <Box
              sx={{
                display: 'flex',
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
            return <MessageListItem message={msg} key={msg.id} />;
          })}
      </List>
      <ComposeMessageField />
    </Box>
  );
};

export default MessageList;
