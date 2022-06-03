/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { AppBar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Geolocation from '../../util/geo/GeoLocation';

const Footer = () => {
  const theme = useTheme();

  const styles = {
    footerRoot: css`
      padding: ${theme.spacing(2)} ${theme.spacing(2)};
    `,
    logos: css`
      margin-bottom: ${theme.spacing(2)};
      max-width: 360px;
      bottom: 0;
    `,
  };

  return (
    <AppBar css={styles.footerRoot} position="relative">
      <Geolocation></Geolocation>
    </AppBar>
  );
};

export default Footer;
