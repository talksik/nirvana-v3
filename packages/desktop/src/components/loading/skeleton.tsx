import { Skeleton } from "@mui/material";

export default function SkeletonLoader() {
  return (
    <div>
      <Skeleton variant="text" width={210} />
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="rectangular" width={210} height={118} />
    </div>
  );
}
