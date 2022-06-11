// make do router given absense of react router in desktop apps

import React, { useCallback, useEffect, useState } from 'react';

import useConversations from './ConversationProvider';

type TPage =
  | 'START_NEW_CONVERSATION'
  | 'FULL_PAGE_OMNI_SEARCH'
  | 'SELECTED_CONVERSATION'
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

  const { selectedConversation } = useConversations();

  useEffect(() => {
    if (selectedConversation) {
      setPage('SELECTED_CONVERSATION');
    }
  }, [setPage, selectedConversation]);

  const handleSetPage = useCallback((newPage: TPage) => () => setPage(newPage), [setPage]);

  return (
    <RouterContext.Provider value={{ page, handleSetPage }}>{children}</RouterContext.Provider>
  );
}

export default function useRouter() {
  return React.useContext(RouterContext);
}
