"use client"

import { createQueryClient } from "@/lib/queryClient"
import { clearLegacyQueryPersist } from "@/lib/queryPersist"
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

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())

  useEffect(() => {
    clearLegacyQueryPersist()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <PersistReadyContext.Provider value={true}>
        {children}
        {process.env.NODE_ENV === "development" ? (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        ) : null}
      </PersistReadyContext.Provider>
    </QueryClientProvider>
  )
}
