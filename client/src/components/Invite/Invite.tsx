/** @jsxImportSource @emotion/react */
//import { QRCodeSVG } from 'qrcode.react';
import { QrReader } from 'react-qr-reader';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { TextField, Box, Button, Dialog, useTheme, DialogContent } from '@mui/material';

import QrCode2Icon from '@mui/icons-material/QrCode';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

import { isMobile } from 'react-device-detect';

import { css } from '@emotion/react';
import { UserContext } from '../../providers/UserProvider';
import { makeInviteURL } from '../../services/InvitationService';
import shareURL from '../../util/Share';
import { QRCodeSVG } from 'qrcode.react';
export default function Invite() {
  const inputRef = useRef();
  const { user } = useContext(UserContext);

  const [toggleReaderScanner, setToggle] = useState(true);
  const [inviteText, setInviteText] = useState('Invitation from ' + user.nickname);
  const [inviteUrl, setInviteUrl] = useState('');
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [isDirty, setIsDirty] = useState(true);

  const navigate = useNavigate();

  const fullScreen = isMobile ? true : false;
  const theme = useTheme();
  const styles = {
    footerRoot: css`
      padding: ${theme.spacing(2)} ${theme.spacing(2)};
    `,
    viewFinderStyle: css`
   
    padding:0,
      top: 0,
      left: 0,
      zIndex: 1,
      boxSizing: 'border-box',
      border: '50px solid rgba(0, 0, 0, 0.3)',
      position: 'absolute',
      width: '100%',
      height: '100%',


    `,
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty && !isGeneratingInvite && inviteText?.length > 0) {
        setIsGeneratingInvite(true);
        //wait to complete writing the text to generate the heavy inv
        makeInviteURL(user, inviteText).then((inviteURL) => {
          console.log('Generated new inviteURL', inviteURL);
          setInviteUrl(inviteURL.toString());
          setIsGeneratingInvite(false);
          setIsDirty(false);
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [inviteText, isDirty, isGeneratingInvite, user]);

  function DisplayQRCode() {
    const handleShareInvite = () => {
      shareURL(inviteUrl);
    };

    const handleInviteTextChange = (
      event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
      setIsDirty(true);
      setInviteText(event?.target?.value);
    };

    return (
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
          onChange={handleInviteTextChange}
        ></TextField>
        <br />
        <Button onClick={handleShareInvite} variant="contained" fullWidth>
          Share Invite!
        </Button>

        {inviteUrl.length > 0 && (
          <QRCodeSVG value={inviteUrl} size={300} includeMargin style={{ width: '100%' }} />
        )}
      </Box>
    );
  }

  const DisplayQRScanner = () => {
    const ViewFinder = () => (
      <svg width="100%" viewBox="0 0 100 100" css={styles.viewFinderStyle}>
        <path fill="none" d="M13,0 L0,0 L0,13" stroke="rgba(255, 0, 0, 0.5)" strokeWidth="5" />
        <path fill="none" d="M0,87 L0,100 L13,100" stroke="rgba(255, 0, 0, 0.5)" strokeWidth="5" />
        <path
          fill="none"
          d="M87,100 L100,100 L100,87"
          stroke="rgba(255, 0, 0, 0.5)"
          strokeWidth="5"
        />
        <path fill="none" d="M100,13 L100,0 87,0" stroke="rgba(255, 0, 0, 0.5)" strokeWidth="5" />
      </svg>
    );

    return (
      <QrReader
        ViewFinder={ViewFinder}
        videoId="video"
        videoStyle={{ width: '100%', align: 'center' }}
        onResult={(result, error) => {
          if (!!result) {
            const url = result?.getText();
            const u = new URL(url);
            navigate('/' + u.search);
          }
          if (!!error) {
            console.debug('Scanned nothing... ' + error);
          }
        }}
        constraints={{ facingMode: isMobile ? 'environment' : 'user' }}
      />
    );
  };
  const handleToggle = (_event: React.MouseEvent<HTMLElement>, newScanOrShow: boolean) => {
    if (newScanOrShow === !toggleReaderScanner) setToggle(newScanOrShow);
  };
  return (
    <Dialog
      open={true}
      onClose={() => navigate('/', { replace: false })}
      transitionDuration={{ enter: 1500 }}
      maxWidth="lg"
      fullWidth={fullScreen}
    >
      <DialogContent>
        {toggleReaderScanner ? <DisplayQRCode /> : <DisplayQRScanner />}

        <ToggleButtonGroup value={toggleReaderScanner} fullWidth exclusive onChange={handleToggle}>
          <ToggleButton value={true}>
            <QrCode2Icon /> SHOW
          </ToggleButton>
          <ToggleButton value={false}>
            SCAN
            <QrCodeScannerIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </DialogContent>
    </Dialog>
  );
}
