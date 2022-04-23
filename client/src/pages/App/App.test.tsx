import { render } from '@testing-library/react';
import Home from 'pages/Home/Home';
import { Provider } from 'react-redux';
import store from 'store/store';

test('renders redux counter', () => {
  const { getByText } = render(
    <Provider store={store}>
      <Home />
    </Provider>
  );

  expect(getByText(/Hi/i)).toBeInTheDocument();
});
