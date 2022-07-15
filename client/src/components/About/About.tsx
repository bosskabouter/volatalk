/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Box,
  Link,
  ListItem,
  ListItemText,
  IconButton,
  Stack,
  Avatar,
  useTheme,
  Card,
  CardHeader,
  CardContent,
  Grid,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import packageJson from '../../../package.json';

import PsychologyIcon from '@mui/icons-material/Psychology';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import OpenSourceIcon from '@mui/icons-material/ImportContacts';
import PushedIcon from '@mui/icons-material/ForwardToInbox';
import EncryptedIcon from '@mui/icons-material/MailLock';
import PrivateIcon from '@mui/icons-material/Security';
import NoSignalIcon from '@mui/icons-material/SignalCellularNodata';

import GitHubIcon from '@mui/icons-material/GitHub';
import logo from '../../assets/svg/logo-black.svg';
import logo2 from '../../assets/svg/logo-yellow.svg';

import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFrontRounded';

import HikingIcon from '@mui/icons-material/HikingRounded';
import RadarIcon from '@mui/icons-material/RadarRounded';
import { useNavigate } from 'react-router-dom';
import InfoIcon from '@mui/icons-material/Info';
import React, { ReactElement } from 'react';
import { isMobile } from 'react-device-detect';

const contactPaul =
  '/?f=6NZKfVuTw6KF5PqWCgzxmdzUT3n3m98tJJkqLJEoySuQLJdtPTWdyYx5csveUwadZXRf7razVn63xFxoQEG4usAdFKpQfMnedPkbMcQZHgECh3LyyJ3S6EfS7SHazR12swqMPZ9BMCnXT3BXjYPGYz43Gp7jDuTzvP1jUfYswHrYMn9diJKoHHF5bDc3K8Btxuj6BCWJykfX7718gnQ7yeKkY7zriRWunwSwBwt8wfdA2b6VdTXzwyPe4gtPdJ39bBfdk36GM6FMdwmjKNjmCRK&k=Invitation+from+Paul+Kuit&s=hbWdpsom6daSBBp44uBnpDiBeIxYhYvTl5ndWviVl68fnMqfqePkIqBVomGrne1Z1gbhBJ2wvfr9%2BWCVcYcaOrw3FaumU7Bk77HJ7BZEGVgw2gJAxcpStQyEVe%2FP9EZ2';

const About = () => {
  const theme = useTheme();

  const styles = {
    box: css`
      display: flex;
      flex-direction: column;
      width: 100%;
      margin-top: 0px;
      #justify-items: 'center';
    `,
    logo: css`
      display: block;
      margin-left: auto;
      margin-right: auto;
      width: 20%;
      padding-bottom: 5%;
    `,
    version: css`
      padding: 5%;
    `,
  };

  const Feature = (props: {
    primaryText: React.ReactNode;
    secondaryText: React.ReactNode;
    icon: ReactElement;
    idx: number | string;
  }) => {
    return (
      <Card
        elevation={9}
        // role={'listitem'}
        sx={{
         // width: { xs: '100%', md: '20%' },
        }}
      >
        <CardHeader
          color={theme.palette.secondary.main}
          title={
            <Typography variant="h6">
              <em>{props.primaryText}</em>
            </Typography>
          }
          avatar={<Avatar sx={{ bgcolor: theme.palette.secondary.main }}>{props.icon}</Avatar>}
        />
        <CardContent>{props.secondaryText}</CardContent>
      </Card>
    );
  };

  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <Box css={styles.box}>
        <>
          <Stack direction={'column'} alignItems={'center'} gap={3}>
            <Stack sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
              <Typography variant={'subtitle1'} noWrap alignItems={'center'}>
                <em>
                  Nothing as volatile
                  <PsychologyIcon color="secondary" />
                  as the human mind
                </em>
              </Typography>
            </Stack>
            <Typography variant={'subtitle1'}> </Typography>
          </Stack>

          <Feature
            idx={1}
            icon={<VideoCameraFrontIcon />}
            primaryText={<>Messenger</>}
            secondaryText={
              <Typography>Stream audio and video calls. You can send 😉 too.</Typography>
            }
          />
          <Feature
            idx={2}
            icon={<ConnectWithoutContactIcon />}
            primaryText={<>Direct</>}
            secondaryText={
              <Typography>
                Connect directly (peer-to-peer) with invited contacts, without a central authority
                able to capture or censure your messages.
              </Typography>
            }
          />
          <Feature
            idx={3}
            icon={<PrivateIcon />}
            primaryText={<>Private</>}
            secondaryText={
              <Typography>
                Use only your browser. No telephone, email, contact list or native apps required.
              </Typography>
            }
          />

          <Feature
            idx={4}
            icon={<EncryptedIcon />}
            primaryText={<>Encrypted</>}
            secondaryText={
              <Typography>
                Messages and contact request are signed and encrypted and can only be read by you
                and your accepted contacts.
              </Typography>
            }
          />

          <Feature
            idx={5}
            icon={<NoSignalIcon />}
            primaryText={<>Available Anywhere</>}
            secondaryText={
              <div>
                <p>
                  Write messages anytime and receive push notifications{' '}
                  <PushedIcon fontSize="small" color={'primary'} /> when offline.
                </p>
              </div>
            }
          />

          <Feature
            idx={6}
            icon={<RadarIcon />}
            primaryText={<>Location Sharing</>}
            secondaryText={
              <div>
                <p>Show your place, distance, bearing and weather to your contacts.</p>
              </div>
            }
          />
          <Feature
            idx={7}
            icon={<OpenSourceIcon />}
            primaryText={<>Open Source</>}
            secondaryText={
              <div>
                <p>
                  Source code on GitHub{' '}
                  <Link
                    href="https://github.com/bosskabouter/volatalk"
                    target={'_blank'}
                    rel="noreferrer"
                  >
                    <GitHubIcon />
                  </Link>
                </p>

                <Typography variant={'subtitle2'}>
                  contact <a href={contactPaul}>me</a>
                </Typography>
              </div>
            }
          />
        </>
      </Box>
      <Stack direction={'column'} alignItems={'center'}>
        <Avatar
          src={logo}
          variant="rounded"
          sx={{
            width: 180,
            height: 180,
            border: 1,
            alignContent: 'center',
            mt: '3rem',
            mb: '2rem',
            // color: theme.palette.secondary.main,
            // bgcolor: theme.palette.secondary.main,
          }}
        ></Avatar>
        <Typography variant="caption" sx={{ padding: '15%' }}>
          v{packageJson.version}
        </Typography>
      </Stack>
    </Container>
  );
};

export const AboutVolaTalkIcon = () => {
  const navigate = useNavigate();

  return (
    <IconButton
      size="large"
      onClick={() => {
        navigate('/About');
      }}
    >
      <InfoIcon fontSize="large" />
    </IconButton>
  );
};

export default About;
