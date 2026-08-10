"use client"

import { useAuth } from "@/context/AuthContextSupabase"
import { useHomePageData } from "@/hooks/useHomePageData"
import { useMemo } from "react"

export function useLibraryPopContext() {
  const { user } = useAuth()
  const userId = user?.id ?? ""
  const { pops, isLoading } = useHomePageData(userId)

  const pop = useMemo(
    () => pops.find((entry) => entry.canEnter) ?? pops[0] ?? null,
    [pops],
  )

  return {
    siteId: pop?.siteId ?? "",
    popId: pop?.id ?? "",
    popName: pop?.name ?? "Rootsy",
    loading: isLoading,
    hasPop: Boolean(pop),
  }
}
