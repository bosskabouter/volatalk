/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { AppBar, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PeerContext } from 'providers/PeerProvider';

import { useContext, useEffect, useState } from 'react';

const PeerDisplay = () => {
  const [dateUpdated, setDateUpdated] = useState('');
  const theme = useTheme();

  const peer = useContext(PeerContext);

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
        {peer && peer.myPeer ? peer.myPeer.peerid : 'off-line  '}
      </Grid>
    </AppBar>
  );
};

export default PeerDisplay;
