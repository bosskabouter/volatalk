import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { PeerManager } from '../services/peerjs/PeerManager';
import { IMessage, IContact } from '../types';
import { useDatabase } from './DatabaseProvider';
import { UserContext } from './UserProvider';

interface IPeerProviderProps {
  children: ReactNode;
}

export type IPeerContext = {
  peerManager: PeerManager;
  setPeerManager: (getPeerManager: PeerManager) => void;
};

export const PeerContext = createContext<PeerManager | null>(null);
export const usePeerManager = () => useContext(PeerContext);

export default function PeerProvider({ children }: IPeerProviderProps) {
  const userContext = useContext(UserContext);
  const db = useDatabase();

  const [peerManager, setPeerManager] = useState<PeerManager | null>(null);

  function messageHandler(message: IMessage) {
    console.debug('MessageHandler PeerProvider', message);
  }

  useEffect(() => {
    if (!userContext.user || !db || peerManager) return;

    function newContactHandle(contact: IContact) {
      console.info('New Contact', contact);
      peerManager?.isConnected(contact);
    }
    function contactOnlineHandle(statchange: { contact: IContact; status: boolean }) {
      console.info('Contact Online', statchange);
      peerManager?.isConnected(statchange.contact);
    }
    function handleStatusChange(status: boolean) {
      //setPeerManager(peerManager);
      if (status)
        //getting online
        db?.contacts.each((contact) => {
          peerManager?.isConnected(contact);
        });
    }

    const setupPeerManager = () => {
      const pm = new PeerManager(userContext.user, db);

      pm.on('statusChange', handleStatusChange);
      pm.on('onMessage', messageHandler);
      pm.on('onNewContact', newContactHandle);
      pm.on('onContactStatusChange', contactOnlineHandle);

      const beforeunloadHandler = () => {
        pm.disconnectGracefully();
      };
      window.addEventListener('beforeunload', beforeunloadHandler);

      setPeerManager(pm);

      return () => {
        //   window.removeEventListener('beforeunload', beforeunloadHandler);
        console.warn('Cleaning up PeerProvider!');
        pm.removeListener('statusChange', handleStatusChange);
        pm.removeListener('onMessage', messageHandler);
        pm.removeListener('onNewContact', newContactHandle);
        pm.removeListener('onContactStatusChange', contactOnlineHandle);
        pm.disconnectGracefully();
        setPeerManager(null);
      };
    };

    setupPeerManager();
  }, [db, peerManager, userContext.user]);

  /**
  useEffect(() => {
    if (!peerManager) return;

    const beforeunloadHandler = () => {
      peerManager.disconnectGracefully();
    };
    window.addEventListener('beforeunload', beforeunloadHandler);
  }, [peerManager]);
 */
  return <PeerContext.Provider value={peerManager}>{children}</PeerContext.Provider>;
}
