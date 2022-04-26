import React, { useContext, useRef } from 'react';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { QRCodeSVG } from 'qrcode.react';
import { QrReader } from 'react-qr-reader';
import { checkReceivedInvite, makeInvite } from 'services/InvitationService';
import shareSomething from 'util/Share';
import { Box, Button } from '@mui/material';
import { UserContext } from 'providers/UserProvider';
import TextField from '@mui/material/TextField';

import QrCode2Icon from '@mui/icons-material/QrCode2';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

export default function Invite() {
  const inputRef = useRef();
  const { user } = useContext(UserContext);

  const [showOrScan, setShowOrScan] = React.useState<boolean>(true);
  // const [inviteTxt, setInviteTxt] = React.useState('');


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
      makeInvite(user, inviteText).then((iUrl) => {
        console.log('Generated new inviteURL: ' + iUrl);
        setInviteUrl(iUrl);
        //setInviteTxt(inviteText);
        //inputRef?.current?.focus();
      });
    };
  
    return (
      <>
        <Box>
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
          <br /> <QRCodeSVG value={inviteUrl} size={300} includeMargin style={{ width: '100%' }} />
        </Box>
      </>
    );
  }

  const DisplayScanner = () => {
    const [scanResult, setScanResult] = React.useState('No result');

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
          constraints={{ noiseSuppression: true }}
        />
        <p>{scanResult}</p>
      </>
    );
  };

  return (
    <>
      {showOrScan ? <DisplayQR /> : <DisplayScanner />}

      <ToggleButtonGroup value={showOrScan} fullWidth exclusive onChange={handleShowOrScan}>
        <ToggleButton value={true}>
          <QrCode2Icon /> Show Your Invite
        </ToggleButton>
        <ToggleButton value={false}>
          Read someone&apos;s Invite
          <QrCodeScannerIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </>
  );
}
