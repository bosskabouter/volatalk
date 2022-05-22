import { CircularProgress } from '@mui/material';
import { EULA, PageNotFound } from 'components';
import AccountSetup from 'components/AccountSetup/AccountSetup';
import Login from 'components/Login/Login';
import NewPin from 'components/NewPin/NewPin';
import PinReset from 'components/PinReset/PinReset';

import { lazy, Suspense, useEffect } from 'react';
import FadeIn from 'react-fade-in';
import { Route, Routes, useLocation } from 'react-router-dom';
import { RequireAuth } from './RequireAuth';

import Home from 'pages/Home/Home';
import { useSessionStorage } from 'util/useSessionStorage';

// We load each route, when lazy loading, only as they're
// called by the user. The Home page is not lazily loaded
// because doing so would break the current test of the counter,
// as currently implemented. It also makes sense to have the
// homescreen loaded in memory as it is a page often visited.
// React.lazy only supports default imports.

const About = lazy(() => import('components/About/About'));
const Invite = lazy(() => import('components/Invite/Invite'));
const AcceptInvite = lazy(() => import('components/Invite/AcceptInvite'));
const MessageList = lazy(() => import('pages/Messages/MessageList'));
const Contacts = lazy(() => import('pages/Contacts/ContactsPage'));
const CallerComponent = lazy(() => import('pages/Messages/CallerComponent'));

export const AppRoutes = () => {
  const inviteParams = useLocation().search;

  useEffect(() => {
    if (inviteParams.length > 0) {
      localStorage.setItem('invite', inviteParams);
    }
  }, [inviteParams]);

  return (
    //TODO CHECK FOR INVITE PARAMS TO PASS ALONG EULA AND AccountSetup

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

        {/* The RequireAuth component is a wrapper for all the routes that require authentication */}
        <Route element={<RequireAuth />}>
          <Route element={<Home />} path="/" />
          <Route element={<About />} path="/about" />
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
