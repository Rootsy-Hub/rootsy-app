import {
  articlesModalFiltersFromWorkspace,
  parseArticlesWorkspaceUrl,
} from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import { getDataWorkspaceTableNextPageParam } from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  dataWorkspaceTableStartPage,
  pinDataWorkspaceTableInfiniteParams,
} from "@/lib/dataWorkspaceTableInfinite"
import { getBrowserQueryClient } from "@/lib/queryClient"
import {
  popArticlesQueryKey,
  type PopArticlesQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import type { ArticleItemKind } from "@/lib/articleItemKind"
import { fetchPopArticlesTable } from "@/lib/rootsyApi/articlesClient"
import { keepPreviousData, type QueryClient } from "@tanstack/react-query"

export function articlesTableFromSearch(search: string): PopArticlesQueryParams {
  const ws = parseArticlesWorkspaceUrl(new URLSearchParams(search))
  return {
    page: ws.page,
    pageSize: ws.pageSize,
    search: ws.q,
    ...articlesModalFiltersFromWorkspace(ws),
    categoryId: ws.categoryId,
    itemKinds: ws.itemKinds,
    sort: ws.sort,
    ord: ws.ord,
  }
}

export function articlesTableInfiniteQueryOptions(
  popId: string,
  params: PopArticlesQueryParams,
) {
  const startPage = dataWorkspaceTableStartPage(params.page)
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)
  const keyed = { ...infiniteParams, page: startPage }
  return {
    queryKey: popArticlesQueryKey(popId, keyed),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      fetchPopArticlesTable(popId, {
        page: pageParam,
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
        itemKinds: params.itemKinds as ArticleItemKind[],
        sort: params.sort,
        ord: params.ord,
      }),
    initialPageParam: startPage,
    getNextPageParam: getDataWorkspaceTableNextPageParam,
    placeholderData: keepPreviousData,
    ...sessionListQueryOptions,
  }
}

export function prefetchArticlesWorkspaceQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
  search?: string,
) {
  if (!popId) return Promise.resolve()
  const params = articlesTableFromSearch(
    search ??
      (typeof window === "undefined"
        ? ""
        : window.location.search.replace(/^\?/, "")),
  )
  return queryClient.prefetchInfiniteQuery(
    articlesTableInfiniteQueryOptions(popId, params),
  )
}
