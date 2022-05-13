import React from 'react';
import useAuth from '../../providers/AuthProvider';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (user) return;
  return <>hey</>;
}
