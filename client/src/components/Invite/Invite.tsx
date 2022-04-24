/** @jsxImportSource @emotion/react */

import React, { useContext } from 'react';

import { Button } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { UserContext } from 'providers/UserProvider';

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
export default function Invite() {
  const [open, setOpen] = React.useState(false);
  const { user } = useContext(UserContext);

  const handleClick = (txt: string) => {
    console.log(txt);
    setOpen(true);
  };

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
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
      <Button onClick={(_e) => handleClick('clicked here!')}>Click</Button>
      <QRCodeSVG value={user?.peerid} />

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
