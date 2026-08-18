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
import { hydrate, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import {
  createContext,
  useContext,
  useLayoutEffect,
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

function restorePersistedQueries(queryClient: QueryClient) {
  const persister = createRootsQueryPersister()
  if (!persister) return null

  try {
    const persisted = persister.restoreClient() as PersistedClient | undefined
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

  return persister
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())
  const [persistReady, setPersistReady] = useState(false)

  useLayoutEffect(() => {
    restorePersistedQueries(queryClient)
    setPersistReady(true)

    const persister = createRootsQueryPersister()
    if (!persister) return

    const unsubscribe = persistQueryClientSubscribe({
      queryClient,
      persister,
      dehydrateOptions,
    })

    return () => {
      unsubscribe()
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
