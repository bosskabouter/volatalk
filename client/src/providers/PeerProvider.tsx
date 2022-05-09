import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import StrictEventEmitter from 'strict-event-emitter-types/types/src';
import { IContact, IMessage } from 'types';

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
    function messageHandler(message: IMessage) {
      console.log('Message received in messageHandler: ' + message);
    }
    function newContactHandle(contact: IContact) {
      console.log('New Contact Handler: ' + contact);
    }
    if (userContext?.user && db) {
      if (!peerManager || peerManager._peer.disconnected) {
        const pm: StrictEventEmitter<PeerManager, PeerManagerEvents> = new PeerManager(
          userContext.user,
          db
        );

        pm.on('onMessage', messageHandler);
        pm.on('onNewContact', newContactHandle);
        setPeerManager(pm);
      }
    }
    return () => {
      peerManager?.removeListener('onMessage', messageHandler);
      peerManager?.removeListener('onNewContact', newContactHandle);
    };
  }, [userContext, db, peerManager]);

  return <PeerContext.Provider value={peerManager}>{children}</PeerContext.Provider>;
}
