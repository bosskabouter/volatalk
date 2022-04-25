import React, { useContext } from 'react';

import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { QRCodeSVG } from 'qrcode.react';
import { QrReader } from 'react-qr-reader';
import { checkReceivedInvite, makeInvite } from 'services/InvitationService';
import shareSomething from 'util/Share';
import { Button } from '@mui/material';
import { UserContext } from 'providers/UserProvider';
import TextField from '@mui/material/TextField';

import QrCode2Icon from '@mui/icons-material/QrCode2';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

export default function Invite() {
  const [scanOrShow, setScanOrShow] = React.useState<boolean>(true);

  const handleScanOrShow = (_event: React.MouseEvent<HTMLElement>, newScanOrShow: boolean) => {
    setScanOrShow(newScanOrShow);
  };
  const [inviteUrl, setInviteUrl] = React.useState('');

  const { user } = useContext(UserContext);

  const InviteShowQR = () => {
    const handleShareInvite = (txt: string) => {
      console.log(txt);
      shareSomething('VolaTALK Invitation', 'Invitation from ' + user.nickname, inviteUrl);

    };

    return (
      <>
        <TextField
          placeholder="Enter invitation text"
          variant={'outlined'}
          label={'Invitation text'}
          onChange={(value) => handleInviteTextChange(value)}
        ></TextField>

        <Button onClick={(_e) => handleShareInvite('clicked here!')} variant="contained">
          Share Invite!
        </Button>
        <br />
        <QRCodeSVG value={inviteUrl} size={300} />
      </>
    );
  };

  const InviteScanner = () => {
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

  const handleInviteTextChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const inviteText = event?.target?.value ? event.target?.value : '';

    console.debug('Invitation text: ' + inviteText);
    makeInvite(user, inviteText).then((iUrl) => {
      console.log('Generated new inviteURL: ' + iUrl);
      setInviteUrl(iUrl);
      // setOpenSnackbar(true);
    });
  };

  return (
    <>

      <ToggleButtonGroup
        value={scanOrShow}
        exclusive
        onChange={handleScanOrShow}
        aria-label="text alignment"
      >
        <ToggleButton value="false">
          <QrCode2Icon/> Show Your QR Invite
        </ToggleButton>
        <ToggleButton value="true">
          
          Read someone else Invite
          <QrCodeScannerIcon />
          
        </ToggleButton>
      </ToggleButtonGroup>

      {scanOrShow ? <InviteShowQR /> : <InviteScanner />}


    </>
  );
}
