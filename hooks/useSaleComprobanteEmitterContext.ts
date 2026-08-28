"use client"

import { getPopComprobanteEmitterPreview } from "@/app/[siteId]/[popId]/sale/comprobantePreviewActions"
import { saleComprobanteEmitterQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { useQuery } from "@tanstack/react-query"

export function useSaleComprobanteEmitterContext(
  popId: string,
  open: boolean,
  cashRegisterId?: string | null,
) {
  const query = useQuery({
    queryKey: saleComprobanteEmitterQueryKey(popId, cashRegisterId),
    queryFn: async () => {
      const res = await getPopComprobanteEmitterPreview(popId, cashRegisterId)
      if (!res.success) {
        throw new Error(res.error)
      }
      return res.emitter
    },
    enabled: open && Boolean(popId),
    ...sessionListQueryOptions,
  })

  return {
    emitter: query.data ?? null,
    loading: query.isLoading,
    error:
      query.error instanceof Error
        ? query.error.message
        : query.error
          ? String(query.error)
          : null,
  }
}
