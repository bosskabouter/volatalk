/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Link, List, ListItem, ListItemText, IconButton, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Logo from '../../assets/svg/logo-yellow.svg';
import packageJson from '../../../package.json';

import PsychologyIcon from '@mui/icons-material/Psychology';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import SignalCellularNodataIcon from '@mui/icons-material/SignalCellularNodata';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import OpenSourceIcon from '@mui/icons-material/ImportContacts';
import PushedIcon from '@mui/icons-material/ForwardToInbox';
import EncryptedIcon from '@mui/icons-material/MailLock';
import GitHubIcon from '@mui/icons-material/GitHub';
import logo from '../../assets/svg/logo-black.svg';
const About = () => {
  const styles = {
    box: css`
      display: flex;
      flex-direction: column;
      width: 100%;
      margin-top: 63px;
    `,
    logo: css`
      display: block;
      margin-left: auto;
      margin-right: auto;
      width: 20%;
      padding-bottom: 5%;
    `,
    version: css`
      padding-top: 2%;
    `,
  };

  return (
    <Container component="main" maxWidth="xl">
      <CssBaseline />
      <Box css={styles.box}>
        <List>
          <ListItem key="0">
            <ListItemText
              primary={
                <Stack direction={'row'}>
                  <Typography variant={'subtitle1'}>
                    Nothing as volatile
                    <PsychologyIcon color="secondary" />
                    as the human mind
                  </Typography>
                </Stack>
              }
            />
          </ListItem>
          <ListItem key="1">
            <ListItemText
              primary={
                <>
                  <ConnectWithoutContactIcon color="secondary" />
                  Communicate Directly
                </>
              }
              secondary={
                <>
                  Without a central server able to capture or censuring your data. If you lose
                  access to your account your identity cannot be recovered, because it is stored
                  nowhere else.
                  <IconButton
                    onClick={() => alert('Soon.. Bip39 Mnemonics here')}
                    size="small"
                    color={'primary'}
                  >
                    <SettingsBackupRestoreIcon fontSize="small" /> Backup
                  </IconButton>
                </>
              }
            />
          </ListItem>
          <ListItem key="2">
            <ListItemText
              primary={
                <>
                  <SignalCellularNodataIcon color="secondary" /> Use Offline
                </>
              }
              secondary={
                <>
                  Read and write messages anytime, once back and connected with your contacts all
                  messages will be synchronized. If the other person is offline and enabled push
                  notifications, an icon <PushedIcon fontSize="small" /> will inform you.
                </>
              }
            />
          </ListItem>
          <ListItem key="3">
            <ListItemText
              primary={
                <>
                  <EncryptedIcon color="secondary" />
                  Securely Encrypted
                </>
              }
              secondary={
                <>
                  Messages are encrypted in your local storage and only trusted connections are
                  allowed to connect. Messages are encrypted with a secret only known by you and
                  your contact. This applies also to push messages.
                </>
              }
            />
          </ListItem>
          <ListItem key="4">
            <ListItemText
              primary={
                <>
                  <OpenSourceIcon color="secondary" />
                  Trust Open Source
                </>
              }
              secondary={
                <Link
                  href="https://github.com/bosskabouter/volatalk"
                  target={'_blank'}
                  rel="noreferrer"
                >
                  <>
                    Source available on GitHub <GitHubIcon />
                  </>
                </Link>
              }
            />
          </ListItem>
        </List>
      </Box>

      <img alt="logo" src={logo} css={styles.logo} />

      <Typography css={styles.version}> v{packageJson.version}</Typography>
    </Container>
  );
};

export default About;
