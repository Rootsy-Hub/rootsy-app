"use client"

import type { GetPopRecipesTableInput } from "@/app/[siteId]/[popId]/recipes/actions"
import {
  concatTableRowKey,
  useDataWorkspaceInfiniteTableQuery,
} from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  pinDataWorkspaceTableInfiniteParams,
} from "@/lib/dataWorkspaceTableInfinite"
import {
  popRecipesQueryKey,
  type PopRecipesQueryParams,
} from "@/lib/queryKeys"
import { fetchPopRecipesTable, type PopRecipesTableResult } from "@/lib/rootsyApi/recipesClient"

type UsePopRecipesTableOptions = {
  enabled?: boolean
}

export function usePopRecipesTable(
  popId: string | undefined,
  params: PopRecipesQueryParams,
  options?: UsePopRecipesTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)
  const queryParams: GetPopRecipesTableInput = {
    q: params.q,
    page: infiniteParams.page,
    pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
    soloActivos: params.soloActivos,
    categoryId: params.categoryId,
    sort: params.sort,
    ord: params.ord,
  }

  return useDataWorkspaceInfiniteTableQuery<PopRecipesTableResult>({
    queryKey: popRecipesQueryKey(popId ?? "", infiniteParams),
    enabled,
    queryFn: (page) =>
      fetchPopRecipesTable(popId!, { ...queryParams, page }),
    concat: concatTableRowKey<PopRecipesTableResult, "recipes">("recipes"),
  })
}
