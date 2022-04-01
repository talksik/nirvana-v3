import { $authTokens } from "../../controller/recoil";
import Login from "../../pages/Login";
import NirvanaApi from "../../controller/nirvanaApi";
import { STORE_ITEMS } from "../../electron/constants";
import SkeletonLoader from "../loading/skeleton";
import { useEffect } from "react";
import { useLogin } from "../../controller/index";
import { useRecoilValue } from "recoil";

export default function ProtectedRoute({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { mutateAsync } = useLogin();

  useEffect(() => {
    // on load of this, if we already have jwt tokens in store,
    // then try using them with auth check, and if successful with simple dime call, then let them continue
    window.electronAPI.store
      .get(STORE_ITEMS.AUTH_SESSION_JWT)
      .then((jwtToken: string) => {
        if (jwtToken) {
          // todo use this to do an auth check...set the necessary things to make react query run the check
          // check if the jwt token is good

          // then pass onto the api and such

          NirvanaApi._jwtToken = jwtToken;
        }
      });
  }, []);

  return <Login />;

  // if (isLoading || isIdle)
  //   return (
  //     <div className="container h-screen w-screen flex flex-col justify-center mx-10">
  //       <SkeletonLoader />
  //     </div>
  //   );

  // if (isError) {
  //   return <Login />;
  // }

  // if we can successfully get user details, we are good to continue
  return <>{children}</>;
}
