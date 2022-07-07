/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Link, List, ListItem, ListItemText, IconButton, Stack, Avatar } from '@mui/material';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
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
  //const theme = useTheme();
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
                <Stack direction={'column'} alignItems={'center'}>
                  <Stack direction={'row'}>
                    <Typography variant={'subtitle2'}>
                      Nothing as volatile
                      <PsychologyIcon color="secondary" />
                      as the human mind
                    </Typography>
                  </Stack>
                  <Typography variant={'subtitle1'}>Thank the universe </Typography>
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
                  Without a central server to capture or censure your data. If you lose access to
                  your account your identity cannot be recovered because it is stored nowhere else.
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
                  Read and write messages anytime. Back and connected with your contacts all
                  messages are synchronized. If the other person is offline and enabled push
                  notifications, an icon <PushedIcon fontSize="small" /> appears next to the
                  message.
                </>
              }
            />
          </ListItem>
          <ListItem key="3">
            <ListItemText
              primary={
                <>
                  <EncryptedIcon color="secondary" />
                  Secure Encryption
                </>
              }
              secondary={
                <>
                  All sensitive information is encrypted in your local storage and only trusted
                  connections are allowed to connect. Messages are encrypted with a secret only you
                  and your contact share. This applies also to push messages.
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
                <>
                  Source and technical details on{' '}
                  <Link
                    href="https://github.com/bosskabouter/volatalk"
                    target={'_blank'}
                    rel="noreferrer"
                  >
                    GitHub <GitHubIcon />
                  </Link>
                </>
              }
            />
          </ListItem>
        </List>
      </Box>
      <Stack direction={'column'} alignItems={'center'}>
        <Avatar
          src={logo}
          variant="rounded"
          sx={{
            width: 90,
            height: 90,
            border: 0,
            alignContent: 'center',
            // color: theme.palette.secondary.main,
            // bgcolor: theme.palette.secondary.main,
          }}
        ></Avatar>
        <Typography css={styles.version}> v{packageJson.version}</Typography>
      </Stack>
    </Container>
  );
};

export default About;
