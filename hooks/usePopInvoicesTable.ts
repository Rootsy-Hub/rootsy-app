"use client"

import type { GetPopInvoicesArcaTableInput } from "@/app/[siteId]/[popId]/invoices/actions"
import {
  popInvoicesQueryKey,
  type PopInvoicesQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopInvoicesTable } from "@/lib/rootsyApi/invoicesClient"
import { useQuery } from "@tanstack/react-query"

type UsePopInvoicesTableOptions = {
  enabled?: boolean
}

export function usePopInvoicesTable(
  popId: string | undefined,
  params: PopInvoicesQueryParams,
  options?: UsePopInvoicesTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const queryParams: GetPopInvoicesArcaTableInput = {
    q: params.q,
    page: params.page,
    pageSize: params.pageSize,
    status: params.status,
    cbteTipo: params.cbteTipo,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    sort: params.sort,
    ord: params.ord,
  }

  return useQuery({
    queryKey: popInvoicesQueryKey(popId ?? "", params),
    queryFn: () => fetchPopInvoicesTable(popId!, queryParams),
    enabled,
    ...sessionListQueryOptions,
  })
}
