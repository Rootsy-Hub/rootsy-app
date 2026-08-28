"use client"

import type { GetPopArticlesTableInput } from "@/app/[siteId]/[popId]/articles/actions"
import {
  concatTableRowKey,
  useDataWorkspaceInfiniteTableQuery,
} from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  dataWorkspaceTableStartPage,
  pinDataWorkspaceTableInfiniteParams,
} from "@/lib/dataWorkspaceTableInfinite"
import {
  popArticlesQueryKey,
  type PopArticlesQueryParams,
} from "@/lib/queryKeys"
import { fetchPopArticlesTable, type PopArticlesTableResult } from "@/lib/rootsyApi/articlesClient"

type UsePopArticlesTableOptions = {
  enabled?: boolean
}

export function usePopArticlesTable(
  popId: string | undefined,
  params: PopArticlesQueryParams,
  options?: UsePopArticlesTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const startPage = dataWorkspaceTableStartPage(params.page)
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)

  return useDataWorkspaceInfiniteTableQuery<PopArticlesTableResult>({
    queryKey: popArticlesQueryKey(popId ?? "", {
      ...infiniteParams,
      page: startPage,
    }),
    enabled,
    initialPageParam: startPage,
    queryFn: (page) =>
      fetchPopArticlesTable(popId!, {
        page,
        pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
        search: params.search,
        soloActivos: params.soloActivos,
        soloInactivos: params.soloInactivos,
        conDescuento: params.conDescuento,
        sinDescuento: params.sinDescuento,
        conStock: params.conStock,
        sinStock: params.sinStock,
        stockNegativo: params.stockNegativo,
        ventaSinStock: params.ventaSinStock,
        categoryId: params.categoryId,
        itemKinds: params.itemKinds as GetPopArticlesTableInput["itemKinds"],
        sort: params.sort,
        ord: params.ord,
      }),
    concat: concatTableRowKey<PopArticlesTableResult, "articles">("articles"),
  })
}
