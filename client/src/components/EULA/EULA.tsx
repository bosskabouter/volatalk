/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MobileView } from 'react-device-detect';
import { useDispatch, useSelector } from 'react-redux';
import { State } from 'store/rootReducer';
import { acceptEula } from 'store/slices/eulaSlice';
import { useNavigate } from 'react-router-dom';

const EULA = () => {
  const accepted = useSelector((state: State) => state.eulaState.accepted);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const onClose = () => {
    dispatch(acceptEula());
    navigate('/');
  };

  const styles = {
    eulaDialogRoot: css`
      background-color: ${theme.palette.primary.main};
      z-index: 100;
    `,
    eulaDialogContentRoot: css`
      padding: 0;
      background-color: ${theme.palette.primary.main};
      color: ${theme.palette.common.white};
    `,
    eulaMobileRoot: css`
      background-color: ${theme.palette.primary.main};
      z-index: 1;
      position: sticky;
      top: 0;
      opacity: 1;
    `,
    eulaBackButton: css`
      background-color: ${theme.palette.primary.main};
      color: ${theme.palette.common.white};
    `,
    eulaTitleBackground: css`
      background-color: ${theme.palette.primary.main};
      color: ${theme.palette.common.white};
      font-size: 24;
      @media (max-width: ${theme.breakpoints.values.sm}) {
        font-size: 12;
      } ;
    `,
    eulaDialogAction: css`
      background-color: ${theme.palette.primary.light};
      color: ${theme.palette.primary.main};
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: ${theme.spacing(3)};
      min-height: 8rem;
    `,
    eulaAgreeButton: css`
      width: 20rem;
      min-height: 20px;
      justify-content: center;
      size: large;
      border-radius: 20;
      @media (max-width: ${theme.breakpoints.values.sm}) {
        margin-top: 1rem;
        width: 100%;
        padding-top: 2rem;
        padding-left: 2rem;
        padding-right: 2rem;
      } ;
    `,
  };

  /*
   * Contains the search result text from Google in <ListItem key="1">
   *
   * Added some screen best practices.
   * This allows blind users to know where they're at on the page.
   * https://github.com/mui-org/material-ui/issues/9158
   */
  return (
    <Dialog
      css={styles.eulaDialogRoot}
      role="dialog"
      aria-modal="true"
      aria-label="This is the end user license agreement, please read the agreement and press agree button to continue."
      aria-labelledby="dialog-title"
      aria-describedby="dialog-agreement"
      disableEscapeKeyDown
      maxWidth="lg"
      open={!accepted}
    >
      <div css={styles.eulaMobileRoot}>
        <MobileView>
          <Button css={styles.eulaBackButton}>Back</Button>
        </MobileView>
      </div>

      <img src={'safari-pinned-tab.svg'} alt="logo" height={50}></img>

      <DialogTitle id="dialog-title" css={styles.eulaTitleBackground}>
        Welcome to VolaTALK
      </DialogTitle>
      <DialogContent id="dialog-agreement" css={styles.eulaDialogContentRoot}>
        <List>
          <ListItem key="1">
            <ListItemText primary="Private, Direct Video, Calling and Messenging. The new way to communicate directly with your contacts, without the need for any central authority to capture or censure your private data." />
          </ListItem>
          <ListItem key="2">
            <ListItemText primary="All information <<will be>> encrypted on your local device and messaging and calling data is not sent to any server other than the receiving contact." />
          </ListItem>

          <ListItem key="3">
            <ListItemText primary="Currently we are in testing phase. Unexpected things might happen." />
          </ListItem>
          <ListItem key="4">
            <ListItemText primary="When you continue, you register your IP to a signalling server, used to find each other." />
          </ListItem>
        </List>
        <DialogActions css={styles.eulaDialogAction}>
          <DialogContentText color={'primary'}>VolaTALK does not store any data.</DialogContentText>
          <Button
            css={styles.eulaAgreeButton}
            color="primary"
            onClick={onClose}
            variant="contained"
          >
            Let&apos;s have a look !
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default EULA;
