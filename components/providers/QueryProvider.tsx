"use client"

import { createQueryClient } from "@/lib/queryClient"
import {
  createRootsQueryPersister,
  isPersistedHomeQueryKey,
  rootsQueryPersistMaxAge,
} from "@/lib/queryPersist"
import { oneDayQueryOptions } from "@/lib/queryStaleTimes"
import {
  persistQueryClientSubscribe,
  type PersistedClient,
} from "@tanstack/query-persist-client-core"
import { hydrate, QueryClientProvider } from "@tanstack/react-query"
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

    try {
      const persisted = persister.restoreClient() as
        | PersistedClient
        | undefined
      if (
        persisted?.timestamp &&
        Date.now() - persisted.timestamp < rootsQueryPersistMaxAge
      ) {
        const existingKeys = new Set(
          queryClient
            .getQueryCache()
            .getAll()
            .filter((query) => query.state.data !== undefined)
            .map((query) => JSON.stringify(query.queryKey)),
        )
        const queries = persisted.clientState.queries.filter(
          (query) => !existingKeys.has(JSON.stringify(query.queryKey)),
        )
        hydrate(queryClient, { ...persisted.clientState, queries }, {
          defaultOptions: {
            queries: oneDayQueryOptions,
          },
        })
      }
    } catch {
      persister.removeClient()
    }

    if (cancelled) return
    unsubscribe = persistQueryClientSubscribe({
      queryClient,
      persister,
      dehydrateOptions,
    })
    setPersistReady(true)

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
