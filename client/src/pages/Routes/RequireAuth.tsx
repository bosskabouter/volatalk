import { DatabaseContext } from 'providers/DatabaseProvider';
import { UserContext } from 'providers/UserProvider';
import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router';
import { State } from 'store/rootReducer';
import { AuthContext } from '../../providers/AuthProvider';

export const RequireAuth = () => {
  const { authenticated } = React.useContext(AuthContext);
  const existingAccount = useSelector((state: State) => state.accountState.created);
  const isSecure = useSelector((state: State) => state.accountState.isSecure);

  const db = useContext(DatabaseContext);
  const userCtx = useContext(UserContext);

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
    } else {
      //load user and set in context. Normally login would do this.
      if (db && !userCtx.user)
        db.userProfile.get(1).then((user) => {
          if (user) userCtx.setUser(user);
        });
    }
  }
  return <Outlet />;
};
