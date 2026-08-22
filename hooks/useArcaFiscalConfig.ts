"use client"

import { popArcaFiscalConfigQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchArcaFiscalConfig } from "@/lib/rootsyApi/arcaSalePointsClient"
import { useQuery } from "@tanstack/react-query"

type Options = {
  enabled?: boolean
}

export function useArcaFiscalConfig(
  popId: string | undefined,
  options?: Options,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)

  return useQuery({
    queryKey: popArcaFiscalConfigQueryKey(popId ?? ""),
    queryFn: () => fetchArcaFiscalConfig(popId!),
    enabled,
    ...sessionListQueryOptions,
  })
}
