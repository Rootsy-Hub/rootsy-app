"use client"

import type { GetPopArticlesTableInput } from "@/app/[siteId]/[popId]/articles/actions"
import {
  popArticlesQueryKey,
  type PopArticlesQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopArticlesTable } from "@/lib/rootsyApi/articlesClient"
import { useQuery } from "@tanstack/react-query"

type UsePopArticlesTableOptions = {
  enabled?: boolean
}

export function usePopArticlesTable(
  popId: string | undefined,
  params: PopArticlesQueryParams,
  options?: UsePopArticlesTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const queryParams: GetPopArticlesTableInput = {
    page: params.page,
    pageSize: params.pageSize,
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
  }

  return useQuery({
    queryKey: popArticlesQueryKey(popId ?? "", params),
    queryFn: () => fetchPopArticlesTable(popId!, queryParams),
    enabled,
    ...sessionListQueryOptions,
  })
}
