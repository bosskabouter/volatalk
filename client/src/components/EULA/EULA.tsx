/** @jsxImportSource @emotion/react */
/*
 * EULA.tsx
 * EULA component.
 *
 * Created by Arnold Koh on 7/14/20.
 *
 * dha-mood-tracker
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
 * Government Agency Original Software Designation: dha-mood-tracker
 * Government Agency Original Software Title: dha-mood-tracker
 * User Registration Requested. Please send email
 * with your contact information to: robert.a.kayl.civ@mail.mil
 * Government Agency Point of Contact for Original Software - Program Manager: robert.a.kayl.civ@mail.mil
 */
import { css } from '@emotion/react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
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
        padding-left: 2rem;
        padding-right: 2rem;
      } ;
    `,
  };

  /*
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
      <DialogTitle id="dialog-title" css={styles.eulaTitleBackground}>
        Welcome to VolaTALK. <em>Direct, Private Communication</em>
      </DialogTitle>
      <DialogContent id="dialog-agreement" css={styles.eulaDialogContentRoot}>
        <List>
          <ListItem key="1">
            <ListItemText primary="The new way to communicate directly with your contacts, without the need for any central authority to capture or censure your private data." />
          </ListItem>
          <ListItem key="2">
            <ListItemText primary="All information is encrypted on your local device and no personal data is send to any server." />
          </ListItem>
        </List>
        <DialogActions css={styles.eulaDialogAction}>
          Welcome!
          <Button
            css={styles.eulaAgreeButton}
            color="primary"
            // onClick={handleAgreeButtonClick}
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
