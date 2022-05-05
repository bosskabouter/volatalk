import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { PeerManager } from '../services/PeerManager';
import { DatabaseContext } from './DatabaseProvider';
import { UserContext } from './UserProvider';

interface IPeerProviderProps {
  children: ReactNode;
}

export const PeerContext = createContext<PeerManager | null>(null);
export const usePeer = () => useContext(PeerContext);

export default function PeerProvider({ children }: IPeerProviderProps) {
  const userContext = useContext(UserContext);
  const db = useContext(DatabaseContext);

  const [peerManager, setPeerManager] = useState<PeerManager | null>(null);

  useEffect(() => {
    if (userContext?.user && db) {
      const pm = new PeerManager(userContext.user, db);
      setPeerManager(pm);
    }
  }, [userContext, db]);

  return <PeerContext.Provider value={peerManager}>{children}</PeerContext.Provider>;
}
