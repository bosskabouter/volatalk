/* eslint-disable */
// @ts-nocheck
import React, { ReactNode } from 'react';
import { IUserProfile } from 'types';
import { useSessionStorage } from '../util/useSessionStorage';

export type IUserContext = {
  user: IUserProfile;
  setUser: (getUser: IUserProfile) => void;
};

const noop = () => {
  /*  */
};
export const UserContext = React.createContext<IUserContext>({
  user: null,
  setUser: noop,
});
export type UserProviderProps = {
  defaultUser?: IUserProfile | null;
  children: ReactNode;
};

const UserProvider: React.FC<UserProviderProps> = ({ defaultUser, children }) => {
  null;
  const [user, setUser] = useSessionStorage<IUserProfile>('user', defaultUser, 3600000);

  const contextValue = React.useMemo(
    () => ({
      user,
      setUser,
    }),
    [user]
  );

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

export default UserProvider;
