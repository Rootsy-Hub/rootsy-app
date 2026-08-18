"use client"

import { getSaleQuotesTable } from "@/app/[siteId]/[popId]/quotes/actions"
import {
  popQuotesQueryKey,
  type PopQuotesQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
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

  return useQuery({
    queryKey: popQuotesQueryKey(popId ?? "", params),
    queryFn: () =>
      getSaleQuotesTable(popId!, {
        page: params.page,
        pageSize: params.pageSize,
        q: params.q,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
      }),
    enabled,
    ...sessionListQueryOptions,
  })
}
