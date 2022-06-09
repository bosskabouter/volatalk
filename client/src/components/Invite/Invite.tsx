/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { QrReader } from 'react-qr-reader';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { TextField, Box, Button, Dialog, useTheme, DialogContent } from '@mui/material';

import QrCode2Icon from '@mui/icons-material/QrCode';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

import { isMobile } from 'react-device-detect';

import { UserContext } from '../../providers/UserProvider';
import { makeInviteURL } from '../../services/InvitationService';
import Share from '../../util/Share';

export default function Invite() {
  const inputRef = useRef();
  const { user } = useContext(UserContext);

  const [toggleReaderScanner, setToggle] = useState(true);
  const [inviteText, setInviteText] = useState('Invitation from ' + user.nickname);
  const [inviteUrl, setInviteUrl] = useState('');
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [isDirty, setIsDirty] = useState(true);

  const navigate = useNavigate();

  const theme = useTheme();
  const styles = {
    root: css`
      padding: ${theme.spacing(1)} ${theme.spacing(1)};
      justify-content: center;
      align: center;
    `,

    viewFinderStyle: css`
      z-index: 1;
      position: absolute;
      top: 0;
      left: 0;
      border: '50px solid rgba(0, 0, 0, 0.3)';
    `,
  };

  useEffect(() => {
    console.debug('useEffect setInterval isGeneratingInvite');

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
      Share(inviteUrl);
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
          //autoFocus
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
          <QRCode
            value={inviteUrl}
            size={320}
            //width={'100%'}
            //css={styles.qrCode}
            includeMargin={true}
            bgColor="white"
            style={{
              minWidth: 200,
              minHeight: 200,
              width: '63vw',
              height: '63vw',
              maxHeight: '63vh',
              maxWidth: '63vh',
            }}
          />
        )}
      </Box>
    );
  }

  const DisplayQRScanner = () => {
    const ViewFinder = () => (
      <svg viewBox="-20 -20 140 140" css={styles.viewFinderStyle}>
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
        containerStyle={{
          minWidth: 200,
          minHeight: 200,
          width: '63vw',
          height: '63vw',
          maxHeight: '63vh',
          maxWidth: '63vh',
        }}
        // css={styles.qrReader}
        onResult={(result, error) => {
          if (!!result) {
            console.info('Scanned QR', result);
            navigate('/' + new URL(result.getText()).search);
          }
          if (!!error) {
            console.debug('Scanned nothing... ');
          }
        }}
        constraints={{ facingMode: isMobile ? 'environment' : 'user' }}
      />
    );
  };
  const handleToggle = (_event: React.MouseEvent<HTMLElement>, newScanOrShow: boolean) => {
    if (newScanOrShow === !toggleReaderScanner) {
      setToggle(newScanOrShow);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={() => navigate('/', { replace: false })}
      transitionDuration={{ enter: 1500 }}
      //  maxWidth="md"
      fullWidth={true}
      style={{ minWidth: 300 }}
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
