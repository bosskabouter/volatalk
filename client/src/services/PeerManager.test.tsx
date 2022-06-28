import { PeerManager } from './PeerManager';
import { AppDatabase } from 'Database/Database';
import enrollUser from './UserService';
import { aUser } from './UserService.test';
import { queryByTestId, render, QueryByAttribute } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import AuthProvider from 'providers/AuthProvider';
import PeerProvider from 'providers/PeerProvider';
import UserProvider from 'providers/UserProvider';
import { Provider } from 'react-redux';

import PeerDisplay from 'util/Widgets/PeerDisplay';
import store from 'store/store';

test('Create PeerManager', async () => {
  const user = await enrollUser(aUser);
  await enrollUser(user);
  const pm = new PeerManager(user, new AppDatabase());
  expect(pm).toBeDefined();
});

test(
  'Peer',
  async () => {
    const user = await enrollUser(aUser);
    ///global.RTCPeerConnection = jest.fn();

    const { queryByTestId } = render(
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

    //    expect(queryByTestId('solely_for_jesttest')).toBeInTheDocument();
  },
  30 * 1000
);
