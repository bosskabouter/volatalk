import { extractInvite, IInvite, makeInviteURL } from 'services/InvitationService';

import React, { useContext, useEffect, useRef } from 'react';

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
import { identicon } from 'minidenticons';
import { isMobile } from 'react-device-detect';

export default function Invite() {
  const inputRef = useRef();
  const { user } = useContext(UserContext);

  const [toggle, setToggle] = React.useState<boolean>(true);
  const [inviteText, setInviteText] = React.useState<string>('Invitation from ' + user.nickname);
  const [inviteUrl, setInviteUrl] = React.useState('');

  const handleToggle = (_event: React.MouseEvent<HTMLElement>, _newScanOrShow: boolean) => {
    if (_newScanOrShow === !toggle) setToggle(_newScanOrShow);
  };

  useEffect(() => {
    makeInviteURL(user, inviteText).then((iUrl) => {
      console.log('Generated new inviteURL: ' + iUrl);
      setInviteUrl(iUrl.toString());
    });
  
  }, [inviteText, user]);

  function DisplayQRCode() {
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
      const iText = event.target.value;
      setInviteText(iText);
      //event.target.focus();

      console.debug('Invitation text: ' + iText);
      makeInviteURL(user, iText).then((iUrl) => {
        console.log('Generated new inviteURL: ' + iUrl);
        setInviteUrl(iUrl.toString());
      });
    };

    return (
      <>
        <Box>
          <TextField
            spellCheck
            autoFocus
            inputRef={inputRef}
            fullWidth
            placeholder="Enter invitation text"
            variant={'outlined'}
            label={'Invitation text'}
            value={inviteText}
            onChange={(e) => handleInviteTextChange(e)}
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

  const DisplayQRScanner = () => {
    const [scanResult, setScanResult] = React.useState('No result');
    const [invite, setInvite] = React.useState<IInvite | null>();

    return (
      <>
        {invite ?? <>wat gebeurt hier</>}
        <QrReader ViewFinder={ViewFinder}   
  videoId= 'video'
         
          videoStyle={{ width: '100%', align: 'center' }}
          onResult={(result, error) => {
            if (!!result) {
              const url = result?.getText();
              setScanResult(url);
              const u = new URL(url);
              document.location = document.location.origin + '/acceptInvite' + u.search;
            }

            if (!!error) {
              console.debug('Scanned nothing... ' + error);
            }
          }}
          constraints={{ noiseSuppression: true, facingMode: isMobile ? 'environment' : 'user' }}
        />
        {invite ? identicon(invite.peerId) : ''}
      </>
    );
  };

  return (
    <Dialog open fullWidth>
      <Link to="/">
        <Close />
      </Link>
      <>
        {toggle ? <DisplayQRCode /> : <DisplayQRScanner />}

        <ToggleButtonGroup value={toggle} fullWidth exclusive onChange={handleToggle}>
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



export const ViewFinder = () => (
  <>
    <svg
      width="50px"
      viewBox="0 0 100 100"
      style={{
        top: 0,
        left: 0,
        zIndex: 1,
        boxSizing: 'border-box',
        border: '50px solid rgba(0, 0, 0, 0.3)',
        position: 'absolute',
        width: '100%',
        height: '100%',
      }}
    >
      <path
        fill="none"
        d="M13,0 L0,0 L0,13"
        stroke="rgba(255, 0, 0, 0.5)"
        strokeWidth="5"
      />
      <path
        fill="none"
        d="M0,87 L0,100 L13,100"
        stroke="rgba(255, 0, 0, 0.5)"
        strokeWidth="5"
      />
      <path
        fill="none"
        d="M87,100 L100,100 L100,87"
        stroke="rgba(255, 0, 0, 0.5)"
        strokeWidth="5"
      />
      <path
        fill="none"
        d="M100,13 L100,0 87,0"
        stroke="rgba(255, 0, 0, 0.5)"
        strokeWidth="5"
      />
    </svg>
  </>
);