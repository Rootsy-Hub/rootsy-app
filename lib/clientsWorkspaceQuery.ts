import { parseClientsWorkspaceUrl } from "@/app/[siteId]/[popId]/clients/workspaceUrl"
import { getDataWorkspaceTableNextPageParam } from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  pinDataWorkspaceTableInfiniteParams,
} from "@/lib/dataWorkspaceTableInfinite"
import { getBrowserQueryClient } from "@/lib/queryClient"
import {
  popClientsQueryKey,
  type PopClientsQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopClientsTable } from "@/lib/rootsyApi/clientsClient"
import { keepPreviousData, type QueryClient } from "@tanstack/react-query"

export function clientsTableFromSearch(search: string): PopClientsQueryParams {
  const ws = parseClientsWorkspaceUrl(new URLSearchParams(search))
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

export function clientsTableInfiniteQueryOptions(
  popId: string,
  params: PopClientsQueryParams,
) {
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)
  return {
    queryKey: popClientsQueryKey(popId, infiniteParams),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      fetchPopClientsTable(popId, {
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

export function prefetchClientsWorkspaceQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
  search?: string,
) {
  if (!popId) return Promise.resolve()
  const params = clientsTableFromSearch(
    search ??
      (typeof window === "undefined"
        ? ""
        : window.location.search.replace(/^\?/, "")),
  )
  return queryClient.prefetchInfiniteQuery(
    clientsTableInfiniteQueryOptions(popId, params),
  )
}
