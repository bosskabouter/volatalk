import Dexie from 'dexie';

import download from 'downloadjs';

import React, { useState } from 'react';

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

import 'dexie-export-import';
import { exportDB, importDB } from 'dexie-export-import';
import { encryptString, generateKeyFromString } from 'dha-encryption';
import {
  descriptiveTimeAgo,
  getLocalDateShortString,
  getLocalDateString,
} from 'services/util/Generic';

export default function Backup() {
  const db = useDatabase();

  const [open, setOpen] = useState(true);

  const [progress] = useState<{ totalRows: number; completedRows: number }>();

  const [blob, setBlob] = useState();

  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');

  const isValid = pw1 === pw2;
  const isEncrypted = isValid && pw1.length > 0;

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogContent>
        <DialogTitle variant="h5">Data Backup</DialogTitle>
        <DialogContentText>
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
        </DialogContentText>

        <Typography variant="h5" hidden={isValid}>
          Passwords must match
        </Typography>

        <DialogActions>
          <Button disabled={!isValid} onClick={() => db && pw1 === pw2 && exportDatabase(db, pw1)}>
            Download {isEncrypted ? 'password protected' : ''} backup
            <DownloadIcon />
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

export function RestoreDB() {
  return (
    <Button variant="contained">
      Restore Backup<FileUploadIcon></FileUploadIcon>
    </Button>
  );
}
export async function exportDatabase(db: Dexie, password = ''): Promise<Blob | null> {
  try {
    const blob = await exportDB(db, { prettyJson: true, progressCallback });

    const blobEncrypted = encryptString(await blob.text(), generateKeyFromString(password));
    download(
      blobEncrypted,
      getLocalDateShortString(new Date()) + '.org.volatalk',
      'application/json'
    );

    return blob;
  } catch (error) {
    console.error('' + error);
    return null;
  }
}
export async function importDatabase(db: Dexie, f: File, password = ''): Promise<Dexie | null> {
  try {
    await db.delete();
    db = await importDB(f, {
      progressCallback,
    });

    return db;
  } catch (error) {
    console.error('' + error);
    return null;
  }
}

function progressCallback(p: any): boolean {
  console.log(`Progress: ${p}`);
  return true;
}
