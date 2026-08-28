import {
  parseExpensesWorkspaceUrl,
  type ExpensesWorkspaceUrlState,
} from "@/app/[siteId]/[popId]/expenses/workspaceUrl"
import { getBrowserQueryClient } from "@/lib/queryClient"
import { popExpensesQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopExpensesMonth } from "@/lib/rootsyApi/expensesClient"
import { keepPreviousData, type QueryClient } from "@tanstack/react-query"

export function expensesMonthFromSearch(search: string): ExpensesWorkspaceUrlState {
  return parseExpensesWorkspaceUrl(new URLSearchParams(search))
}

export function expensesMonthQueryOptions(
  popId: string,
  year: number,
  month1: number,
) {
  return {
    queryKey: popExpensesQueryKey(popId, year, month1),
    queryFn: () => fetchPopExpensesMonth(popId, year, month1),
    placeholderData: keepPreviousData,
    ...sessionListQueryOptions,
  }
}

export function prefetchExpensesWorkspaceQuery(
  popId: string,
  queryClient: QueryClient = getBrowserQueryClient(),
  month?: ExpensesWorkspaceUrlState,
) {
  if (!popId) return Promise.resolve()
  const next =
    month ??
    expensesMonthFromSearch(
      typeof window === "undefined" ? "" : window.location.search.replace(/^\?/, ""),
    )
  return queryClient.prefetchQuery(
    expensesMonthQueryOptions(popId, next.year, next.month1),
  )
}
