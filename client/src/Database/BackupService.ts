import Dexie from 'dexie';
import 'dexie-export-import';
import { exportDB, importDB } from 'dexie-export-import';
import { decryptString, encryptString, generateKeyFromString } from 'dha-encryption';

import download from 'downloadjs';
import { getLocalDateShortString } from 'services/util/Generic';

export async function exportDatabase(db: Dexie, password?: string): Promise<Blob | null> {
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

export async function importDatabase(db: Dexie, f: File, password?: string): Promise<Dexie | null> {
  let json = await f.text();
  json = password ? decryptString(json, generateKeyFromString(password)) : json;

  try {
    await db.delete();
    db = await importDB(new Blob([json]), {
      progressCallback,
    });
    console.info('Restored DB', db);
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
