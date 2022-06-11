// make do router given absense of react router in desktop apps

import React, { useState } from 'react';

export enum EPage {
  START_NEW_CONVERSATION = 'START_NEW_CONVERSATION',
  FULL_PAGE_OMNI_SEARCH = 'FULL_PAGE_OMNI_SEARCH',
  CONVERSATION_DETAILS = 'CONVERSATION_DETAILS',
  PROFILE = 'PROFILE',
  WELCOME = 'WELCOME',
}

interface IRouterContext {
  page: EPage;
  setPage?: React.Dispatch<React.SetStateAction<EPage>>;
}

const RouterContext = React.createContext<IRouterContext>({
  page: EPage.START_NEW_CONVERSATION,
});

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<EPage>(EPage.START_NEW_CONVERSATION);

  return <RouterContext.Provider value={{ page, setPage }}>{children}</RouterContext.Provider>;
}

export default function useRouter() {
  return React.useContext(RouterContext);
}
