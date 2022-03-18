import { Route, useNavigate } from "react-router-dom";

import { STORE_ITEMS } from "../../electron/store";
import { nirvanaApi } from "../../controller/nirvanaApi";
import { useEffect } from "react";
import { useGetUserDetails } from "../../controller/index";

export default function ProtectedRoute({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { isLoading, isError } = useGetUserDetails();
  const navigate = useNavigate();

  useEffect(() => {
    // console.log(window.electronAPI.store.get(STORE_ITEMS.AUTH_TOKENS));
    // nirvanaApi.getUserDetails();
  }, []);

  if (isError) {
    navigate("/login");
  }

  if (isLoading) return <span>please wait while we authenticate you</span>;

  // if we can successfully get user details, we are good to continue

  return <>{children}</>;
}
