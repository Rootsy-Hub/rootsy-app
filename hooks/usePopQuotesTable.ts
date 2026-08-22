"use client"

import type { GetSaleQuotesTableInput } from "@/app/[siteId]/[popId]/quotes/actions"
import {
  popQuotesQueryKey,
  type PopQuotesQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopQuotesTable } from "@/lib/rootsyApi/quotesClient"
import { useQuery } from "@tanstack/react-query"

type UsePopQuotesTableOptions = {
  enabled?: boolean
}

export function usePopQuotesTable(
  popId: string | undefined,
  params: PopQuotesQueryParams,
  options?: UsePopQuotesTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const queryParams: GetSaleQuotesTableInput = {
    page: params.page,
    pageSize: params.pageSize,
    q: params.q,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  }

  return useQuery({
    queryKey: popQuotesQueryKey(popId ?? "", params),
    queryFn: () => fetchPopQuotesTable(popId!, queryParams),
    enabled,
    ...sessionListQueryOptions,
  })
}
