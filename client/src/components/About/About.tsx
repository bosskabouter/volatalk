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
      <ListItem
        key={props.idx}
        //alignItems={'flex-start'}
      >
        <Card elevation={9} role={'listitem'} sx={{ width: '100%', minWidth: 'sd' }}>
          <CardHeader
            title={
              <Typography variant="h6">
                <em>{props.primaryText}</em>
              </Typography>
            }
            avatar={<Avatar sx={{ bgcolor: theme.palette.secondary.main }}>{props.icon}</Avatar>}
          />
          <CardContent>{props.secondaryText}</CardContent>
        </Card>
      </ListItem>
    );
  };

  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <Box css={styles.box}>
        <Grid>
          <ListItem key="0">
            <ListItemText
              primary={
                <Stack direction={'column'} alignItems={'center'}>
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
              }
            />
          </ListItem>
          <Feature
            idx={1}
            icon={<ConnectWithoutContactIcon />}
            primaryText={<>Direct Communication</>}
            secondaryText={
              <div>
                <p>
                  Connect directly with invited contacts, without a central authority to capture or
                  censure your messages.
                </p>
              </div>
            }
          />
          <Feature
            idx={2}
            icon={<EncryptedIcon />}
            primaryText={<>Private Encryption</>}
            secondaryText={
              <div>
                <p>No telephone, email or contact list required, just a browser.</p>
                <p>Messages can only be read by you and the receiver.</p>
              </div>
            }
          />

          <Feature
            idx={3}
            icon={<VideoCameraFrontIcon />}
            primaryText={<>Streaming Calls</>}
            secondaryText={
              <div>
                <p>
                  Stream audio and videocalls. <p>You can send 😉 too.</p>{' '}
                </p>
              </div>
            }
          />
          <Feature
            idx={4}
            icon={<HikingIcon />}
            primaryText={<>Available Anywhere</>}
            secondaryText={
              <div>
                <p>
                  Write messages anytime and receive push notications{' '}
                  <PushedIcon fontSize="small" color={'primary'} /> when offline.
                </p>
              </div>
            }
          />

          <Feature
            idx={3}
            icon={<RadarIcon />}
            primaryText={<>Location Sharing</>}
            secondaryText={
              <div>
                <p>
                  Share your location so friends know at what distance, bearing and weather you are.
                  Nice conversation starter!
                </p>
              </div>
            }
          />
          <Feature
            idx={5}
            icon={<OpenSourceIcon />}
            primaryText={<>Open Source</>}
            secondaryText={
              <div>
                {}
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
                <p>
                  <a href={contactPaul}>
                    <Typography variant={'button'}>Contact Creator</Typography>
                  </a>
                </p>
              </div>
            }
          />
        </Grid>
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
