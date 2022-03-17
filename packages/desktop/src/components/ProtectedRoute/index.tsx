import { Route, useNavigate } from "react-router-dom";

import { useGetUserDetails } from "../../controller/index";

export default function ProtectedRoute({ ...children }) {
  const { isLoading, isError } = useGetUserDetails();

  const navigate = useNavigate();

  if (isLoading) return <span>please wait while we authenticate you</span>;

  if (isError) {
    // toast.error("Please sign in first!");
    navigate("/login");

    return <span>you are not allowed here!</span>;
  }

  // if we can successfully get user details, we are good to continue

  return <>{children}</>;
}