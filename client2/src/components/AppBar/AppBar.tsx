/*
 * AppBar.tsx
 * AppBar component.
 *
 * Created by firstName lastName on date.
 *
 * pwa-starter
 *
 * Copyright © 2009-2021 United States Government as represented by
 * the Program Manager of the DHA: Web and Mobile Technology Program Management Office.
 * All Rights Reserved.
 *
 * Copyright © 2009-2021 Contributors. All Rights Reserved.
 *
 * THIS OPEN SOURCE AGREEMENT ("AGREEMENT") DEFINES THE RIGHTS OF USE,
 * REPRODUCTION, DISTRIBUTION, MODIFICATION AND REDISTRIBUTION OF CERTAIN
 * COMPUTER SOFTWARE ORIGINALLY RELEASED BY THE UNITED STATES GOVERNMENT
 * AS REPRESENTED BY THE GOVERNMENT AGENCY LISTED BELOW ("GOVERNMENT AGENCY").
 * THE UNITED STATES GOVERNMENT, AS REPRESENTED BY GOVERNMENT AGENCY, IS AN
 * INTENDED THIRD-PARTY BENEFICIARY OF ALL SUBSEQUENT DISTRIBUTIONS OR
 * REDISTRIBUTIONS OF THE SUBJECT SOFTWARE. ANYONE WHO USES, REPRODUCES,
 * DISTRIBUTES, MODIFIES OR REDISTRIBUTES THE SUBJECT SOFTWARE, AS DEFINED
 * HEREIN, OR ANY PART THEREOF, IS, BY THAT ACTION, ACCEPTING IN FULL THE
 * RESPONSIBILITIES AND OBLIGATIONS CONTAINED IN THIS AGREEMENT.
 *
 * Government Agency: DHA: Web and Mobile Technology Program Management Office
 * Government Agency Original Software Designation: pwa-starter
 * Government Agency Original Software Title: pwa-starter
 * User Registration Requested. Please send email
 * with your contact information to: robert.a.kayl.civ@mail.mil
 * Government Agency Point of Contact for Original Software - Program Manager: robert.a.kayl.civ@mail.mil
 */
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HelpOutline from '@mui/icons-material/HelpOutline';
import HomeIcon from '@mui/icons-material/Home';
import AccountIcon from '@mui/icons-material/ManageAccounts';

import PeopleIcon from '@mui/icons-material/People';

import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import logo from 'assets/images/volatalk-logo-336x280.webp';
import { Rating } from 'dha-rating';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

export default function TemporaryDrawer() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const styles = {
    root: css`
      display: flex;
    `,
    appBar: (isOpen: boolean) => css`
      transition: ${theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      })};
      padding-right: 10px;
      padding-left: 10px;
      ${isOpen === true &&
      `
        width: calc(100% - ${drawerWidth}px);
        transition: ${theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        })};
        margin-right: ${drawerWidth};
      `}
    `,
    title: css`
      flex-grow: 1;
    `,
    hide: (isOpen: boolean) => css`
      ${isOpen === true &&
      `
        display: none;
      `}
    `,
    link: css`
      text-decoration: none;
    `,
    drawer: css`
      width: ${drawerWidth};
      flex-shrink: 0;
    `,
    drawerPaper: css`
      width: ${drawerWidth};
    `,
    drawerHeader: css`
      display: flex;
      align-items: center;
      padding: ${theme.spacing(0, 1)};
      justify-content: flex-start;
    `,
    content: css`
      flex-grow: 1;
      padding: ${theme.spacing(3)};
      transition: ${theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      })};
      margin-right: -${drawerWidth};
    `,
    contentShift: css`
      transition: ${theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      })};
      margin-right: 0;
    `,
    toolbarLogo: css`
      height: ${theme.spacing(6)};
      padding: ${theme.spacing(1)} 0;
      width: auto;
    `,
  };

  return (
    <div css={styles.root}>
      <CssBaseline />
      <AppBar position="sticky" css={styles.appBar(open)} role="banner">
        <Toolbar disableGutters variant="dense">
          <Typography variant="h6" noWrap css={styles.title}>
            <Link to="/">
              <img alt="VolaTALK logo" css={styles.toolbarLogo} src={logo} />
            </Link>
          </Typography>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerOpen}
            css={styles.hide(open)}
            size="large"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        css={[styles.drawer, styles.drawerPaper]}
        variant="persistent"
        anchor="right"
        onClose={handleDrawerClose}
        open={open}
      >
        <div css={styles.drawerHeader}>
          <IconButton onClick={handleDrawerClose} size="large">
            {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
        <List>
          <Link to="/" css={styles.link}>
            <ListItem button onClick={handleDrawerClose}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
          </Link>
          <Link to="/AccountSetup" css={styles.link}>
            <ListItem button onClick={handleDrawerClose}>
              <ListItemIcon>
                <AccountIcon />
              </ListItemIcon>
              <ListItemText primary="Account" />
            </ListItem>
          </Link>
          <Link to="/Contacts" css={styles.link}>
            <ListItem button onClick={handleDrawerClose}>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Contacts" />
            </ListItem>
          </Link>
          <Link to="/About" css={styles.link}>
            <ListItem onClick={handleDrawerClose}>
              <ListItemIcon>
                <HelpOutline />
              </ListItemIcon>
              <ListItemText primary="About" />
            </ListItem>
          </Link>
          <List>
            <ListItem>
              <Rating appId="volatalk" />
            </ListItem>
          </List>
        </List>
        <Divider />
      </Drawer>
    </div>
  );
}
