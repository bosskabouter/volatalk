/** @jsxImportSource @emotion/react */

import React, { useContext, useState } from 'react';

import { Button, TextField } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { UserContext } from 'providers/UserProvider';

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import { QrReader } from 'react-qr-reader';
import { checkReceivedInvite, makeInvite } from 'services/InvitationService';
import shareSomething from 'util/Share';

export default function Invite() {
  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  const { user } = useContext(UserContext);

  const [inviteUrl, setInviteUrl] = useState('');

  const handleInviteTextChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const inviteText = event?.target?.value ? event.target?.value : '';

    console.debug('Invitation text: ' + inviteText);
    makeInvite(user, inviteText).then((iUrl) => {
      console.log('Generated new inviteURL: ' + iUrl);
      setInviteUrl(iUrl);
      setOpenSnackbar(true);
    });
  };
  const handleShareInvite = (txt: string) => {
    console.log(txt);
    shareSomething('VolaTALK Invitation', 'Invitation from ' + user.nickname, inviteUrl);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (_event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnackbar(false);
  };

  const actionSnackbar = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={handleCloseSnackbar}>
        UNDO
      </Button>
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <div>
      <TextField
        placeholder="Enter invitation text"
        variant={'outlined'}
        label={'Invitation text'}
        onChange={(value) => handleInviteTextChange(value)}
      ></TextField>
      <br />
      <br />
      <Button onClick={(_e) => handleShareInvite('clicked here!')}>Share Invite!</Button>
      <br />
      <QRCodeSVG value={inviteUrl} size={300} />
      <InviteScanner></InviteScanner>
      <p>{inviteUrl}</p>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Note archived"
        action={actionSnackbar}
      />
    </div>
  );
}

const InviteScanner = () => {
  const [scanResult, setScanResult] = useState('No result');

  return (
    <>
      <QrReader 
        onResult={(result, error) => {
          if (!!result) {
            checkReceivedInvite(result?.getText());
            setScanResult(result?.getText());
          }

          if (!!error) {
            console.info('Nothing found: ' + error);
          }
        }}
        css={{ width: '300px' }}
        constraints={{ noiseSuppression: true }}
      />
      <p>{scanResult}</p>
    </>
  );
};
