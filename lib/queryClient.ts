import { QueryClient } from "@tanstack/react-query"

/** Sin cache por defecto — cada pantalla configurará staleTime más adelante. */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: 1,
      },
    },
  })
}
