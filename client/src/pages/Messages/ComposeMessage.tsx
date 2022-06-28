import { useContext, useState } from 'react';
import {
  AppBar,
  Box,
  InputAdornment,
  TextField,
  Dialog,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import EmojiPicker from 'emoji-picker-react';

import IconButton from '@mui/material/IconButton';

import SendTextIcon from '@mui/icons-material/Send';

import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

import { PeerContext } from '../../providers/PeerProvider';
import { IContact, IMessage } from '../../types';
import linkifyStr from 'linkify-string';
import { ImageUploader } from 'components/ImageUploader';

export const ComposeMessage = ({
  contact,
  onSend,
}: {
  contact: IContact;
  onSend: (msg: IMessage) => void;
}) => {
  const [sndMessageText, setSndMessageText] = useState<string>('');
  const [openEmoji, setOpenEmoji] = useState(false);
  const [openShare, setOpenShare] = useState(false);

  const peerManager = useContext(PeerContext);
  const sendText = async () => {
    if (peerManager && contact && sndMessageText.trim().length > 0) {
      console.log('Sending text: ' + sndMessageText);

      const linkified = linkifyStr(sndMessageText);

      //console.debug('Linkified: ' + linkified);
      const msg = await peerManager.sendText(sndMessageText, contact);
      setSndMessageText('');

      onSend(msg);
    }
  };

  const ShareButton = () => {
    return openShare ? (
      <Dialog
        open={openShare}
        onClose={() => {
          setOpenShare(false);
          return true;
        }}
      >
        <DialogContent>
          <DialogContentText>Share a Photo</DialogContentText>
          <ImageUploader
            onUploaded={(base64EncodedImage) => {
              setSndMessageText(`<img src='${base64EncodedImage}'/>`);
              setOpenShare(false);
              sendText();
            }}
          ></ImageUploader>
        </DialogContent>
      </Dialog>
    ) : (
      <IconButton
        onClick={() => {
          setOpenShare(true);
        }}
      >
        <PhotoCameraIcon />
      </IconButton>
    );
  };

  const ChooseEmojiButton = () => {
    return openEmoji ? (
      <Box
        sx={{
          pb: '190px',
          bottom: 180,
          right: 20,
          border: 1,
          zIndex: 1,
        }}
      >
        <EmojiPicker
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
    <AppBar
      // css={styles.footerRoot}
      position="fixed"
      variant="elevation"
      color="default"
      sx={{ top: 'auto', bottom: '4rem' }}
    >
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
                <ShareButton />
                <ChooseEmojiButton />
              </InputAdornment>
            ),
          }}
        />

        <IconButton onClick={sendText} size="medium" color="secondary">
          <SendTextIcon />
        </IconButton>
      </Box>
    </AppBar>
  );
};
