"use client"

import { popPurchaseOrderDetailQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPurchaseOrderDetail } from "@/lib/rootsyApi/purchaseOrdersClient"
import { useQuery } from "@tanstack/react-query"

type UsePurchaseOrderDetailOptions = {
  enabled?: boolean
}

export function usePurchaseOrderDetail(
  popId: string | undefined,
  orderId: string | undefined,
  options?: UsePurchaseOrderDetailOptions,
) {
  const enabled =
    (options?.enabled ?? true) && Boolean(popId) && Boolean(orderId)

  return useQuery({
    queryKey: popPurchaseOrderDetailQueryKey(popId ?? "", orderId ?? ""),
    queryFn: () => fetchPurchaseOrderDetail(popId!, orderId!),
    enabled,
    ...sessionListQueryOptions,
  })
}
