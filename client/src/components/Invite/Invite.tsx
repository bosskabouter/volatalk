import { extractInvite, IInvite, makeInviteURL } from 'services/InvitationService';

import React, { useContext, useRef } from 'react';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Link } from 'react-router-dom';

import { QRCodeSVG } from 'qrcode.react';
import { QrReader } from 'react-qr-reader';

import shareSomething from 'util/Share';
import { Box, Button, Dialog } from '@mui/material';
import { UserContext } from 'providers/UserProvider';
import TextField from '@mui/material/TextField';

import QrCode2Icon from '@mui/icons-material/QrCode';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

import Close from '@mui/icons-material/Close';

export default function Invite() {
  const inputRef = useRef();
  const { user } = useContext(UserContext);

  const [showOrScan, setShowOrScan] = React.useState<boolean>(true);

  const handleShowOrScan = (_event: React.MouseEvent<HTMLElement>, newScanOrShow: boolean) => {
    setShowOrScan(newScanOrShow);
  };

  function DisplayQR() {
    const [inviteUrl, setInviteUrl] = React.useState('');
    const handleShareInvite = (txt: string) => {
      console.log(txt);
      shareSomething('VolaTALK Invitation', 'Invitation from ' + user.nickname, inviteUrl);
    };

    const handleInviteTextChange = (
      event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
      if (!event || !event.target || !event.target.value) {
        return;
      }
      const inviteText = event.target.value;

      console.debug('Invitation text: ' + inviteText);
      makeInviteURL(user, inviteText).then((iUrl) => {
        console.log('Generated new inviteURL: ' + iUrl);
        setInviteUrl(iUrl.toString());
      });
    };

    return (
      <>
        <Box>
          <br />
          <TextField
            spellCheck
            inputRef={inputRef}
            fullWidth
            placeholder="Enter invitation text"
            variant={'outlined'}
            label={'Invitation text'}
            onChange={(value) => handleInviteTextChange(value)}
          ></TextField>
          <br />
          <br />
          <Button
            onClick={(_e) => handleShareInvite('clicked here!')}
            variant="contained"
            fullWidth
          >
            Share Invite!
          </Button>
          <br />
          <br />

          {inviteUrl.length > 0 && (
            <QRCodeSVG value={inviteUrl} size={300} includeMargin style={{ width: '100%' }} />
          )}
        </Box>
      </>
    );
  }

  const DisplayScanner = () => {
    const [scanResult, setScanResult] = React.useState('No result');
    const [invite, setInvite] = React.useState<IInvite | null>();

    return (
      <>
        {invite ?? <br />}
        <QrReader
          onResult={(result, error) => {
            if (!!result) {
              const url = result?.getText();
              setScanResult(url);
              const u = new URL(url);
              extractInvite(u.searchParams).then((inv) => {
                setInvite(inv);
              });
            }

            if (!!error) {
              console.info('Scanned nothing... ' + error);
            }
          }}
          constraints={{ noiseSuppression: true }}
        />
        <em>{scanResult}</em>
      </>
    );
  };

  return (
    <Dialog open fullWidth>
      <Link to="/">
        <Close />
      </Link>
      <>
        {showOrScan ? <DisplayQR /> : <DisplayScanner />}

        <ToggleButtonGroup value={showOrScan} fullWidth exclusive onChange={handleShowOrScan}>
          <ToggleButton value={true}>
            <QrCode2Icon /> SHOW INVITE
          </ToggleButton>
          <ToggleButton value={false}>
            READ INVITE
            <QrCodeScannerIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </>
    </Dialog>
  );
}
