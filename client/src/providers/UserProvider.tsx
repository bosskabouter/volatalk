/* eslint-disable */
// @ts-nocheck
import React, { ReactNode } from 'react';
import { IUserProfile } from 'types';
import { useSessionStorage } from '../util/useSessionStorage';

export type IUserContext = {
  user: IUserProfile;
  setUser: (getUser: IUserProfile) => void;
};
const defaultUser2: IUserProfile = {
  security: {
    privateKey: '',
    isSecured: false,
    pin: '123',
    question1: '',
    answer1: '',
    question2: '',
    answer2: '',
  },
  usePush: false,
  useGps: false,
  peerid: '',
  dateRegistered: new Date(0),
  nickname: '',
  avatar: '',
  avatarThumb: '',
  position: null,
  pushSubscription: null,
};

const noop = () => {
  /*  */
};
export const UserContext = React.createContext<IUserContext>({
  user: null,
  setUser: noop,
});

export function usePrevious<T = any>(value: T) {
  const ref = React.useRef<T>();

  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export type UserProviderProps = {
  defaultUser?: { null };
  onLogin?: () => void;
  onLogout?: () => void;
  children: ReactNode;
};

const UserProvider: React.FC<UserProviderProps> = ({
  defaultUser = null,
  onLogin,
  onLogout,
  children,
}) => {
  const [user, setUser] = useSessionStorage<IUserProfile>('user', defaultUser, 3600000);

  const previousUser = usePrevious(user);

  React.useEffect(() => {
    if (!previousUser && user) {
      onLogin && onLogin();
    }
  }, [previousUser, user, onLogin]);

  React.useEffect(() => {
    if (previousUser && !user) {
      onLogout && onLogout();
    }
  }, [previousUser, user, onLogout]);

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
