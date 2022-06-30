import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router';
import { State } from './../../store/rootReducer';
import { AuthContext } from '../../providers/AuthProvider';
import { useLocation } from 'react-router-dom';
import AcceptInvite from './../../components/Invite/AcceptInvite';
import { DatabaseContext } from '../../providers/DatabaseProvider';
import { UserContext } from '../../providers/UserProvider';

export const RequireAuth = () => {
  const { authenticated } = React.useContext(AuthContext);
  const existingAccount = useSelector((state: State) => state.accountState.created);
  const isSecure = useSelector((state: State) => state.accountState.isSecure);
  const { setAuthenticated } = useContext(AuthContext);
  const db = useContext(DatabaseContext);
  const userCtx = useContext(UserContext);

  const eulaAccepted = useSelector((state: State) => state.eulaState.accepted);

  //CHECK FOR INVITE PARAMS TO PASS ALONG EULA AND AccountSetup
  const inviteParams = useLocation().search;

  if (inviteParams.length > 0) {
    localStorage.setItem('invite', inviteParams);
  }

  const receivedInvite = inviteParams || localStorage.getItem('invite');
  if (receivedInvite && receivedInvite?.length > 0 && eulaAccepted && existingAccount) {
    return <AcceptInvite invite={receivedInvite} />;
  }

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
      //pinsecured account, goto login
      return <Navigate to="/login" replace />;
    } else {
      //user didnt secure account. load user and set in context. Normally login would do this.
      if (db && !userCtx.user)
        db.userProfile.get(1).then((user) => {
          if (user) {
            console.info('Setting user in Context', user);
            userCtx.setUser(user);
            setAuthenticated(true);
          }
        });
    }
  }

  return <Outlet />;
};
