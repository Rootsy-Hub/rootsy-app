import { computeDataWorkspaceDateBounds } from "@/lib/dataWorkspaceDateFilter"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  nextDataWorkspaceTablePage,
} from "@/lib/dataWorkspaceTableInfinite"
import { getBrowserQueryClient } from "@/lib/queryClient"
import { popAuditQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopAuditEvents } from "@/lib/rootsyApi/auditClient"
import { keepPreviousData, type QueryClient } from "@tanstack/react-query"

export type AuditWorkspaceQueryParams = {
  page: number
  pageSize: number
  q: string
  from: string | null
  to: string | null
  action: string
  source: string
}

export function defaultAuditWorkspaceParams(): AuditWorkspaceQueryParams {
  const bounds = computeDataWorkspaceDateBounds("this_month", undefined)
  return {
    page: 1,
    pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
    q: "",
    from: bounds.from,
    to: bounds.to,
    action: "",
    source: "",
  }
}

export function auditInfiniteQueryOptions(
  popId: string,
  params: AuditWorkspaceQueryParams,
  filters?: { actions?: string[]; sources?: string[] },
) {
  return {
    queryKey: popAuditQueryKey(popId, params),
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const page = typeof pageParam === "number" ? pageParam : 1
      const res = await fetchPopAuditEvents(popId, {
        page,
        pageSize: params.pageSize,
        q: params.q || undefined,
        from: params.from,
        to: params.to,
        action: filters?.actions,
        source: filters?.sources,
      })
      if (!res.success) throw new Error(res.error)
      return res
    },
    initialPageParam: params.page,
    getNextPageParam: (lastPage: {
      page: number
      total: number
      pageSize: number
    }) =>
      nextDataWorkspaceTablePage(lastPage.page, lastPage.total, lastPage.pageSize),
    placeholderData: keepPreviousData,
    ...sessionListQueryOptions,
  }
}

export function prefetchAuditWorkspaceQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
) {
  if (!popId) return Promise.resolve()
  const params = defaultAuditWorkspaceParams()
  return queryClient.prefetchInfiniteQuery(
    auditInfiniteQueryOptions(popId, params, { actions: [], sources: [] }),
  )
}
