/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import {
  Avatar,
  Badge,
  Tooltip,
  Dialog,
  IconButton,
  DialogContent,
  useTheme,
  DialogTitle,
} from '@mui/material';

import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../providers/UserProvider';
import { PeerContext } from '../../providers/PeerProvider';
import { PeerIdenticon } from './PeerIdenticon';

import { MonitorHeart } from '@mui/icons-material';

const PeerDisplay = () => {
  const peerCtx = useContext(PeerContext);
  const userCtx = useContext(UserContext);
  const [status, setStatus] = useState(false);
  const [peerIdenticon, setPeerIdenticon] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (userCtx?.user?.id && !peerIdenticon) {
      setPeerIdenticon(PeerIdenticon({ peerid: userCtx.user.peerid }));
    }
  }, [peerIdenticon, userCtx]);

  useEffect(() => {
    peerCtx?.on('statusChange', setStatus);
  }, [peerCtx]);
  const theme = useTheme();
  const styles = {
    dialogRoot: css`
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      color: ${theme.palette.common.white};
    `,
    dialogContent: css`
      //   overflow: hidden;
      display: flex;
      width: 100%;
      //   height: 60%;

      padding: 1rem 1rem 1rem 1rem;
      min-height: 18rem;
      min-width: 30rem;
      // width: 18rem;

      color: ${theme.palette.common.white};
      @media only screen and (min-width: 768px) {
        // padding: 1rem 2rem 1rem 2rem;
        // min-height: 50rem;
        min-width: 50rem;
        // width: 38rem;
      }
    `,
    monitorIframe: css`
      overflow: hidden;
      overflow-y: hidden; /* Hide vertical scrollbar */
      overflow-x: hidden; /* Hide horizontal scrollbar */
      // height: 70%;
      width: 90%;
      // position: absolute;
      //   min-height: 10rem;
      background-color: ${theme.palette.primary.main};
      display: flex;
      color: ${theme.palette.primary.main};

      font: 1;
    `,
  };
  return (
    <>
      <Tooltip title={status ? 'Online' : 'Currently Offline :('}>
        <IconButton onClick={() => setOpen(true)}>
          <Badge
            variant={'dot'}
            color={status ? 'success' : 'error'}
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Avatar src={peerIdenticon} sx={{ width: 36, height: 36, border: 1 }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        //maxWidth="lg"
        css={styles.dialogRoot}
      >
        <DialogTitle>
          <MonitorHeart /> Service Monitor
        </DialogTitle>
        <DialogContent css={styles.dialogContent}>
          <iframe
            title="External Monitoring"
            referrerPolicy="no-referrer"
            css={styles.monitorIframe}
            src="https://www.port-monitor.com/status-pages/5Bz%2F2YAgn7pQTDQA7TOMJQ%3D%3D%0A"
            //      style={"overflow: hidden; height: 100%; width: 100%; position: absolute;"}
          ></iframe>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PeerDisplay;
