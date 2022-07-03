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
    <div>
      <CssBaseline />
      <AppBar
        role={'banner'}
        position="fixed"
        variant="elevation"
        color="primary"
        sx={{ top: '0', bottom: 'auto' }}
      >
        <Toolbar variant="dense">
          <Typography variant="h6" noWrap css={styles.title}>
            <Link to="/">
              <Avatar
                src={logo}
                variant="rounded"
                sx={{
                  width: 45,
                  height: 45,
                  border: 3,
                }}
              ></Avatar>
            </Link>
          </Typography>
          <AccountAvatar />
        </Toolbar>
      </AppBar>
    </div>
  );
}
