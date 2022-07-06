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
import Encrypted from '@mui/icons-material/MailLock';
import GitHubIcon from '@mui/icons-material/GitHub';

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
      width: 30%;
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
              sx={{ textAlign: 'center' }}
              primary={
                <Stack direction={'row'}>
                  <>Nothing as volatile </>
                  <PsychologyIcon color="secondary" />
                  <>as the human thought </>
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
                  Without a central server storing your private data. If you lose access to your
                  account your identity cannot be recovered, because it is stored nowhere else.
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
                  <SignalCellularNodataIcon color="secondary" /> Installed for offline use
                </>
              }
              secondary={
                <>
                  You can read and write messages offline, once back and connected with your
                  contacts, all messages are syncronized. If the other person is offline and enabled
                  push notifications, an icon
                  <PushedIcon fontSize="small" />
                  appears next to the message.
                </>
              }
            />
          </ListItem>
          <ListItem key="3">
            <ListItemText
              primary={
                <>
                  <Encrypted color="secondary" />
                  Securely Encrypted
                </>
              }
              secondary={
                <>
                  All sensitive data is encrypted on your local device. Only connections with valid
                  signatures are allowed to connect. All data send is encrypted with a password
                  known only to the receiver of the message. This applies also to push messages, so
                  the browser push provider cannot know who or what information was sent.
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
                  <ListItemText
                    secondary={
                      <>
                        Source available on GitHub <GitHubIcon />
                      </>
                    }
                  />
                </Link>
              }
            />
          </ListItem>
        </List>
      </Box>
      <img alt="logo" src={Logo} css={styles.logo} />
      <Typography css={styles.version}> v{packageJson.version}</Typography>
    </Container>
  );
};

export default About;
