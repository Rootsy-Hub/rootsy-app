"use client"

import { popInvoicesFormContextQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchInvoiceFormContext } from "@/lib/rootsyApi/invoicesClient"
import { useQuery } from "@tanstack/react-query"

type UseInvoiceFormContextOptions = {
  enabled?: boolean
}

export function useInvoiceFormContext(
  popId: string | undefined,
  options?: UseInvoiceFormContextOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)

  return useQuery({
    queryKey: popInvoicesFormContextQueryKey(popId ?? ""),
    queryFn: () => fetchInvoiceFormContext(popId!),
    enabled,
    ...sessionListQueryOptions,
  })
}
