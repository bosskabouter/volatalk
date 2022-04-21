import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { PeerManager } from '../services/PeerManager';
import { UserContext } from './UserProvider';

interface IPeerProviderProps {
  children: ReactNode;
}

export const PeerContext = createContext<PeerManager | null>(null);

export const PeerProvider = ({ children }: IPeerProviderProps) => {
  const userContext = useContext(UserContext);

  const [peer, setPeer] = useState<PeerManager | null>(null);

  const setupPeer = () => {
    if (userContext?.user) {
      const newPeer = new PeerManager(userContext.user);
      setPeer(newPeer);
    }
  };

  useEffect(() => {
    setupPeer();
  }, []);

  return <PeerContext.Provider value={peer}>{children}</PeerContext.Provider>;
};
