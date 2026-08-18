"use client"

import { getPopServicesTable } from "@/app/[siteId]/[popId]/services/actions"
import {
  popServicesQueryKey,
  type PopServicesQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { useQuery } from "@tanstack/react-query"

type UsePopServicesTableOptions = {
  enabled?: boolean
}

export function usePopServicesTable(
  popId: string | undefined,
  params: PopServicesQueryParams,
  options?: UsePopServicesTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)

  return useQuery({
    queryKey: popServicesQueryKey(popId ?? "", params),
    queryFn: () =>
      getPopServicesTable(popId!, {
        q: params.q,
        page: params.page,
        pageSize: params.pageSize,
        soloActivos: params.soloActivos,
        categoryId: params.categoryId,
        sort: params.sort,
        ord: params.ord,
      }),
    enabled,
    ...sessionListQueryOptions,
  })
}
