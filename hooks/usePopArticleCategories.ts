"use client"

import { popArticleCategoriesQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopArticleCategories } from "@/lib/rootsyApi/categoriesClient"
import { useQuery } from "@tanstack/react-query"

type UsePopArticleCategoriesOptions = {
  enabled?: boolean
}

export function usePopArticleCategories(
  popId: string | undefined,
  options?: UsePopArticleCategoriesOptions,
) {
  return useQuery({
    queryKey: popArticleCategoriesQueryKey(popId ?? ""),
    queryFn: () => fetchPopArticleCategories(popId!),
    enabled: Boolean(popId) && (options?.enabled ?? true),
    ...sessionListQueryOptions,
  })
}
