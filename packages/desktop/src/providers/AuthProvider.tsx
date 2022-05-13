import React, { useContext, useState, useEffect } from 'react';
import { User } from '@nirvana/core/models/user.model';
import { useAsyncFn } from 'react-use';
import NirvanaApi, { getUserDetails } from '../api/NirvanaApi';
import toast from 'react-hot-toast';
import { useCallback } from 'react';

interface IAuthProvider {
  user?: User;
  jwtToken?: string;
  setJwtToken?: (jwtToken: string) => void;
  handleLogout?: () => void;
}

const AuthContext = React.createContext<IAuthProvider>({});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [jwtToken, setJwtToken] = useState<string>();
  const [userFetchState, fetchUser] = useAsyncFn(getUserDetails);

  useEffect(() => {
    if (jwtToken) {
      console.warn(jwtToken);

      // ?should this be set here? what's a better way of
      NirvanaApi._jwtToken = jwtToken;

      fetchUser()
        .then((response) => {
          toast.success('authenticated user');
        })
        .catch(() => {
          toast.error('problem in authenticating jwt token');
        });
    }
  }, [jwtToken, fetchUser]);

  const handleLogout = useCallback(() => {
    // ?should this be set here? what's a better way of
    NirvanaApi._jwtToken = null;

    fetchUser()
      .then((response) => {
        toast.success('authenticated user');
      })
      .catch(() => {
        toast.error('logged out');
      });

    setJwtToken(undefined);
  }, [fetchUser, setJwtToken]);

  const handleSetJwtToken = useCallback(
    (newJwtToken: string) => {
      setJwtToken(newJwtToken);
    },
    [setJwtToken],
  );

  return (
    <AuthContext.Provider
      value={{
        user: userFetchState.value?.user,
        setJwtToken: handleSetJwtToken,
        jwtToken,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  return useContext(AuthContext);
}
