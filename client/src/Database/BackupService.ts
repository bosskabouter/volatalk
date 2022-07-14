import Dexie from 'dexie';
import 'dexie-export-import';
import { exportDB, importDB } from 'dexie-export-import';
import { decryptString, encryptString, generateKeyFromString } from 'dha-encryption';

import download from 'downloadjs';
import { reloadApp } from 'pages/Routes/AppRoutes';
import { getLocalDateShortString } from 'services/util/Generic';
import { AppDatabase } from './Database';

export async function exportDatabase(db: AppDatabase, password?: string): Promise<Blob | null> {
  try {
    const blob = await exportDB(db, { prettyJson: true, progressCallback });
    const plainText = await blob.text();
    const blobEncrypted = password
      ? encryptString(plainText, generateKeyFromString(password))
      : plainText;
    download(
      blobEncrypted,
      getLocalDateShortString(new Date()) + '.org.volatalk.json',
      'application/json'
    );

    return blob;
  } catch (error) {
    console.error('' + error);
    return null;
  }
}

export async function importDatabase(
  db: AppDatabase,
  f: File,
  password?: string
): Promise<Dexie | null> {
  let json = await f.text();
  try {
    json = password ? decryptString(json, generateKeyFromString(password)) : json;
    JSON.parse(json);
  } catch (e) {
    console.error('Problem decrypting/parsing backup', e);
    return null;
  }
  try {
    await db.delete();
    const restoredDB = await importDB(new Blob([json]), {
      progressCallback,
    });
    console.info('Restored DB', restoredDB);

    reloadApp();
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
