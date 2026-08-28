import { QueryClient } from "@tanstack/react-query"
import {
  defaultQueryOptions,
  sessionListQueryOptions,
} from "@/lib/queryStaleTimes"

let browserQueryClient: QueryClient | undefined

export function createQueryClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        ...defaultQueryOptions,
        retry: 1,
      },
    },
  })

  // Home + sidecar: solo memoria de sesión. F5 o pestaña nueva refetch.
  client.setQueryDefaults(["_user-profile"], sessionListQueryOptions)
  client.setQueryDefaults(["_user-pops-access-batch"], sessionListQueryOptions)
  client.setQueryDefaults(["_user-pops"], sessionListQueryOptions)
  client.setQueryDefaults(["_pop-access"], sessionListQueryOptions)
  client.setQueryDefaults(["pop-hr"], sessionListQueryOptions)
  client.setQueryDefaults(["pop-cash-registers"], sessionListQueryOptions)

  return client
}

/** Mismo client que QueryProvider — para prefetch fuera de React. */
export function getBrowserQueryClient() {
  if (typeof window === "undefined") return createQueryClient()
  browserQueryClient ??= createQueryClient()
  return browserQueryClient
}
