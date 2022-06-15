/* e2slint-disable */
// @t2s-nocheck
import { AppDatabase } from 'Database/Database';
import { ReactNode, createContext, useContext, useEffect, useState, useRef } from 'react';

import { PeerManager } from '../services/PeerManager';
import { IMessage, IContact, IUserProfile } from '../types';
import { DatabaseContext, useDatabase } from './DatabaseProvider';
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
    console.log('MessageHandler PeerProvider', message);
  }
  function newContactHandle(contact: IContact) {
    console.log('NewContactHandler PeerProvider', contact);
    peerManager?.isConnected(contact);
  }
  function contactOnlineHandle(statchange: { contact: IContact; status: boolean }) {
    console.log('ContactOnlineHandler PeerProvider', statchange);
    //peerManager?.isConnected(statchange.contact);
  }
  function handleStatusChange(status: boolean) {
    if (status)
      //getting online
      db?.contacts.each((contact) => {
        peerManager?.isConnected(contact);
      });
  }
  const setupPeerManager = (db: AppDatabase, user: IUserProfile) => {
    const pm = new PeerManager(user, db);

    pm.on('statusChange', handleStatusChange);
    pm.on('onMessage', messageHandler);
    pm.on('onNewContact', newContactHandle);
    pm.on('onContactStatusChange', contactOnlineHandle);

    const beforeunloadHandler = () => {
      peerManager?.disconnectGracefully();
    };
    window.addEventListener('beforeunload', beforeunloadHandler);

    setPeerManager(pm);

    return () => {
      //   window.removeEventListener('beforeunload', beforeunloadHandler);
      // console.warn('Cleaning up PeerProvider!');
      // peerManager.removeListener('statusChange', handleStatusChange);
      // peerManager.removeListener('onMessage', messageHandler);
      // peerManager.removeListener('onNewContact', newContactHandle);
      // peerManager.removeListener('onContactStatusChange', contactOnlineHandle);
      pm.disconnectGracefully();
      setPeerManager(null);
    };
  };

  useEffect(() => {
    if (!userContext.user || !db || peerManager) return;

    setupPeerManager(db, userContext.user);
  }, [db, userContext.user]);

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
