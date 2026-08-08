"use client"

import { createQueryClient } from "@/lib/queryClient"
import {
  createRootsQueryPersister,
  isPersistedHomeQueryKey,
  rootsQueryPersistMaxAge,
} from "@/lib/queryPersist"
import { oneDayQueryOptions } from "@/lib/queryStaleTimes"
import {
  persistQueryClientRestore,
  persistQueryClientSubscribe,
} from "@tanstack/query-persist-client-core"
import { QueryClientProvider } from "@tanstack/react-query"
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

const dehydrateOptions = {
  shouldDehydrateQuery: (query: {
    queryKey: readonly unknown[]
    state: { status: string }
  }) =>
    query.state.status === "success" &&
    isPersistedHomeQueryKey(query.queryKey),
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())
  const [persistReady, setPersistReady] = useState(false)

  useEffect(() => {
    const persister = createRootsQueryPersister()
    if (!persister) {
      setPersistReady(true)
      return
    }

    let unsubscribe: (() => void) | undefined
    let cancelled = false

    void persistQueryClientRestore({
      queryClient,
      persister,
      maxAge: rootsQueryPersistMaxAge,
      hydrateOptions: {
        defaultOptions: {
          queries: oneDayQueryOptions,
        },
      },
    })
      .catch(() => {
        persister.removeClient()
      })
      .finally(() => {
        if (cancelled) return
        unsubscribe = persistQueryClientSubscribe({
          queryClient,
          persister,
          maxAge: rootsQueryPersistMaxAge,
          dehydrateOptions,
        })
        setPersistReady(true)
      })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <PersistReadyContext.Provider value={persistReady}>
        {children}
        {process.env.NODE_ENV === "development" ? (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
        ) : null}
      </PersistReadyContext.Provider>
    </QueryClientProvider>
  )
}
