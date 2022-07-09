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

export default function Backup() {
  const db = useDatabase();

  const [open, setOpen] = useState(true);

  const [progress] = useState<{ totalRows: number; completedRows: number }>();

  const [blob, setBlob] = useState();

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      Backup
      <DialogTitle></DialogTitle>
      <DialogContent>
        <DialogContentText></DialogContentText>
        <DialogActions onClick={() => db && exportDatabase(db)}>
          <IconButton>
            <DownloadIcon></DownloadIcon>
          </IconButton>

          <IconButton>
            <FileUploadIcon></FileUploadIcon>
          </IconButton>

          <IconButton>
            <CloseIcon></CloseIcon>
          </IconButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

export async function exportDatabase(db: Dexie): Promise<Blob | null> {
  try {
    const blob = await exportDB(db, { prettyJson: true, progressCallback });
    download(blob, 'dexie-export.json', 'application/json');

    return blob;
  } catch (error) {
    console.error('' + error);
    return null;
  }
}
export async function importDatabase(db: Dexie, f: File): Promise<Dexie | null> {
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
