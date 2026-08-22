"use client"

import { popServiceCategoriesQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopServiceCategories } from "@/lib/rootsyApi/serviceCategoriesClient"
import { useQuery } from "@tanstack/react-query"

type UsePopServiceCategoriesOptions = {
  enabled?: boolean
}

export function usePopServiceCategories(
  popId: string | undefined,
  options?: UsePopServiceCategoriesOptions,
) {
  return useQuery({
    queryKey: popServiceCategoriesQueryKey(popId ?? ""),
    queryFn: () => fetchPopServiceCategories(popId!),
    enabled: Boolean(popId) && (options?.enabled ?? true),
    ...sessionListQueryOptions,
  })
}
