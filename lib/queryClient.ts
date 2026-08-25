import { QueryClient } from "@tanstack/react-query"
import {
  defaultQueryOptions,
  sessionListQueryOptions,
} from "@/lib/queryStaleTimes"

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

  return client
}
