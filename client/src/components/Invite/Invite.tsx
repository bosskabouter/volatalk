/** @jsxImportSource @emotion/react */

import React, { useContext, useState } from 'react';

import { Button, Input, TextField } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { UserContext } from 'providers/UserProvider';

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import { QrReader } from 'react-qr-reader';
import { checkReceivedInvite, makeInvite } from 'services/InvitationService';

export default function Invite() {
  const [data, setData] = useState('No result');
  const [open, setOpen] = React.useState(false);
  const [inviteData, setInviteData] = useState('No result');

  const { user } = useContext(UserContext);

  const handleInviteTextChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const inviteText = event?.target?.value ? event.target?.value : '';

    console.debug('Invitation text: ' + inviteText);
    const inviteUrl = makeInvite(user, inviteText);
    console.log("Generated new inviteURL: " + inviteUrl);
    setData(inviteData);
    setOpen(true);
  };
  const handleShareInvite = (txt: string) => {
    console.log(txt);
    setOpen(true);
  };

  const handleClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };
  const action = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={handleClose}>
        UNDO
      </Button>
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
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
      <QRCodeSVG value={user?.peerid} />
      <Test></Test>
      <p>{data}</p>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message="Note archived"
        action={action}
      />
    </div>
  );
}

const Test = () => {
  const [data, setData] = useState('No result');

  return (
    <>
      <QrReader
        onResult={(result, error) => {
          if (!!result) {
            checkReceivedInvite(result?.getText());
            setData(result?.getText());
          }

          if (!!error) {
            console.info('Nothing found: ' + error);
          }
        }}
        css={{ width: '100%' }}
        constraints={{ noiseSuppression: true }}
      />
      <p>{data}</p>
    </>
  );
};
