import React from 'react';
import useAuth from '../../providers/AuthProvider';
import Login from './login/Login';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) return <Login />;

  return <>{children}</>;
}
