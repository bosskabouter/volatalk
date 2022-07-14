import React, { useContext, useState } from 'react';

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  Input,
  MenuItem,
  OutlinedInput,
  Select,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { setupDatabase, useDatabase } from 'providers/DatabaseProvider';

import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/SaveAlt';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import RestoreIcon from '@mui/icons-material/Restore';
import 'dexie-export-import';
import { exportDB, importDB } from 'dexie-export-import';
import { encryptString, generateKeyFromString } from 'dha-encryption';
import {
  descriptiveTimeAgo,
  getLocalDateShortString,
  getLocalDateString,
} from 'services/util/Generic';
import { UserContext } from 'providers/UserProvider';
import { useNavigate } from 'react-router-dom';
import { exportDatabase, importDatabase } from './BackupService';
import { CheckBox } from '@mui/icons-material';

export default function Backup() {
  const db = useDatabase();
  const [open, setOpen] = useState(true);

  const [progress] = useState<{ totalRows: number; completedRows: number }>();

  const [file, setFile] = useState<File>();

  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');

  const isValid = pw1 === pw2;

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogContent>
        <DialogTitle variant="h5">Data Backup</DialogTitle>
        <TextField
          id="pw1"
          value={pw1}
          onChange={(e) => setPw1(e.target.value)}
          label="Optional Password"
          variant="filled"
        />
        <TextField
          id="pw2"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          label="Repeat Password"
          variant="filled"
        />

        <input
          type="file"
          accept="application/json"
          onChange={async (event) => {
            if (!event.target.files) return;
            setFile(event.target.files[0]);
          }}
          multiple={false}
        />
        <Typography variant="h5" hidden={isValid}>
          Passwords must match
        </Typography>
        <DialogContentText></DialogContentText>

        <DialogActions>
          <Button disabled={!isValid} onClick={() => db && pw1 === pw2 && exportDatabase(db, pw1)}>
            Download backup
            <DownloadIcon />
          </Button>
          <Button
            disabled={!isValid}
            onClick={() => file && db && pw1 === pw2 && importDatabase(db, file, pw1)}
          >
            Upload and Restore backup
            <DownloadIcon />
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

/**
 * A button to open Backup Dialog
 * @returns
 */
export const BackupDBButton = () => {
  const navigate = useNavigate();
  const user = useContext(UserContext);

  return user ? (
    <Button variant="outlined" onClick={() => navigate('/backup')}>
      Backup
      <DownloadIcon />
    </Button>
  ) : (
    <></>
  );
};
export const RestoreDBButton = () => {
  const navigate = useNavigate();

  return (
    <Button variant="contained" onClick={() => navigate('/restore')}>
      Restore
      <RestoreIcon />
    </Button>
  );
};
