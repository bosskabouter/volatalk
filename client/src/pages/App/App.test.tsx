import { render } from '@testing-library/react';
import AuthProvider from 'providers/AuthProvider';
import PeerProvider from 'providers/PeerProvider';
import UserProvider from 'providers/UserProvider';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import ServiceWorkerWrapper from 'sw/ServiceWorkerWrapper';
import { EULA } from '../../components';
import store from '../../store/store';
import Home from '../Home/Home';

test('eula', () => {
  const { getByText } = render(
    <BrowserRouter>
      <Provider store={store}>
        <EULA />
      </Provider>
    </BrowserRouter>
  );

  expect(getByText(/Nothing as volatile/i)).toBeInTheDocument();
});

test('Home', () => {
  const { getByText } = render(
    <BrowserRouter>
      <Provider store={store}>
        <Home />
      </Provider>
    </BrowserRouter>
  );

  expect(getByText(/No contacts yet/i)).toBeInTheDocument();
});
