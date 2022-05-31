import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
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

  expect(getByText(/Private, Direct Video, Calling and Messenging./i)).toBeInTheDocument();
});

test('Home', () => {
  const { getByText } = render(
    <BrowserRouter>
      <Provider store={store}>
        <Home />
      </Provider>
    </BrowserRouter>
  );

  expect(getByText(/Invite Someone/i)).toBeInTheDocument();
});
