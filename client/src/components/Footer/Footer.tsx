/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { AppBar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PeerDisplay from 'components/PeerDisplay/PeerDisplay';

const Footer = () => {
  const theme = useTheme();

  const styles = {
    footerRoot: css`
      padding: ${theme.spacing(4)} ${theme.spacing(2)};
    `,
    logos: css`
      margin-bottom: ${theme.spacing(4)};
      max-width: 480px;
    `,
  };

  return (
    <AppBar css={styles.footerRoot} position="static">
      <PeerDisplay></PeerDisplay>
    </AppBar>
  );
};

export default Footer;
