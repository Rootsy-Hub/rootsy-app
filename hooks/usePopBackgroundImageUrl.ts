"use client"

import { getPopMenuData } from "@/app/[siteId]/[popId]/menu/actions"
import { popBackgroundImageQueryKey } from "@/lib/queryKeys"
import { useQuery } from "@tanstack/react-query"

export function usePopBackgroundImageUrl(popId: string | undefined) {
  const query = useQuery({
    queryKey: popBackgroundImageQueryKey(popId ?? ""),
    queryFn: async () => {
      if (!popId) return null
      const result = await getPopMenuData(popId)
      if (!result.success) return null
      return result.pop.backgroundImageUrl ?? null
    },
    enabled: Boolean(popId),
  })

  return {
    backgroundImageUrl: query.data ?? null,
    loading: query.isLoading,
  }
}
