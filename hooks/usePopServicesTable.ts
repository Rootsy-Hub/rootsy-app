"use client"

import type { GetPopServicesTableInput } from "@/app/[siteId]/[popId]/services/actions"
import {
  popServicesQueryKey,
  type PopServicesQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopServicesTable } from "@/lib/rootsyApi/servicesClient"
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
  const queryParams: GetPopServicesTableInput = {
    q: params.q,
    page: params.page,
    pageSize: params.pageSize,
    soloActivos: params.soloActivos,
    categoryId: params.categoryId,
    sort: params.sort,
    ord: params.ord,
  }

  return useQuery({
    queryKey: popServicesQueryKey(popId ?? "", params),
    queryFn: () => fetchPopServicesTable(popId!, queryParams),
    enabled,
    ...sessionListQueryOptions,
  })
}
