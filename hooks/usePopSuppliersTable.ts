"use client"

import { getPopSuppliersTable } from "@/app/[siteId]/[popId]/suppliers/actions"
import { popSuppliersQueryKey } from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { useQuery } from "@tanstack/react-query"

type UsePopSuppliersTableOptions = {
  enabled?: boolean
}

export function usePopSuppliersTable(
  popId: string | undefined,
  options?: UsePopSuppliersTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)

  return useQuery({
    queryKey: popSuppliersQueryKey(popId ?? ""),
    queryFn: () => getPopSuppliersTable(popId!),
    enabled,
    ...sessionListQueryOptions,
  })
}
