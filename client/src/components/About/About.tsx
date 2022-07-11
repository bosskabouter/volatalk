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
  ListItemIcon,
  ListItemAvatar,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  Grid,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import packageJson from '../../../package.json';

import PsychologyIcon from '@mui/icons-material/Psychology';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import OpenSourceIcon from '@mui/icons-material/ImportContacts';
import PushedIcon from '@mui/icons-material/ForwardToInbox';
import EncryptedIcon from '@mui/icons-material/MailLock';
import GitHubIcon from '@mui/icons-material/GitHub';
import logo from '../../assets/svg/logo-black.svg';
import logo2 from '../../assets/svg/logo-yellow.svg';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import HikingIcon from '@mui/icons-material/Hiking';

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
      margin-top: 0px;
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
        <Card  sx={{ maxWidth: 270, minWidth: 270,  }}>
          <CardHeader
            title={
              <Typography variant="h5">
                {/* <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                  {props.icon}
                </Avatar> */}
                <em>{props.primaryText}</em>
              </Typography>
            }
             avatar={<Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
             {props.icon}
           </Avatar>}
          />
          <CardContent>{props.secondaryText}</CardContent>
        </Card>
      </ListItem>
    );
  };

  return (
    <Container component="main" maxWidth="xl">
      <CssBaseline />
      <Box css={styles.box}>
        <Grid>
          <Typography variant="h4" align="center" alignItems={'center'}>
            <div>
              <img src={logo2} alt="" height={63} />
            </div>
          </Typography>

          <Feature
            idx={1}
            icon={<ConnectWithoutContactIcon />}
            primaryText={<> Direct</>}
            secondaryText={
              <p>
                <p>Connect directly with invited people, not your whole address book. </p>
                <p>No central server to capture your messages or censure your account.</p>
              </p>
            }
          />
          <Feature
            idx={2}
            icon={<EmojiPeopleIcon />}
            primaryText={<>Private</>}
            secondaryText={
              <p>
                <p>No telephone, email, or native application required, just a browser.</p>
                <p>Encrypted messages can only be read by you and the receiver.</p>
              </p>
            }
          />

          <Feature
            idx={3}
            icon={<HikingIcon />}
            primaryText={<>Anytime</>}
            secondaryText={
              <p>
                <p>
                  Write messages anytime, receive push notications <PushedIcon fontSize="small" />{' '}
                  when offline.
                </p>
              </p>
            }
          />

          <Feature
            idx={5}
            icon={<OpenSourceIcon />}
            primaryText={<>Open Source</>}
            secondaryText={
              <p>
                <Link
                  href="https://github.com/bosskabouter/volatalk"
                  target={'_blank'}
                  rel="noreferrer"
                >
                  GitHub <GitHubIcon />
                </Link>
              </p>
            }
          />

          <ListItem key="0">
            <ListItemText
              primary={
                <Stack direction={'column'} alignItems={'center'}>
                  <Stack direction={'row'}>
                    <Typography variant={'subtitle2'} noWrap alignItems={'center'}>
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
        </Grid>
      </Box>
      <Stack direction={'column'} alignItems={'center'}>
        <Typography variant="caption"> v{packageJson.version}</Typography>

        <Avatar
          src={logo}
          variant="rounded"
          sx={{
            width: 180,
            height: 180,
            border: 1,
            alignContent: 'center',
            mt: '3rem',
            mb: '3rem',
            // color: theme.palette.secondary.main,
            // bgcolor: theme.palette.secondary.main,
          }}
        ></Avatar>
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
