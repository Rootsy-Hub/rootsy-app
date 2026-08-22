"use client"

import { popRecipeCategoriesQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopRecipeCategories } from "@/lib/rootsyApi/recipeCategoriesClient"
import { useQuery } from "@tanstack/react-query"

type UsePopRecipeCategoriesOptions = {
  enabled?: boolean
}

export function usePopRecipeCategories(
  popId: string | undefined,
  options?: UsePopRecipeCategoriesOptions,
) {
  return useQuery({
    queryKey: popRecipeCategoriesQueryKey(popId ?? ""),
    queryFn: () => fetchPopRecipeCategories(popId!),
    enabled: Boolean(popId) && (options?.enabled ?? true),
    ...sessionListQueryOptions,
  })
}
