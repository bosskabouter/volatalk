/*
 * Routes.tsx
 * Routes component.
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
import { CircularProgress } from '@mui/material';
import { EULA, PageNotFound } from 'components';
import AccountSetup from 'components/AccountSetup/AccountSetup';
import Login from 'components/Login/Login';
import NewPin from 'components/NewPin/NewPin';
import PinReset from 'components/PinReset/PinReset';
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
      </Route>
      <Route element={<NewPin />} path="/newPin" />
      <Route element={<PinReset />} path="/pinReset" />
      <Route element={<PageNotFound />} path="*" />
    </Routes>
  </Suspense>
);

export default AppRoutes;
