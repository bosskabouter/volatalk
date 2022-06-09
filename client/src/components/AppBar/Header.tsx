/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import logo from '../../assets/svg/logo-black.svg';

import { Typography, Toolbar, Avatar } from '@mui/material';
import AccountAvatar from '../StatusDisplay/AccountAvatar';

export default function Header() {
  const theme = useTheme();

  const styles = {
    root: css`
      display: flex;
    `,
    appBar: css`
      padding-right: 18px;
      padding-left: 18px;
    `,
    title: css`
      flex-grow: 1;
    `,

    link: css`
      text-decoration: none;
    `,

    content: css`
      flex-grow: 1;
      padding: ${theme.spacing(3)};
      transition: ${theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      })};
    `,
    contentShift: css`
      transition: ${theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      })};
      margin-right: 0;
    `,
    toolbarLogo: css`
      height: ${theme.spacing(5)};
      padding: ${theme.spacing(1)} 10;
      width: 40px;
    `,
  };

  return (
    <div css={styles.root}>
      <CssBaseline />
      <AppBar position={'fixed'} css={styles.appBar} role="banner">
        <Toolbar disableGutters variant="dense">
          <Typography variant="h6" noWrap css={styles.title}>
            <Link to="/">
              <Avatar
                src={logo}
                variant="rounded"
                color="secondary"
                sx={{ width: 36, height: 36, border: 0 }}
              ></Avatar>
            </Link>
          </Typography>
          <AccountAvatar />
        </Toolbar>
      </AppBar>
    </div>
  );
}
