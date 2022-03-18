import Login from "../../pages/Login";
import { STORE_ITEMS } from "../../electron/store";
import SkeletonLoader from "../loading/skeleton";
import { nirvanaApi } from "../../controller/nirvanaApi";
import { useEffect } from "react";
import { useGetUserDetails } from "../../controller/index";

export default function ProtectedRoute({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { isLoading, isError, refetch } = useGetUserDetails();

  useEffect(() => {
    // console.log(window.electronAPI.store.get(STORE_ITEMS.AUTH_TOKENS));
    // nirvanaApi.getUserDetails();
  }, []);

  if (isLoading)
    return (
      <div className="container h-screen w-screen">
        <SkeletonLoader />
      </div>
    );

  if (isError) {
    return <Login onReady={() => refetch()} />;
  }

  // if we can successfully get user details, we are good to continue
  return <>{children}</>;
}
