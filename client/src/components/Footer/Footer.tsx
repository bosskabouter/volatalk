/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { AppBar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PeerMan from 'services/PeerMan';
import Geolocation from 'util/GeoLocation';

const Footer = () => {
  const theme = useTheme();

  const styles = {
    footerRoot: css`
      padding: ${theme.spacing(2)} ${theme.spacing(2)};
    `,
    logos: css`
      margin-bottom: ${theme.spacing(2)};
      max-width: 480px;
    `,
  };

  return (
    <AppBar css={styles.footerRoot} position="static">
      
      <Geolocation></Geolocation>
      
    </AppBar>
  );
};

export default Footer;
