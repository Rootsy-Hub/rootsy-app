"use client"

import { printersListQueryOptions } from "@/lib/printersWorkspaceQuery"
import { useQuery } from "@tanstack/react-query"

type UsePopPrintersOptions = {
  enabled?: boolean
}

export function usePopPrinters(
  popId: string | undefined,
  options?: UsePopPrintersOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  return useQuery({
    ...printersListQueryOptions(popId ?? ""),
    enabled,
  })
}
