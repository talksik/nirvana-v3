import NirvanaApi, { getUserDetails } from '../api/NirvanaApi';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { STORE_ITEMS } from '../electron/constants';
import User from '@nirvana/core/models/user.model';
import toast from 'react-hot-toast';
import { useAsyncFn } from 'react-use';

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

  // ! REMOVING FOR TESTING MULTIPLE CLIENTS
  // useEffect(() => {
  //   // on load of this, if we already have jwt tokens in store,
  //   // then try using them with auth check
  //   window.electronAPI.store.get(STORE_ITEMS.AUTH_SESSION_JWT).then((jwtToken: string) => {
  //     if (jwtToken) {
  //       setJwtToken(jwtToken);

  //       console.log('retrieved jwtToken from storage', jwtToken);
  //     } else {
  //       console.log('no jwt token in store');
  //     }
  //   });
  // }, []);

  // todo: check this in intervals repeatedly
  useEffect(() => {
    if (jwtToken) {
      console.warn(jwtToken);

      // ?should this be set here? what's a better way of having jwt token encapsulated in api async functions
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
