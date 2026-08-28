"use client"

import { settingsQueryOptions } from "@/lib/settingsWorkspaceQuery"
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
    ...settingsQueryOptions(popId ?? ""),
    enabled,
  })
}
