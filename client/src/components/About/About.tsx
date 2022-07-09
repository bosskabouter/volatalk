/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Box,
  Link,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Stack,
  Avatar,
  useTheme,
} from '@mui/material';
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

import { useNavigate } from 'react-router-dom';
import InfoIcon from '@mui/icons-material/Info';
import React, { ReactElement } from 'react';

const About = () => {
  const theme = useTheme();

  const navigate = useNavigate();

  const styles = {
    box: css`
      display: flex;
      flex-direction: column;
      width: 100%;
      margin-top: 63px;
      justify-items: 'center';
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

  const bulletVariant = 'h6';

  const Feature = (props: {
    primaryText: React.ReactNode;
    secondaryText: React.ReactNode;
    icon: ReactElement;
    idx: number | string;
  }) => {
    return (
      <ListItem key={props.idx}>
        <ListItemText
          primary={
            <Typography
              variant={bulletVariant}
              color={theme.palette.secondary.main}
              noWrap
              gap={52}
              alignContent="center"
            >
              {props.icon} {props.primaryText}
            </Typography>
          }
          secondary={props.secondaryText}
        />
      </ListItem>
    );
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
                    <Typography variant={'subtitle2'} noWrap alignItems={'center'}>
                      <em>
                        Nothing as volatile
                        <PsychologyIcon color="secondary" fontSize={'large'} />
                        as the human mind
                      </em>
                    </Typography>
                  </Stack>
                  <Typography variant={'subtitle1'}> </Typography>
                </Stack>
              }
            />
          </ListItem>

          <Feature
            idx={1}
            icon={<ConnectWithoutContactIcon />}
            primaryText={<>Communicate Directly</>}
            secondaryText={
              <React.Fragment>
                Connect with your contacts without a server to capture your messages or censure your
                account. If you lose access to your account your identity cannot be recovered
                because it is stored nowhere else.
                <IconButton onClick={() => navigate('/backup')} size="small" color={'primary'}>
                  <SettingsBackupRestoreIcon fontSize="small" /> Backup
                </IconButton>
              </React.Fragment>
            }
          />

          <Feature
            idx={2}
            icon={<SignalCellularNodataIcon />}
            primaryText={<>Use Offline</>}
            secondaryText={
              <React.Fragment>
                Read and write messages anytime. Back connected with your contacts all messages are
                synchronized. If the other person is offline and enabled push notifications, an icon{' '}
                <PushedIcon fontSize="small" /> appears next to the message.
              </React.Fragment>
            }
          />
          <Feature
            idx={3}
            icon={<EncryptedIcon />}
            primaryText={<>Secure Encryption</>}
            secondaryText={
              <React.Fragment>
                All sensitive information is encrypted in your local storage and only trusted
                contacts can connect. Encrypted messages can only be read by the receiver. This
                applies also to push notications.
              </React.Fragment>
            }
          />
          <Feature
            idx={5}
            icon={<OpenSourceIcon />}
            primaryText={<>Trust Open Source</>}
            secondaryText={
              <React.Fragment>
                <span>Source and technical details: </span>
                <Link
                  href="https://github.com/bosskabouter/volatalk"
                  target={'_blank'}
                  rel="noreferrer"
                >
                  GitHub <GitHubIcon />
                </Link>
              </React.Fragment>
            }
          />
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

export const AboutVolaTalkIcon = () => {
  const navigate = useNavigate();

  return (
    <IconButton
      onClick={() => {
        navigate('/About');
      }}
    >
      <InfoIcon />
    </IconButton>
  );
};

export default About;
