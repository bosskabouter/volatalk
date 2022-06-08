/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { AppBar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { WidgetBar } from 'util/Widgets/WidgetBar';

const Footer = () => {
  const theme = useTheme();

  const styles = {
    footerRoot: css`
      position: fixed;
      bottom: 0;
      overflow: overlay;

      padding: ${theme.spacing(0)} ${theme.spacing(1)};
    `,
    logos: css`
      margin-bottom: ${theme.spacing(2)};
      max-width: 360px;
      bottom: 0;
    `,
  };

  return (
    <AppBar css={styles.footerRoot} position="relative">
      <WidgetBar />
    </AppBar>
  );
};

export default Footer;
