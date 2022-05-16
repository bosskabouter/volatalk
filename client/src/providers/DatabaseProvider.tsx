import { applyEncryptionMiddleware, clearAllTables, NON_INDEXED_FIELDS } from 'dha-dexie-encrypted';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AppDatabase } from '../Database/Database';

interface IDatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseContext = createContext<AppDatabase | null>(null);
export const useDatabase = () => useContext(DatabaseContext);

export const DatabaseProvider = ({ children }: IDatabaseProviderProps) => {
  const [database, setDatabase] = useState<AppDatabase | null>(null);
  const setupDatabase = () => {
    // Creates the initial database
    const db = new AppDatabase();

    // creates the binary string to be used as the key
    const binaryString = process.env.REACT_APP_DB_PIN ?? 'test';
    const cryptoKey = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      cryptoKey[i] = binaryString.charCodeAt(i);
    }

    // Creates the Encryption middleware
    // Cryptokey is required to be of length 32 and a Uint8Array
    // NON_INDEXED_FIELDS tells the middleware to encrypt every field NOT indexed
    // in this case the pin, first question, second question,
    // first answer and second answer will be encrypted
    // TODO: As you add more tables edit this
    applyEncryptionMiddleware(
      db,
      cryptoKey,
      {
        userProfile: NON_INDEXED_FIELDS,
      },
      (db2) => clearAllTables(db2)
    );
    db.version(6);
    setDatabase(db);  
  };

  useEffect(() => {
    setupDatabase();
  }, []);

  return <DatabaseContext.Provider value={database}>{children}</DatabaseContext.Provider>;
};
