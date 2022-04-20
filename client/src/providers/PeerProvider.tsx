import { createContext, ReactNode, useEffect, useState } from 'react';
import { PeerManager } from '../services/PeerManager';

interface IPeerProviderProps {
  children: ReactNode;
}

export const PeerContext = createContext<PeerManager | null>(null);
export const PeerProvider = ({ children }: IPeerProviderProps) => {
  const [peer, setPeer] = useState<PeerManager | null>(null);
  const setupPeer = () => {
    const newPeer = new PeerManager();

    setPeer(newPeer);
  };

  useEffect(() => {
    setupPeer();
  }, []);

  return <PeerContext.Provider value={peer}>{children}</PeerContext.Provider>;
};
