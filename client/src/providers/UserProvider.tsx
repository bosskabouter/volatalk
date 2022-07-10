/* eslint-disable */
// @ts-nocheck
import React, { createContext, ReactNode } from 'react';
import { IUserProfile } from 'types';
import { useSessionStorage } from '../util/useSessionStorage';
export type IUserContext = {
  user: IUserProfile | null;
  setUser: (getUser: IUserProfile) => void;
};

const noop = () => {
  return;
};
export const UserContext = createContext<IUserContext>({
  user: null,
  setUser: noop,
});

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useSessionStorage<IUserProfile>('user', null, 3600000);

  const contextValue = React.useMemo(
    () => ({
      user,
      setUser,
    }),
    [setUser, user]
  );

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

export default UserProvider;
