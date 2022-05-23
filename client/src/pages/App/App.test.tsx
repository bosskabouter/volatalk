import { render } from '@testing-library/react';
import Home from 'pages/Home/Home';
import { Provider } from 'react-redux';
import store from 'store/store';
import { BrowserRouter } from 'react-router-dom';

test('renders redux counter', () => {
  const { getByText } = render(
    <BrowserRouter>
      <Provider store={store}>
        <Home />
      </Provider>
    </BrowserRouter>
  );

  expect(getByText(/Invite Someone/i)).toBeInTheDocument();
});
