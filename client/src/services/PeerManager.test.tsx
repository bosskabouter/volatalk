globalThis.crypto = require('crypto').webcrypto;

import { PeerManager } from './PeerManager';
import { AppDatabase } from 'Database/Database';
import enrollUser from './UserService';
import { aUser } from './UserService.test';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import AuthProvider from 'providers/AuthProvider';
import PeerProvider from 'providers/PeerProvider';
import UserProvider from 'providers/UserProvider';
import { Provider } from 'react-redux';
import ServiceWorkerWrapper from 'sw/ServiceWorkerWrapper';

import PeerDisplay from 'util/Widgets/PeerDisplay';
import store from 'store/store';

test('Create PeerManager', async () => {
  const user = aUser();
  await enrollUser(user);
  const pm = new PeerManager(user, new AppDatabase());
  expect(pm).toBeDefined();
});

test('Peer', async () => {
  return;
  const user = await enrollUser(aUser());
  (global as any).RTCPeerConnection = jest.fn();

  const { getByText } = render(
    <BrowserRouter>
      <Provider store={store}>
        <AuthProvider>
          <UserProvider defaultUser={user}>
            <PeerProvider>
              <PeerDisplay />
            </PeerProvider>
          </UserProvider>
        </AuthProvider>
      </Provider>
    </BrowserRouter>
  );

  expect(getByText(/Currently No Calls/i)).toBeInTheDocument();
});
