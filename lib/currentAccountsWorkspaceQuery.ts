import { parseCurrentAccountsWorkspaceUrl } from "@/app/[siteId]/[popId]/current-accounts/workspaceUrl"
import type {
  CurrentAccountAgingFilter,
  CurrentAccountDirection,
} from "@/lib/currentAccounts"
import { getDataWorkspaceTableNextPageParam } from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  pinDataWorkspaceTableInfiniteParams,
} from "@/lib/dataWorkspaceTableInfinite"
import { getBrowserQueryClient } from "@/lib/queryClient"
import {
  popCurrentAccountPartiesQueryKey,
  type PopCurrentAccountPartiesQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopCurrentAccountParties } from "@/lib/rootsyApi/currentAccountsClient"
import { keepPreviousData, type QueryClient } from "@tanstack/react-query"

export function currentAccountPartiesFromSearch(
  search: string,
): PopCurrentAccountPartiesQueryParams {
  const ws = parseCurrentAccountsWorkspaceUrl(new URLSearchParams(search))
  return pinDataWorkspaceTableInfiniteParams({
    q: ws.q,
    page: ws.page,
    pageSize: ws.pageSize,
    direction: ws.direction,
    aging: ws.aging,
    sort: ws.sort,
    ord: ws.ord,
  })
}

export function currentAccountPartiesInfiniteQueryOptions(
  popId: string,
  params: PopCurrentAccountPartiesQueryParams,
) {
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)
  return {
    queryKey: popCurrentAccountPartiesQueryKey(popId, infiniteParams),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      fetchPopCurrentAccountParties(popId, {
        q: infiniteParams.q,
        page: pageParam,
        pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
        direction: infiniteParams.direction as CurrentAccountDirection | "",
        aging: infiniteParams.aging as CurrentAccountAgingFilter | "",
        sort: infiniteParams.sort ?? undefined,
        ord: infiniteParams.ord,
      }),
    initialPageParam: 1,
    getNextPageParam: getDataWorkspaceTableNextPageParam,
    placeholderData: keepPreviousData,
    ...sessionListQueryOptions,
  }
}

export function prefetchCurrentAccountsWorkspaceQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
  search?: string,
) {
  if (!popId) return Promise.resolve()
  const params = currentAccountPartiesFromSearch(
    search ??
      (typeof window === "undefined"
        ? ""
        : window.location.search.replace(/^\?/, "")),
  )
  return queryClient.prefetchInfiniteQuery(
    currentAccountPartiesInfiniteQueryOptions(popId, params),
  )
}
