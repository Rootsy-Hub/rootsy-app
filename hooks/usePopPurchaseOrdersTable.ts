"use client"

import { getPurchaseOrdersTable } from "@/app/[siteId]/[popId]/purchase-orders/actions"
import {
  popPurchaseOrdersQueryKey,
  type PopPurchaseOrdersQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { useQuery } from "@tanstack/react-query"

type UsePopPurchaseOrdersTableOptions = {
  enabled?: boolean
}

export function usePopPurchaseOrdersTable(
  popId: string | undefined,
  params: PopPurchaseOrdersQueryParams,
  options?: UsePopPurchaseOrdersTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)

  return useQuery({
    queryKey: popPurchaseOrdersQueryKey(popId ?? "", params),
    queryFn: () =>
      getPurchaseOrdersTable(popId!, {
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
