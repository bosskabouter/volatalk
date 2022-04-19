/** @jsxImportSource @emotion/react */
/*
 *
 *   DialogProvider.tsx
 *
 *
 *  Created by Christopher Fahlin on 11/17/2021
 *
 *  pwa-starter
 *
 *  Copyright © 2009-2021 United States Government as represented by
 *  the Program Manager of the DHA: Web and Mobile Technology Program Management Office
 *  All Rights Reserved.
 *
 *  Copyright © 2009-2021 Contributors. All Rights Reserved.
 *
 *  THIS OPEN SOURCE AGREEMENT ("AGREEMENT") DEFINES THE RIGHTS OF USE,
 *  REPRODUCTION, DISTRIBUTION, MODIFICATION AND REDISTRIBUTION OF CERTAIN
 *  COMPUTER SOFTWARE ORIGINALLY RELEASED BY THE UNITED STATES GOVERNMENT
 *  AS REPRESENTED BY THE GOVERNMENT AGENCY LISTED BELOW ("GOVERNMENT AGENCY").
 *  THE UNITED STATES GOVERNMENT, AS REPRESENTED BY GOVERNMENT AGENCY, IS AN
 *  INTENDED THIRD-PARTY BENEFICIARY OF ALL SUBSEQUENT DISTRIBUTIONS OR
 *  REDISTRIBUTIONS OF THE SUBJECT SOFTWARE. ANYONE WHO USES, REPRODUCES,
 *  DISTRIBUTES, MODIFIES OR REDISTRIBUTES THE SUBJECT SOFTWARE, AS DEFINED
 *  HEREIN, OR ANY PART THEREOF, IS, BY THAT ACTION, ACCEPTING IN FULL THE
 *  RESPONSIBILITIES AND OBLIGATIONS CONTAINED IN THIS AGREEMENT.
 *
 *  Government Agency: DHA: Web and Mobile Technology Program Management Office
 *  Government Agency Original Software Designation: pwa-provider-resilience
 *  Government Agency Original Software Title: pwa-provider-resilience
 *  User Registration Requested. Please send email
 *  with your contact information to: robert.a.kayl.civ@mail.mil
 *  Government Agency Point of Contact for Original Software - Program Manager: robert.a.kayl.civ@mail.mil
 *
 */

/* eslint-disable */
// @ts-nocheck
import { createContext, useContext, useRef, useState } from 'react';
import { css } from '@emotion/react';
import { Dialog } from '@mui/material';

type ProviderContext = readonly [(option: DialogOption) => void, () => void];

const EMPTY_FUNC = () => {};
const DialogContext = createContext<ProviderContext>([EMPTY_FUNC, EMPTY_FUNC]);
export const useDialog = () => useContext(DialogContext);

type DialogParams = {
  children: React.ReactNode;
  open: boolean;
  onClose?: Function;
  onExited?: Function;
  important?: boolean;
};
type DialogOption = Omit<DialogParams, 'open'>;
type DialogContainerProps = DialogParams & {
  onClose: () => void;
  onKill: () => void;
};

const styles = {
  dialogPaper: css`
    width: 500px;
    height: 220px;
  `,
};

function DialogContainer(props: DialogContainerProps) {
  const { children, open, onClose, onKill, important } = props;

  let dontDismiss = important;

  if (important === undefined) {
    dontDismiss = false;
  }
  return (
    <Dialog
      open={open}
      onClose={onClose}
      onExited={onKill}
      disableBackdropClick={dontDismiss}
      disableEscapeKeyDown={dontDismiss}
      css={styles.dialogPaper}
    >
      {children}
    </Dialog>
  );
}

export default function DialogProvider({ children }) {
  const [dialogs, setDialogs] = useState<DialogParams[]>([]);
  const createDialog = (option: DialogOption) => {
    const dialog = { ...option, open: true };
    setDialogs((dialogs) => [...dialogs, dialog]);
  };
  const closeDialog = () => {
    setDialogs((dialogs) => {
      const latestDialog = dialogs.pop();
      if (!latestDialog) return dialogs;
      if (latestDialog.onClose) latestDialog.onClose();
      return [...dialogs].concat({ ...latestDialog, open: false });
    });
  };
  const contextValue = useRef([createDialog, closeDialog] as const);

  return (
    <DialogContext.Provider value={contextValue.current}>
      {children}
      {dialogs.map((dialog, i) => {
        const { onClose, ...dialogParams } = dialog;
        const handleKill = () => {
          if (dialog.onExited) dialog.onExited();
          setDialogs((dialogs) => dialogs.slice(0, dialogs.length - 1));
        };

        return (
          <DialogContainer key={i} onClose={closeDialog} onKill={handleKill} {...dialogParams} />
        );
      })}
    </DialogContext.Provider>
  );
}
