/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { AppBar, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PeerContext } from 'providers/PeerProvider';

import { useContext, useEffect } from 'react';

const PeerDisplay = () => {

  
  const theme = useTheme();

  const peerManager = useContext(PeerContext);

  const styles = {
    footerRoot: css`
      padding: ${theme.spacing(4)} ${theme.spacing(2)};
    `,
    logos: css`
      margin-bottom: ${theme.spacing(4)};
      max-width: 480px;
    `,
  };

  useEffect(() => {
    console.info('used effect somewhere..');
  });

  return (
    <AppBar css={styles.footerRoot} position="static">
      <Grid container alignItems="center" direction="column">
        {peerManager && peerManager.myPeer
          ? (peerManager.myPeer.disconnected ? ' 🚫 ' : ' ✅ ') + peerManager.myPeer.id
          : 'no peer'}
      </Grid>
    </AppBar>
  );
};

export default PeerDisplay;
