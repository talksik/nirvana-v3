// make do router given absense of react router in desktop apps

import React, { useCallback, useState } from 'react';

type TPage =
  | 'START_NEW_CONVERSATION'
  | 'FULL_PAGE_OMNI_SEARCH'
  | 'CONVERSATION_DETAILS'
  | 'PROFILE'
  | 'WELCOME';

interface IRouterContext {
  page: TPage;
  handleSetPage?: (newPage: TPage) => () => void;
}

const RouterContext = React.createContext<IRouterContext>({
  page: 'WELCOME',
});

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<TPage>('WELCOME');

  const handleSetPage = useCallback((newPage: TPage) => () => setPage(newPage), [setPage]);

  return (
    <RouterContext.Provider value={{ page, handleSetPage }}>{children}</RouterContext.Provider>
  );
}

export default function useRouter() {
  return React.useContext(RouterContext);
}
