/** @jsxImportSource @emotion/react */


import { css } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Box, Link,
  // useTheme
} from '@mui/material';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Logo from '../../assets/images/volatalk-logo-336x280.webp';
import packageJson from '../../../package.json';
import {
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

const About = () => {
  // const theme = useTheme();

  const styles = {
    box: css`
      display: flex;
      flex-direction: column;
      width: 100%;
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
        <img alt="DHA" src={Logo} css={styles.logo} />
        <List>
          <ListItem key="1">
            <ListItemText primary="If you lose your device or access to your account, your identity cannot be recovered." />
          </ListItem>
          <ListItem key="2">
            <ListItemText
              primary="The application can be installed offline. 
            All further communication is done directly with your contacts."
            />
          </ListItem>
          <ListItem key="3">
            <ListItemText
              primary="The application uses a 'Peerserver' to connect to others. 
            You can use VolaTalk's service, or some other generic public PeerJS available on the internet, 
            or even setup your own private server. You will only find people connected on the same network."
            />
          </ListItem>
          <ListItem key="4">
            <ListItemText primary="Push notifications need to be send through a push-server. 
            VolaTALK's push messenger doesn't collect any data about the messages being sent." />
          </ListItem>
          <ListItem key="5">
            <ListItemText primary="All source code of this software is publicly available on " />
            <Link href='https://github.com/bosskabouter/volatalk'>GitHub</Link>
          </ListItem>
        </List>
        <Typography css={styles.version}> v{packageJson.version}</Typography>
      </Box>
    </Container>
  );
};

export default About;
