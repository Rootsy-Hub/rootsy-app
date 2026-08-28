"use client"

import { createQueryClient } from "@/lib/queryClient"
import { clearLegacyQueryPersist } from "@/lib/queryPersist"
import { QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useState, type ReactNode } from "react"

/** Antes esperaba el persist de TanStack. El catálogo local ya no bloquea. */
export function useQueryPersistReady(): boolean {
  return true
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())

  useEffect(() => {
    clearLegacyQueryPersist()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
