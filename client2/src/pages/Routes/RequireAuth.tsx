/*
 *
 *   AuthRoute.tsx
 *
 *
 *  Created by Christopher Fahlin on 12/29/21
 *
 *  pwa-starter
 *
 *  Copyright © 2009-2021 United States Government as represented by
 *  the Program Manager of the DHA: Web and Mobile Technology Program Management Office
 *  All Rights Reserved.
 *
 *  Copyright © 2009-2021 Contributors. All Rights Reserved.
 *
 *  THIS OPEN SOURCE AGREEMENT ("AGREEMENT") DEFINES THE RIGHTS OF USE,
 *  REPRODUCTION, DISTRIBUTION, MODIFICATION AND REDISTRIBUTION OF CERTAIN
 *  COMPUTER SOFTWARE ORIGINALLY RELEASED BY THE UNITED STATES GOVERNMENT
 *  AS REPRESENTED BY THE GOVERNMENT AGENCY LISTED BELOW ("GOVERNMENT AGENCY").
 *  THE UNITED STATES GOVERNMENT, AS REPRESENTED BY GOVERNMENT AGENCY, IS AN
 *  INTENDED THIRD-PARTY BENEFICIARY OF ALL SUBSEQUENT DISTRIBUTIONS OR
 *  REDISTRIBUTIONS OF THE SUBJECT SOFTWARE. ANYONE WHO USES, REPRODUCES,
 *  DISTRIBUTES, MODIFIES OR REDISTRIBUTES THE SUBJECT SOFTWARE, AS DEFINED
 *  HEREIN, OR ANY PART THEREOF, IS, BY THAT ACTION, ACCEPTING IN FULL THE
 *  RESPONSIBILITIES AND OBLIGATIONS CONTAINED IN THIS AGREEMENT.
 *
 *  Government Agency: DHA: Web and Mobile Technology Program Management Office
 *  Government Agency Original Software Designation: pwa-provider-resilience
 *  Government Agency Original Software Title: pwa-provider-resilience
 *  User Registration Requested. Please send email
 *  with your contact information to: robert.a.kayl.civ@mail.mil
 *  Government Agency Point of Contact for Original Software - Program Manager: robert.a.kayl.civ@mail.mil
 *
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router';
import { State } from 'store/rootReducer';
import { AuthContext } from '../../providers/AuthProvider';

export const RequireAuth = () => {
  const { authenticated } = React.useContext(AuthContext);
  const existingAccount = useSelector((state: State) => state.accountState.created);
  const isSecure = useSelector((state: State) => state.accountState.isSecure);

  const eulaAccepted = useSelector((state: State) => state.eulaState.accepted);

  if (!eulaAccepted) {
    return <Navigate to="/eula" replace />;
  }

  // --------------------------------------------------------------------------------------------------
  // If the app needs authentication, uncomment the following lines of code for account setup and login
  // --------------------------------------------------------------------------------------------------

  if (!authenticated) {
    if (!existingAccount) {
      return <Navigate to="/accountSetup" replace />;
    } else if (isSecure) {
      return <Navigate to="/login" replace />;
    }
  }
  return <Outlet />;
};
