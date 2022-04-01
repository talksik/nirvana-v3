import { useAuthCheck, useLogin } from "../../controller/index";

import { $authTokens } from "../../controller/recoil";
import Login from "../../pages/Login";
import NirvanaApi from "../../controller/nirvanaApi";
import { STORE_ITEMS } from "../../electron/constants";
import SkeletonLoader from "../loading/skeleton";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { isLoading, isError, isSuccess, refetch } = useAuthCheck();

  useEffect(() => {
    // on load of this, if we already have jwt tokens in store,
    // then try using them with auth check
    window.electronAPI.store
      .get(STORE_ITEMS.AUTH_SESSION_JWT)
      .then((jwtToken: string) => {
        if (jwtToken) {
          NirvanaApi._jwtToken = jwtToken;
          refetch();
        }
      });
  }, []);

  if (isLoading) {
    return (
      <div className="container h-screen w-screen flex flex-col justify-center mx-10">
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
