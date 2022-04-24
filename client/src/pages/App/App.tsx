/** @jsxImportSource @emotion/react */

import { StyledEngineProvider, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { Layout } from 'components';
import { AppRoutes } from 'pages';
import { AuthProvider } from 'providers/AuthProvider';
import { DatabaseProvider } from 'providers/DatabaseProvider';
import DialogProvider from 'providers/DialogProvider';
import { PeerProvider as PProvider } from 'providers/PeerProvider';
import { UserProvider as UsrProvider } from 'providers/UserProvider';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from 'store/store';
import 'typeface-roboto';
import { theme } from './theme';

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <StyledEngineProvider injectFirst>
          <MuiThemeProvider theme={theme}>
            <DatabaseProvider>
              <DialogProvider>
                <AuthProvider>
                  <UsrProvider>
                    <PProvider>
                      <Layout>
                        <AppRoutes />
                      </Layout>
                    </PProvider>
                  </UsrProvider>
                </AuthProvider>
              </DialogProvider>
            </DatabaseProvider>
          </MuiThemeProvider>
        </StyledEngineProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
