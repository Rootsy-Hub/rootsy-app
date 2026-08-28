import { parseSuppliersWorkspaceUrl } from "@/app/[siteId]/[popId]/suppliers/workspaceUrl"
import { getDataWorkspaceTableNextPageParam } from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  pinDataWorkspaceTableInfiniteParams,
} from "@/lib/dataWorkspaceTableInfinite"
import { getBrowserQueryClient } from "@/lib/queryClient"
import {
  popSuppliersQueryKey,
  type PopSuppliersQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopSuppliersTable } from "@/lib/rootsyApi/suppliersClient"
import { keepPreviousData, type QueryClient } from "@tanstack/react-query"

export function suppliersTableFromSearch(
  search: string,
): PopSuppliersQueryParams {
  const ws = parseSuppliersWorkspaceUrl(new URLSearchParams(search))
  return pinDataWorkspaceTableInfiniteParams({
    page: ws.page,
    pageSize: ws.pageSize,
    search: ws.q,
    soloActivos: ws.soloActivos,
    withEmail: ws.withEmail,
    withTaxId: ws.withTaxId,
    sort: ws.sort,
    ord: ws.ord,
  })
}

export function suppliersTableInfiniteQueryOptions(
  popId: string,
  params: PopSuppliersQueryParams,
) {
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)
  return {
    queryKey: popSuppliersQueryKey(popId, infiniteParams),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      fetchPopSuppliersTable(popId, {
        page: pageParam,
        pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
        search: infiniteParams.search,
        soloActivos: infiniteParams.soloActivos,
        withEmail: infiniteParams.withEmail,
        withTaxId: infiniteParams.withTaxId,
        sort: infiniteParams.sort,
        ord: infiniteParams.ord,
      }),
    initialPageParam: 1,
    getNextPageParam: getDataWorkspaceTableNextPageParam,
    placeholderData: keepPreviousData,
    ...sessionListQueryOptions,
  }
}

export function prefetchSuppliersWorkspaceQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
  search?: string,
) {
  if (!popId) return Promise.resolve()
  const params = suppliersTableFromSearch(
    search ??
      (typeof window === "undefined"
        ? ""
        : window.location.search.replace(/^\?/, "")),
  )
  return queryClient.prefetchInfiniteQuery(
    suppliersTableInfiniteQueryOptions(popId, params),
  )
}
