/** @jsxImportSource @emotion/react */

import React from 'react';
import { css } from '@emotion/react';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { Button, Dialog, DialogContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface IInvite {
  text: string | undefined;
  qrcode: string | undefined;
  signature: string | undefined;
  url: URL | undefined;
}

class Invite extends React.Component<Record<string, never>, IInvite> {
  render() {
    return (
      <Button color="secondary" variant="contained" onClick={() => this.openDialog()}>
        <QrCode2Icon /> Share Invite
      </Button>
    );
  }

  openDialog() {


    const styles = {
      accountSetupDialogRoot: css`
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        color: white;
      `,
    };

    return (
      <Dialog
        css={styles.accountSetupDialogRoot}
        open={true}
        disableEscapeKeyDown
        maxWidth="lg"
        fullScreen={true}
      >
        <DialogContent id="dialog-agreement">
          <Typography component="h1" variant="h6">
            Invite
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }
}

export default Invite;
