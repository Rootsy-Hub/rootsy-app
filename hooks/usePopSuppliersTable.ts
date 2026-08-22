"use client"

import type { GetPopSuppliersTableInput } from "@/app/[siteId]/[popId]/suppliers/actions"
import {
  popSuppliersQueryKey,
  type PopSuppliersQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopSuppliersTable } from "@/lib/rootsyApi/suppliersClient"
import { useQuery } from "@tanstack/react-query"

type UsePopSuppliersTableOptions = {
  enabled?: boolean
}

export function usePopSuppliersTable(
  popId: string | undefined,
  params: PopSuppliersQueryParams,
  options?: UsePopSuppliersTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const queryParams: GetPopSuppliersTableInput = {
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    soloActivos: params.soloActivos,
    withEmail: params.withEmail,
    withTaxId: params.withTaxId,
    sort: params.sort,
    ord: params.ord,
  }

  return useQuery({
    queryKey: popSuppliersQueryKey(popId ?? "", params),
    queryFn: () => fetchPopSuppliersTable(popId!, queryParams),
    enabled,
    ...sessionListQueryOptions,
  })
}
