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
  const [online, setOnline] = useState<boolean>(false);
  const [contacts, setContacts] = useState<IContact[]>([]);

  useEffect(() => {
    console.log('Only first render');
  }, []);

  useEffect(() => {
    if (!userContext.user || !db) return;
    //if (peerManager) return;
    function messageHandler(message: IMessage) {
      console.log('Message received in messageHandler: ' + message);
    }
    function newContactHandle(contact: IContact) {
      console.log('New Contact Handler: ' + contact);
      peerManager?.checkConnection(contact);
    }

    function handleStatusChange(status: boolean) {
      if (!db) return;
      setOnline(status);
      if (status)
        db.contacts.each((contact) => {
          peerManager?.checkConnection(contact);
        });
    }

    if (!peerManager) {
      const pm: StrictEventEmitter<PeerManager, PeerManagerEvents> = new PeerManager(
        userContext.user,
        db
      );
      setPeerManager(pm);
      pm.on('statusChange', handleStatusChange);
      pm.on('onMessage', messageHandler);
      pm.on('onNewContact', newContactHandle);
      return () => {
        //pm.removeListener('statusChange', handleStatusChange);
        pm.removeListener('onMessage', messageHandler);
        pm.removeListener('onNewContact', newContactHandle);
        pm._peer.disconnect();
      };
    }
  }, [userContext, db, peerManager]);

  return <PeerContext.Provider value={peerManager}>{children}</PeerContext.Provider>;
}
