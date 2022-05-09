import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import StrictEventEmitter from 'strict-event-emitter-types/types/src';

import { PeerManager, PeerManagerEvents } from '../services/PeerManager';
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
      if (!peerManager || peerManager.peer.disconnected) {
        const pm: StrictEventEmitter<PeerManager, PeerManagerEvents> = new PeerManager(
          userContext.user,
          db
        );

        pm.on('onMessage', (message) => {
          console.log('Message received in Peerprovider: ' + message);
        });
        setPeerManager(pm);
      }
    }
  }, [userContext, db, peerManager]);

  return <PeerContext.Provider value={peerManager}>{children}</PeerContext.Provider>;
}
