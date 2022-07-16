import { CircularProgress } from '@mui/material';
import Backup from 'Database/Backup';
import CallerComponent from 'components/Call/CallerComponent';

import { lazy, Suspense } from 'react';
import FadeIn from 'react-fade-in';
import { Route, Routes } from 'react-router-dom';
import { EULA } from '../../components';
import AccountSetup from '../../components/AccountSetup/AccountSetup';
import Home from '../Home/Home';
import { RequireAuth } from './RequireAuth';

// We load each route, when lazy loading, only as they're
// called by the user. The Home page is not lazily loaded
// because doing so would break the current test of the counter,
// as currently implemented. It also makes sense to have the
// homescreen loaded in memory as it is a page often visited.
// React.lazy only supports default imports.

const About = lazy(() => import('../../components/About/About'));
const Login = lazy(() => import('../../components/Login/Login'));
const PageNotFound = lazy(() => import('../../components/PageNotFound/PageNotFound'));
const NewPin = lazy(() => import('../../components/NewPin/NewPin'));
const PinReset = lazy(() => import('../../components/PinReset/PinReset'));
const Invite = lazy(() => import('../../components/Invite/Invite'));
const MessageList = lazy(() => import('../Message/MessageList'));
const Contacts = lazy(() => import('../../pages/Contacts/ContactsPage'));

/**
 * General hook to reload App and reinit (after db restore or profile update)
 */
export function reloadApp() {
  console.info('Reloading App');
  document.location = './';
}
export const AppRoutes = () => {
  return (
    // Suspense tells React that the data a component is reading
    // needs some time to wait. It does not tie your network logic
    // to React components.
    <Suspense
      // Fallback allows you to display any React component as a
      // loading state by giving Suspense the fallback component FadeIn.
      // TODO: react-spinners may be worth looking into
      // https://www.davidhu.io/react-spinners/
      fallback={
        <FadeIn>
          <div>
            <h1>Fetching Page</h1>
            <CircularProgress />
          </div>
        </FadeIn>
      }
    >
      <Routes>
        <Route element={<EULA />} path={'/eula'} />
        <Route element={<Login />} path={'/login'} />
        <Route element={<AccountSetup />} path={'/accountSetup'} />
        <Route element={<Backup />} path="/restore" />
        {/* The RequireAuth component is a wrapper for all the routes that require authentication */}
        <Route element={<RequireAuth />}>
          <Route element={<Home />} path="/" />
          <Route element={<About />} path="/about" />
          <Route element={<Backup />} path="/backup" />

          <Route element={<Invite />} path="/invite" />
          <Route element={<Contacts />} path="/contacts" />
          <Route element={<MessageList />} path="/messages/:contactid" />
          <Route element={<CallerComponent videoOn={false} />} path="/call/:contactid" />
          <Route element={<CallerComponent videoOn />} path="/video/:contactid" />
        </Route>
        <Route element={<NewPin />} path="/newPin" />
        <Route element={<PinReset />} path="/pinReset" />

        <Route element={<PageNotFound />} path="*" />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
