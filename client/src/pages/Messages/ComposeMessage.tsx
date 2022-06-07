import { useContext, useState } from 'react';
import { Box, InputAdornment, TextField } from '@mui/material';

import EmojiPicker from 'emoji-picker-react';

import IconButton from '@mui/material/IconButton';

import SendTextIcon from '@mui/icons-material/Send';

import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

import { PeerContext } from '../../providers/PeerProvider';
import { IContact, IMessage } from '../../types';

export const ComposeMessage = ({
  contact,
  onSend,
}: {
  contact: IContact;
  onSend: (msg: IMessage) => void;
}) => {
  const [sndMessageText, setSndMessageText] = useState<string>('');
  const [openEmoji, setOpenEmoji] = useState(false);
  const peerManager = useContext(PeerContext);
  const sendText = async () => {
    if (peerManager && contact && sndMessageText.trim().length > 0) {
      console.log('Sending text: ' + sndMessageText);
      const msg = await peerManager.sendText(sndMessageText, contact);
      setSndMessageText('');

      onSend(msg);
    }
  };

  const ChooseEmojiButton = () => {
    return openEmoji ? (
      <Box
        sx={{
          //  overflow: 'hidden',
          backgroundColor: 'coral',

          //absolute
          //fixed made disappear
          position: 'fixed',
          bottom: 80,
          right: 20,
          border: 1,
        }}
      >
        <EmojiPicker
          preload
          native
          onEmojiClick={(_e, picked) => {
            setSndMessageText(sndMessageText + picked.emoji);
            setOpenEmoji(false);
          }}
        />
      </Box>
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
    <em>No contact selected</em>
  ) : (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        flex: '',
        minWidth: { md: 270 },
        //overflow: 'visible',
      }}
    >
      <TextField
        autoFocus
        //  ref={textfieldRef}
        spellCheck
        label={'Send ' + contact.nickname + ' a message'}
        placeholder={'Hi ' + contact.nickname + '!'}
        sx={{ width: '90%' }}
        variant="filled"
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
