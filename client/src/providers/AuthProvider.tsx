/* eslint-disable */
// @ts-nocheck
import React from 'react';
import { useSessionStorage } from 'util/useSessionStorage';

export type IAuthContext = {
  authenticated: boolean;
  setAuthenticated: (isAuthenticated: boolean) => void;
};

const noop = () => {
  /* TODO document why this arrow function is empty */
};
export const AuthContext = React.createContext<IAuthContext>({
  authenticated: false,
  setAuthenticated: noop,
});

export function usePrevious<T = any>(value: T) {
  const ref = React.useRef<T>();

  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export type AuthProviderProps = {
  defaultAuthenticated?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({
  defaultAuthenticated = false,
  onLogin,
  onLogout,
  children,
}) => {
  const [authenticated, setAuthenticated] = useSessionStorage<boolean>(
    'authenticated',
    defaultAuthenticated,
    3600000
  );

  const previousAuthenticated = usePrevious(authenticated);

  React.useEffect(() => {
    if (!previousAuthenticated && authenticated) {
      onLogin && onLogin();
    }
  }, [previousAuthenticated, authenticated, onLogin]);

  React.useEffect(() => {
    if (previousAuthenticated && !authenticated) {
      onLogout && onLogout();
    }
  }, [previousAuthenticated, authenticated, onLogout]);

  const contextValue = React.useMemo(
    () => ({
      authenticated,
      setAuthenticated,
    }),
    [authenticated]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
