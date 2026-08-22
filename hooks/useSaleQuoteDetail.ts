"use client"

import { popQuoteDetailQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchSaleQuoteDetail } from "@/lib/rootsyApi/quotesClient"
import { useQuery } from "@tanstack/react-query"

type UseSaleQuoteDetailOptions = {
  enabled?: boolean
}

export function useSaleQuoteDetail(
  popId: string | undefined,
  quoteId: string | undefined,
  options?: UseSaleQuoteDetailOptions,
) {
  const enabled =
    (options?.enabled ?? true) && Boolean(popId) && Boolean(quoteId)

  return useQuery({
    queryKey: popQuoteDetailQueryKey(popId ?? "", quoteId ?? ""),
    queryFn: () => fetchSaleQuoteDetail(popId!, quoteId!),
    enabled,
    ...sessionListQueryOptions,
  })
}
