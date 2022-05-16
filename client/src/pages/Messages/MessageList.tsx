import { PeerContext } from 'providers/PeerProvider';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { IContact, IMessage } from 'types';

import { useContext, useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import IconButton from '@mui/material/IconButton';
import CallIcon from '@mui/icons-material/Call';

import CheckIcon from '@mui/icons-material/Check';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import EmoPicker from 'emoji-picker-react';
import { identicon } from 'minidenticons';
import { UserContext } from 'providers/UserProvider';
import { descriptiveTimeAgo } from 'services/Generic';

const MessageList = () => {
  const db = useContext(DatabaseContext);
  const userCtx = useContext(UserContext);
  const peerManager = useContext(PeerContext);
  const navigate = useNavigate();

  const contactId = useParams().contactid ?? '';

  const [contactOnline, setContactOnline] = useState(false);
  const [contact, setContact] = useState<IContact>({
    peerid: '0',
    nickname: 'unknown contact',
    dateCreated: new Date(),
    signature: new ArrayBuffer(0),
  });
  const [messageList, setMessageList] = useState<IMessage[]>([]);
  
  const textfieldRef = useRef<HTMLInputElement|null>(null);

  useEffect(() => {
    db?.contacts.get(contactId).then((ctc) => {
      if (ctc) {
        setContact(ctc);
        db.selectContactMessages(ctc).then((msgs) => {
          setMessageList(msgs);
        });
      }
    });
  }, [contactId, db]);

  useEffect(() => {
    const insertNewMessageHandler = (msg: IMessage) => {
      if (msg.sender === contactId) {
        setMessageList((prevMessageList) => [...prevMessageList, msg]);
      }
    };
    const updateContactStatusHandler = (ctc: IContact) => {
      console.info('Someone online', ctc);
      if (ctc.peerid === contactId) {
        console.info('Contact online!', contactId);
        setContactOnline(true);
        //update info
        setContact(ctc);
      }
    };
    if (peerManager) {
      if (contact) setContactOnline(peerManager.checkConnection(contact));
      peerManager.addListener('onMessage', insertNewMessageHandler);
      peerManager.addListener('onContactOnline', updateContactStatusHandler);
    }
    return () => {
      peerManager?.removeListener('onMessage', insertNewMessageHandler);
      peerManager?.removeListener('onContactOnline', updateContactStatusHandler);
    };
  }, [contact, contactId, peerManager]);



  useEffect(() => {
    if (textfieldRef && textfieldRef.current) {
      //textfieldRef.current.focus();
    }
  })
  
  const ComposeMessageField = () => {
    const [sndMessageText, setSndMessageText] = useState<string>('');


    const sendText = async () => {
      if (peerManager && sndMessageText.trim().length > 0) {

        console.log('Sending text: ' + sndMessageText);
        const msg = await peerManager.sendText(sndMessageText, contactId);
        setSndMessageText('');
        setMessageList((prevMessageList) => [...prevMessageList, msg]);
        
      } 
    };

    const [openEmoji, setOpenEmoji] = useState(false);
    const ChooseEmojiButton = () => {
      return openEmoji ? (
        <EmoPicker
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
    return (
      <>
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
        ></TextField>

        <IconButton onClick={sendText} size="medium" color="secondary">
          <SendIcon />
        </IconButton>
      </>
    );
  };

  const MessageListItem = (props: { message: IMessage }) => {
    const isMine = props.message.sender === userCtx.user.peerid;

    const [delivered] = useState(props.message.dateTimeSent >0);

    const senderText = isMine ? 'You' : contact?.nickname;
    const secondaryText =
      (isMine ? 'Sent ' : 'Received ') + descriptiveTimeAgo(new Date(props.message.dateTimeCreated));

    const DeliveredIcon = () => {
      return delivered ? <CheckIcon /> : <HourglassBottomIcon />;
    };
    return (
      <>
        <ListItem
          key={props.message.id}
          //    disablePadding
          //  alignItems={'center'}
          divider
          sx={
            {
              //  display: 'flex',
              //  flexDirection: 'row',
              //   alignItems: 'flex-start',
              // justifyContent: 'right',
            }
          }
        >
          <DeliveredIcon />

          <ListItemText
            id={'id-' + props.message.id}
            primary={senderText + ': ' + props.message.payload}
            secondary={secondaryText}
          />
        </ListItem>
      </>
    );
  };

  return (
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
          //  position: 'sticky',
          // overflow: visible | hidden | clip | scroll | auto
          overflow: 'visible',
          // height: auto | <length> | <percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)
          height: 'fit-content',
          // maxHeight: none | <length-percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)
          //  maxHeight: '20%'
          // '& ul': { padding: 15 },
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
                <ChevronLeftIcon onClick={() => navigate('/contacts')}/>
              <Typography> {contact.nickname}</Typography>
              <Tooltip title="Personal Identification Icon">
                <Avatar
                  sizes="small"
                  src={`data:image/svg+xml;utf8,${identicon(contact.peerid)}`}
                  alt={`${contact.nickname} 's personsal identification icon`}
                ></Avatar>
              </Tooltip>
              <Badge
                variant="dot"
                color={contactOnline ? 'success' : 'error'}
                overlap="rectangular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <Avatar src={contact.avatar}></Avatar>
              </Badge>

              <IconButton onClick={() => navigate('/call/' + contactId)} size="medium">
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
