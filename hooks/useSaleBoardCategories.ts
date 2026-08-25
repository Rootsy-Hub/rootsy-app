"use client"

import { saleBoardCategoriesQueryKey } from "@/lib/queryKeys"
import { operateBoardPersistQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopArticleCategories } from "@/lib/rootsyApi/categoriesClient"
import { useQuery } from "@tanstack/react-query"

type UseSaleBoardCategoriesOptions = {
  enabled?: boolean
}

export function useSaleBoardCategories(
  popId: string | undefined,
  options?: UseSaleBoardCategoriesOptions,
) {
  return useQuery({
    queryKey: saleBoardCategoriesQueryKey(popId ?? ""),
    queryFn: () =>
      fetchPopArticleCategories(popId!, {
        itemKind: "merchandise",
        showInSale: true,
      }),
    enabled: Boolean(popId) && (options?.enabled ?? true),
    ...operateBoardPersistQueryOptions,
  })
}
