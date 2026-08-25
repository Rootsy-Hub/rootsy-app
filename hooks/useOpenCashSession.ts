"use client"

import { cashRegisterOpenSessionQueryKey } from "@/lib/queryKeys"
import { operateOpenSessionQueryOptions } from "@/lib/queryStaleTimes"
import { fetchOpenCashSession } from "@/lib/rootsyApi/cashRegistersClient"
import { useQuery } from "@tanstack/react-query"

type UseOpenCashSessionOptions = {
  enabled?: boolean
}

export function useOpenCashSession(
  popId: string | undefined,
  options?: UseOpenCashSessionOptions,
) {
  return useQuery({
    queryKey: cashRegisterOpenSessionQueryKey(popId ?? ""),
    queryFn: async () => {
      const res = await fetchOpenCashSession(popId!)
      if (!res.success) throw new Error(res.error)
      return res.session
    },
    enabled: Boolean(popId) && (options?.enabled ?? true),
    ...operateOpenSessionQueryOptions,
  })
}
