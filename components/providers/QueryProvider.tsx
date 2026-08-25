"use client"

import { createQueryClient } from "@/lib/queryClient"
import {
  clearLegacyQueryPersist,
  createSaleBoardPersister,
  SALE_BOARD_PERSIST_BUSTER,
  shouldDehydrateSaleBoardQuery,
} from "@/lib/queryPersist"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

const PersistReadyContext = createContext(true)

export function useQueryPersistReady(): boolean {
  return useContext(PersistReadyContext)
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())
  const [persister] = useState(() => createSaleBoardPersister())

  useEffect(() => {
    clearLegacyQueryPersist()
  }, [])

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: Number.POSITIVE_INFINITY,
        buster: SALE_BOARD_PERSIST_BUSTER,
        dehydrateOptions: {
          shouldDehydrateQuery: shouldDehydrateSaleBoardQuery,
        },
      }}
    >
      <PersistReadyContext.Provider value={true}>
        {children}
        {process.env.NODE_ENV === "development" ? (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        ) : null}
      </PersistReadyContext.Provider>
    </PersistQueryClientProvider>
  )
}
