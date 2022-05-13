import { PeerContext } from 'providers/PeerProvider';
import { DatabaseContext } from 'providers/DatabaseProvider';
import { IContact, IMessage } from 'types';

import { MessageListItem } from './MessageListItem';

import { useContext, useEffect, useState } from 'react';
import { Box, InputAdornment, List, ListSubheader, TextField } from '@mui/material';
import { PeerManagerEvents } from 'services/PeerManager';
import { useParams } from 'react-router-dom';

import IconButton from '@mui/material/IconButton';

import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import Picker from 'emoji-picker-react';

const MessageList = () => {
  const db = useContext(DatabaseContext);
  const peerManager = useContext(PeerContext);

  const contactId = useParams().contactid ?? '';
  const [contact, setContact] = useState<IContact>({
    peerid: '0',
    nickname: 'unknown contact',
    dateCreated: new Date(),
    signature: new ArrayBuffer(0),
  });
  const [messageList, setMessageList] = useState<IMessage[]>([]);

  useEffect(() => {
    if (!db) return;
    if (!contactId) return;
    db.contacts.get(contactId).then((ctc) => {
      if (ctc) {
        setContact(ctc);
        db.messages
          .where('sender')
          .equals(contactId)
          .or('receiver')
          .equals(contactId)
          .sortBy('dateSent')
          .then((msgs) => {
            setMessageList(msgs);
          });
      }
    });
  }, [contactId, db]);

  useEffect(() => {
    const updateMessageList = (newMsgEvent: PeerManagerEvents['onMessage']) => {
      if (newMsgEvent.arguments.sender === contactId) {
        messageList.push(newMsgEvent.arguments);
        setMessageList(messageList);
      }
    };
    if (peerManager) peerManager.addListener('onNewMessage', updateMessageList);
    return () => {
      peerManager?.removeListener('onNewMessage', updateMessageList);
    };
  }, [contactId, messageList, peerManager]);

  const ComposeMessageField = () => {
    const [sndMessageText, setSndMessageText] = useState<string>('');

    const sendText = () => {
      if (sndMessageText.trim().length > 0) {
        console.log('Sending text' + sndMessageText);
        peerManager?.sendMessage(sndMessageText, contactId);
      }
    };
    const handleTyping = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      //event.preventDefault();
      setSndMessageText(event.target.value);
      //event.target.focus();
    };
    const [open, setOpen] = useState(false);
    const EmojiButton = () => {
      return open ? (
        <Picker
          native
          onEmojiClick={(_e, picked) => {
            setSndMessageText(sndMessageText + picked.emoji);
            setOpen(false);
          }}
        />
      ) : (
        <IconButton
          onClick={() => {
            setOpen(true);
          }}
        >
          <EmojiEmotionsIcon></EmojiEmotionsIcon>
        </IconButton>
      );
    };
    return (
      <>
        <Box>
          <TextField
            spellCheck
            label={'Send ' + contact.nickname + ' a message'}
            placeholder={'Hi ' + contact.nickname + '!'}
            sx={{ width: '80%' }}
            variant="filled"
            onChange={handleTyping}
            value={sndMessageText}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={EmojiButton} size="small">
                    <EmojiButton />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          ></TextField>

          <IconButton onClick={sendText} size="large" color='secondary'>
            <SendIcon />
          </IconButton>
        </Box>
      </>
    );
  };

  return (
    <div>
      <List
        sx={{
          width: '100%',
          bgcolor: 'background.paper',
          // position: static | relative | absolute | sticky | fixed
          //position: 'static',
          // overflow: visible | hidden | clip | scroll | auto
          overflow: 'auto',
          // height: auto | <length> | <percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)
          //height: '100%',
          // maxHeight: none | <length-percentage> | min-content | max-content | fit-content | fit-content(<length-percentage>)
          maxHeight: '50vh',
          '& ul': { padding: 0 },
        }}
        dense={true}
      >
        {messageList &&
          messageList.map((msg) => {
            return <MessageListItem contact={contact} message={msg} key={msg.id} />;
          })}
      </List>
      <ComposeMessageField />
    </div>
  );
};

export default MessageList;
