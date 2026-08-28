import { parseRecipesWorkspaceUrl } from "@/app/[siteId]/[popId]/recipes/workspaceUrl"
import { getDataWorkspaceTableNextPageParam } from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  pinDataWorkspaceTableInfiniteParams,
} from "@/lib/dataWorkspaceTableInfinite"
import { getBrowserQueryClient } from "@/lib/queryClient"
import {
  popRecipesQueryKey,
  type PopRecipesQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopRecipesTable } from "@/lib/rootsyApi/recipesClient"
import { keepPreviousData, type QueryClient } from "@tanstack/react-query"

export function recipesTableFromSearch(search: string): PopRecipesQueryParams {
  const ws = parseRecipesWorkspaceUrl(new URLSearchParams(search))
  return pinDataWorkspaceTableInfiniteParams({
    q: ws.q,
    page: ws.page,
    pageSize: ws.pageSize,
    soloActivos: ws.soloActivos,
    categoryId: ws.categoryId,
    sort: ws.sort,
    ord: ws.ord,
  })
}

export function recipesTableInfiniteQueryOptions(
  popId: string,
  params: PopRecipesQueryParams,
) {
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)
  return {
    queryKey: popRecipesQueryKey(popId, infiniteParams),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      fetchPopRecipesTable(popId, {
        q: infiniteParams.q,
        page: pageParam,
        pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
        soloActivos: infiniteParams.soloActivos,
        categoryId: infiniteParams.categoryId,
        sort: infiniteParams.sort,
        ord: infiniteParams.ord,
      }),
    initialPageParam: 1,
    getNextPageParam: getDataWorkspaceTableNextPageParam,
    placeholderData: keepPreviousData,
    ...sessionListQueryOptions,
  }
}

export function prefetchRecipesWorkspaceQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
  search?: string,
) {
  if (!popId) return Promise.resolve()
  const params = recipesTableFromSearch(
    search ??
      (typeof window === "undefined"
        ? ""
        : window.location.search.replace(/^\?/, "")),
  )
  return queryClient.prefetchInfiniteQuery(
    recipesTableInfiniteQueryOptions(popId, params),
  )
}
