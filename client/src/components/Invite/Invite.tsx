/** @jsxImportSource @emotion/react */

import React, { useContext, useState } from 'react';

import { Button } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { UserContext } from 'providers/UserProvider';

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import { QrReader } from 'react-qr-reader';
export default function Invite() {

  const [data, setData] = useState('No result');

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
            setData(result?.getText());
          }

          if (!!error) {
            console.info("Nothing found: " + error);
          }
        } }
        css={{ width: '100%' }} constraints={{noiseSuppression:true}} />
      <p>{data}</p>
    </>
  );
};

