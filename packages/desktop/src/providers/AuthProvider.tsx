import React, { useContext, useState, useEffect } from 'react';
import { User } from '@nirvana/core/models/user.model';

interface IAuthProvider {
  user: User;
}

const AuthContext = React.createContext<IAuthProvider>({
  user: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (true) return <></>;

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}

export default function useAuth() {
  return useContext(AuthContext);
}
