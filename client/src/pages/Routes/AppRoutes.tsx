import { CircularProgress } from '@mui/material';
import { EULA, PageNotFound } from 'components';
import AccountSetup from 'components/AccountSetup/AccountSetup';
import Login from 'components/Login/Login';
import NewPin from 'components/NewPin/NewPin';
import PinReset from 'components/PinReset/PinReset';
import Invite from 'components/Invite/Invite';

import { Home } from 'pages';
import { lazy, Suspense } from 'react';
import FadeIn from 'react-fade-in';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './RequireAuth';

// We load each route, when lazy loading, only as they're
// called by the user. The Home page is not lazily loaded
// because doing so would break the current test of the counter,
// as currently implemented. It also makes sense to have the
// homescreen loaded in memory as it is a page often visited.
// React.lazy only supports default imports.

const About = lazy(() => import('components/About/About'));
// const Home = lazy(() => import('../../pages/Home/Home'));

const AppRoutes = () => (
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
      <Route element={<EULA />} path="/eula" />
      <Route element={<Login />} path="/login" />
      <Route element={<AccountSetup />} path="/accountSetup" />
      {/* The RequireAuth component is a wrapper for all the routes that require authentication */}
      <Route element={<RequireAuth />}>
        <Route element={<Home />} path="/" />
        <Route element={<About />} path="/about" />
        <Route element={<Invite />} path="/invite" />
      </Route>
      <Route element={<NewPin />} path="/newPin" />
      <Route element={<PinReset />} path="/pinReset" />

      <Route element={<PageNotFound />} path="*" />
    </Routes>
  </Suspense>
);

export default AppRoutes;
