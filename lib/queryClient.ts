import { QueryClient } from "@tanstack/react-query"
import {
  defaultQueryOptions,
  oneDayQueryOptions,
  sessionListQueryOptions,
} from "@/lib/queryStaleTimes"

export function createQueryClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        ...defaultQueryOptions,
        retry: 1,
      },
      hydrate: {
        queries: oneDayQueryOptions,
      },
    },
  })

  // Queries del home: sobreviven en memoria tras restore (sin observadores hasta auth + persistReady).
  client.setQueryDefaults(["_user-profile"], sessionListQueryOptions)
  client.setQueryDefaults(["_user-pops-access-batch"], oneDayQueryOptions)
  client.setQueryDefaults(["_user-pops"], sessionListQueryOptions)
  client.setQueryDefaults(["_pop-access"], oneDayQueryOptions)

  return client
}
