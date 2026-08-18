"use client"

import { getPopRecipesTable } from "@/app/[siteId]/[popId]/recipes/actions"
import {
  popRecipesQueryKey,
  type PopRecipesQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { useQuery } from "@tanstack/react-query"

type UsePopRecipesTableOptions = {
  enabled?: boolean
}

export function usePopRecipesTable(
  popId: string | undefined,
  params: PopRecipesQueryParams,
  options?: UsePopRecipesTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)

  return useQuery({
    queryKey: popRecipesQueryKey(popId ?? "", params),
    queryFn: () =>
      getPopRecipesTable(popId!, {
        q: params.q,
        page: params.page,
        pageSize: params.pageSize,
        soloActivos: params.soloActivos,
        categoryId: params.categoryId,
        sort: params.sort,
        ord: params.ord,
      }),
    enabled,
    ...sessionListQueryOptions,
  })
}
