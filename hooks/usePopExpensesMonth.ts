"use client"

import { popExpensesQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopExpensesMonth } from "@/lib/rootsyApi/expensesClient"
import { useQuery } from "@tanstack/react-query"

type UsePopExpensesMonthOptions = {
  enabled?: boolean
}

export function usePopExpensesMonth(
  popId: string | undefined,
  year: number,
  month1: number,
  options?: UsePopExpensesMonthOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)

  return useQuery({
    queryKey: popExpensesQueryKey(popId ?? "", year, month1),
    queryFn: () => fetchPopExpensesMonth(popId!, year, month1),
    enabled,
    ...sessionListQueryOptions,
  })
}
