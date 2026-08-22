"use client"

import { popSettingsQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopSettings } from "@/lib/rootsyApi/settingsClient"
import { useQuery } from "@tanstack/react-query"

type UsePopSettingsOptions = {
  enabled?: boolean
}

export function usePopSettings(
  popId: string | undefined,
  options?: UsePopSettingsOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)

  return useQuery({
    queryKey: popSettingsQueryKey(popId ?? ""),
    queryFn: () => fetchPopSettings(popId!),
    enabled,
    ...sessionListQueryOptions,
  })
}
