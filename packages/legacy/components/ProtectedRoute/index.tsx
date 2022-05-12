import { useAuthCheck, useServerCheck } from '../../../src/controller/index';

import { $jwtToken } from '../../../src/controller/recoil';
import Login from '../../Login';
import NirvanaApi from '../../../src/controller/nirvanaApi';
import { STORE_ITEMS } from '../../../src/electron/constants';
import SkeletonLoader from '../loading/skeleton';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

export default function ProtectedRoute({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [jwtToken, setJwtToken] = useRecoilState($jwtToken);

  const {
    isError: serverFailure,
    isLoading: serverLoading,
    isSuccess: isServerHealthy,
    error: serverStatusError,
    isFetching: serverFetching,
  } = useServerCheck();

  const { isLoading, isError, isFetching, isSuccess, refetch } = useAuthCheck(
    !serverLoading
  );

  // ! REMOVING FOR TESTING MULTIPLE CLIENTS
  // useEffect(() => {
  //   // on load of this, if we already have jwt tokens in store,
  //   // then try using them with auth check
  //   window.electronAPI.store
  //     .get(STORE_ITEMS.AUTH_SESSION_JWT)
  //     .then((jwtToken: string) => {
  //       if (jwtToken) {
  //         NirvanaApi._jwtToken = jwtToken;
  //         setJwtToken(jwtToken);
  //         refetch();

  //         console.log("retrieved jwtToken from storage", jwtToken);
  //       } else {
  //         console.log("no jwt token in store");
  //       }
  //     });
  // }, []);

  useEffect(() => {
    console.log('change in jwt token', jwtToken);

    if (jwtToken) {
      window.electronAPI.store.set(STORE_ITEMS.AUTH_SESSION_JWT, jwtToken);
      setJwtToken(jwtToken);
    } else {
      window.electronAPI.store.set(STORE_ITEMS.AUTH_SESSION_JWT, null);
    }

    NirvanaApi._jwtToken = jwtToken;

    refetch();
  }, [jwtToken]);

  // first time loading
  if (serverLoading)
    return (
      <span className='text-md text-gray-400 flex items-center justify-center flex-1 text-center p-5 h-screen'>
        Sorry...this is our bad. Our servers are loading. We are trying our best
        to back up and running! :) <br /> Please contact me for urgent concerns:
        arjunpatel@berkeley.edu
      </span>
    );

  if (isLoading) {
    return (
      <div className='container h-screen w-screen flex flex-col justify-center mx-10'>
        <SkeletonLoader />
      </div>
    );
  }

  if (isError) {
    return <Login />;
  }

  // if we can successfully get user details, we are good to continue
  // basic auth...any additional auth should be done at lower levels
  if (isSuccess) {
    return <>{children}</>;
  }

  return <Login />;
}
