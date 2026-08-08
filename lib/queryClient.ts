import { QueryClient } from "@tanstack/react-query"
import { oneDayQueryOptions } from "@/lib/queryStaleTimes"

/** Sin cache por defecto — cada pantalla configurará staleTime más adelante. */
export function createQueryClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: 1,
      },
      hydrate: {
        queries: oneDayQueryOptions,
      },
    },
  })

  // Queries del home: sobreviven en memoria tras restore (sin observadores hasta auth + persistReady).
  client.setQueryDefaults(["_user-profile"], oneDayQueryOptions)
  client.setQueryDefaults(["_user-pop-ids"], oneDayQueryOptions)
  client.setQueryDefaults(["_pop-access"], oneDayQueryOptions)

  return client
}
