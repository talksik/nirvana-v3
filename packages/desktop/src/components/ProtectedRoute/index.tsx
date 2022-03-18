import Login from "../../pages/Login";
import SkeletonLoader from "../loading/skeleton";
import { useEffect } from "react";
import { useGetUserDetails } from "../../controller/index";

export default function ProtectedRoute({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { isLoading, isError, refetch } = useGetUserDetails();

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
