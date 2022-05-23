/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Link, List, ListItem, ListItemText } from '@mui/material';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Logo from '../../assets/svg/logo-yellow.svg';
import packageJson from '../../../package.json';

const About = () => {
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
        <List>
          <ListItem key="1">
            <ListItemText
              primary="Direct communication with your contacts, no central server to capture your private data needed. 
            This means that if you lose access to your account, your identity cannot be recovered, because it is stored nowhere else."
            />
          </ListItem>
          <ListItem key="2">
            <ListItemText primary="The application can be installed offline." />
          </ListItem>
          <ListItem key="3">
            <Link href="https://github.com/bosskabouter/volatalk">
              <ListItemText primary="All source code is publicly available on GitHub" />
            </Link>
          </ListItem>
        </List>
        <Typography css={styles.version}> v{packageJson.version}</Typography>
      </Box>
      <img alt="logo" src={Logo} css={styles.logo} />
    </Container>
  );
};

export default About;
