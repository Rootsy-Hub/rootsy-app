"use client"

import { popArticleCategoriesQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopArticleCategories } from "@/lib/rootsyApi/categoriesClient"
import { useQuery } from "@tanstack/react-query"

export function usePopArticleCategories(popId: string | undefined) {
  return useQuery({
    queryKey: popArticleCategoriesQueryKey(popId ?? ""),
    queryFn: () => fetchPopArticleCategories(popId!),
    enabled: Boolean(popId),
    ...sessionListQueryOptions,
  })
}
