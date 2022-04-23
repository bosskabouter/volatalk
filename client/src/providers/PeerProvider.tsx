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

  useEffect(() => {
    if (userContext?.user) {
      setPeer(new PeerManager(userContext.user));
    }
  }, [userContext]);

  return <PeerContext.Provider value={peer}>{children}</PeerContext.Provider>;
};
