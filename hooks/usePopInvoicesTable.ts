"use client"

import { getPopInvoicesArcaTable } from "@/app/[siteId]/[popId]/invoices/actions"
import {
  popInvoicesQueryKey,
  type PopInvoicesQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
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

  return useQuery({
    queryKey: popInvoicesQueryKey(popId ?? "", params),
    queryFn: () =>
      getPopInvoicesArcaTable(popId!, {
        q: params.q,
        page: params.page,
        pageSize: params.pageSize,
        status: params.status,
        regimen: params.regimen,
        sort: params.sort,
        ord: params.ord,
      }),
    enabled,
    ...sessionListQueryOptions,
  })
}
