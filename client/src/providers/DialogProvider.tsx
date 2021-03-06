/** @jsxImportSource @emotion/react */
/* eslint-disable */
// @ts-nocheck
import { createContext, useContext, useRef, useState } from 'react';
import { css } from '@emotion/react';
import { Dialog } from '@mui/material';

type ProviderContext = readonly [(option: DialogOption) => void, () => void];

const EMPTY_FUNC = () => {
  /*  */
};
const DialogContext = createContext<ProviderContext>([EMPTY_FUNC, EMPTY_FUNC]);
export const useDialog = () => useContext(DialogContext);

type DialogParams = {
  children: React.ReactNode;
  open: boolean;
  onClose?: typeof EMPTY_FUNC;
  onExited?: typeof EMPTY_FUNC;
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
    setDialogs((dlgs) => [...dlgs, dialog]);
  };
  const closeDialog = () => {
    setDialogs((dlgs) => {
      const latestDialog = dialogs.pop();
      if (!latestDialog) return dialogs;
      if (latestDialog.onClose) latestDialog.onClose();
      return [...dlgs].concat({ ...latestDialog, open: false });
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
          setDialogs((dlgs) => dlgs.slice(0, dlgs.length - 1));
        };

        return (
          <DialogContainer key={i} onClose={closeDialog} onKill={handleKill} {...dialogParams} />
        );
      })}
    </DialogContext.Provider>
  );
}
