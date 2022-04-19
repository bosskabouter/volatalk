/** @jsxImportSource @emotion/react */
/*
 * App.tsx
 * App container.
 *
 * Created by firstName lastName on date.
 *
 * pwa-starter
 *
 * Copyright © 2009-2021 United States Government as represented by
 * the Program Manager of the DHA: Web and Mobile Technology Program Management Office
 * All Rights Reserved.
 *
 * Copyright © 2009-2021 Contributors. All Rights Reserved.
 *
 * THIS OPEN SOURCE AGREEMENT ("AGREEMENT") DEFINES THE RIGHTS OF USE,
 * REPRODUCTION, DISTRIBUTION, MODIFICATION AND REDISTRIBUTION OF CERTAIN
 * COMPUTER SOFTWARE ORIGINALLY RELEASED BY THE UNITED STATES GOVERNMENT
 * AS REPRESENTED BY THE GOVERNMENT AGENCY LISTED BELOW ("GOVERNMENT AGENCY").
 * THE UNITED STATES GOVERNMENT, AS REPRESENTED BY GOVERNMENT AGENCY, IS AN
 * INTENDED THIRD-PARTY BENEFICIARY OF ALL SUBSEQUENT DISTRIBUTIONS OR
 * REDISTRIBUTIONS OF THE SUBJECT SOFTWARE. ANYONE WHO USES, REPRODUCES,
 * DISTRIBUTES, MODIFIES OR REDISTRIBUTES THE SUBJECT SOFTWARE, AS DEFINED
 * HEREIN, OR ANY PART THEREOF, IS, BY THAT ACTION, ACCEPTING IN FULL THE
 * RESPONSIBILITIES AND OBLIGATIONS CONTAINED IN THIS AGREEMENT.
 *
 * Government Agency: DHA: Web and Mobile Technology Program Management Office
 * Government Agency Original Software Designation: pwa-starter
 * Government Agency Original Software Title: pwa-starter
 * User Registration Requested. Please send email
 * with your contact information to: robert.a.kayl.civ@mail.mil
 * Government Agency Point of Contact for Original Software - Program Manager: robert.a.kayl.civ@mail.mil
 */
import { StyledEngineProvider, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { Layout } from 'components';
import { AppRoutes } from 'pages';
import { AuthProvider } from 'providers/AuthProvider';
import { DatabaseProvider } from 'providers/DatabaseProvider';
import DialogProvider from 'providers/DialogProvider';
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
                  <Layout>
                    <AppRoutes />
                  </Layout>
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
