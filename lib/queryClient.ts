import { QueryClient } from "@tanstack/react-query"
import {
  defaultQueryOptions,
  oneDayQueryOptions,
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

  // Home + sidecar: 1 día en persist (localStorage). Reload no refetch.
  client.setQueryDefaults(["_user-profile"], oneDayQueryOptions)
  client.setQueryDefaults(["_user-pops-access-batch"], oneDayQueryOptions)
  client.setQueryDefaults(["_user-pops"], oneDayQueryOptions)
  client.setQueryDefaults(["_pop-access"], oneDayQueryOptions)

  return client
}
