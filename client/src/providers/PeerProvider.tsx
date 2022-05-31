import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { PeerManager } from '../services/PeerManager';
import { IMessage, IContact } from '../types';
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
    if (!userContext.user || !db) return;
    //if (peerManager) return;
    function messageHandler(message: IMessage) {
      console.log('MessageHandler PeerProvider', message);
    }
    function newContactHandle(contact: IContact) {
      console.log('NewContactHandler PeerProvider', contact);
      peerManager?.isConnected(contact);
    }
    function contactOnlineHandle(statchange: { contact: IContact; status: boolean }) {
      console.log('ContactOnlineHandler PeerProvider', statchange);

      //TODO if online show online message, in status display?
      peerManager?.isConnected(statchange.contact);
    }
    function handleStatusChange(status: boolean) {
      if (!db) return;

      if (status)
        //getting online
        db.contacts.each((contact) => {
          peerManager?.isConnected(contact);
        });
    }

    if (!peerManager) {
      const pm = new PeerManager(userContext.user, db);

      pm.on('statusChange', handleStatusChange);
      pm.on('onMessage', messageHandler);
      pm.on('onNewContact', newContactHandle);
      pm.on('onContactStatusChange', contactOnlineHandle);
      setPeerManager(pm);
    }

    const beforeunloadHandler = () => {
      peerManager?.disconnectGracefully();
    };
    window.addEventListener('beforeunload', beforeunloadHandler);
    return () => {
      window.removeEventListener('beforeunload', beforeunloadHandler);
      if (peerManager) {
        console.warn('Cleaning up PeerProvider!');
        peerManager.removeListener('statusChange', handleStatusChange);
        peerManager.removeListener('onMessage', messageHandler);
        peerManager.removeListener('onNewContact', newContactHandle);
        peerManager.removeListener('onContactStatusChange', contactOnlineHandle);
        // peerManager._peer.disconnect();
        //setPeerManager(null);
      }
    };
  }, [userContext, db, peerManager]);

  return <PeerContext.Provider value={peerManager}>{children}</PeerContext.Provider>;
}
