"use client"

import { expensesMonthQueryOptions } from "@/lib/expensesWorkspaceQuery"
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
    ...expensesMonthQueryOptions(popId ?? "", year, month1),
    enabled,
  })
}
