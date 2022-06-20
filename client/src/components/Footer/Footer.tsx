/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { AppBar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { WidgetBar } from 'util/Widgets/WidgetBar';

const Footer = () => {
  const theme = useTheme();

  const styles = {
    footerRoot: css`
      bottom: 0;
      overflow: overlay;
      min-width: 360px;
      padding: ${theme.spacing(0)} ${theme.spacing(3)};
    `,
    logos: css`
      margin-bottom: ${theme.spacing(2)};
      max-width: 360px;
      bottom: 0;
    `,
  };

  return (
    <AppBar css={styles.footerRoot} position="static" variant="elevation">
      <WidgetBar />
    </AppBar>
  );
};

export default Footer;
