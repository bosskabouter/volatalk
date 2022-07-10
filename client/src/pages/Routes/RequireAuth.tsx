import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router';
import { State } from './../../store/rootReducer';
import { AuthContext } from '../../providers/AuthProvider';
import { useLocation } from 'react-router-dom';
import AcceptInvite from './../../components/Invite/AcceptInvite';
import { DatabaseContext } from '../../providers/DatabaseProvider';
import { UserContext } from '../../providers/UserProvider';
import { ContactsContext } from 'providers/ContactsProvider';

export const RequireAuth = () => {
  const { authenticated } = React.useContext(AuthContext);
  const existingAccount = useSelector((state: State) => state.accountState.created);
  const isSecure = useSelector((state: State) => state.accountState.isSecure);
  const { setAuthenticated } = useContext(AuthContext);
  const db = useContext(DatabaseContext);
  const userCtx = useContext(UserContext);

  const contactsCtx = useContext(ContactsContext);

  const eulaAccepted = useSelector((state: State) => state.eulaState.accepted);

  //CHECK FOR INVITE PARAMS TO PASS ALONG EULA AND AccountSetup
  const inviteParams = useLocation().search;

  if (inviteParams.length > 0) {
    localStorage.setItem('invite', inviteParams);
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
      //user didnt secure account. load user and set in context. Normally done by login.
      if (db && !userCtx.user)
        db.userProfile.get(1).then((user) => {
          if (user) {
            console.info('Setting User in context', user);
            userCtx.setUser(user);
            db.selectCategorizedContacts().then((cts) => {
              console.info('Setting contacts in context ', user);
              contactsCtx.setContacts(cts);
            });
            setAuthenticated(true);
          }
        });
    }
  }

  const receivedInvite = inviteParams || localStorage.getItem('invite');
  if (receivedInvite && receivedInvite?.length > 0 && eulaAccepted && existingAccount) {
    return <AcceptInvite invite={receivedInvite} />;
  }
  return <Outlet />;
};
