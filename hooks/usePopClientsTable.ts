"use client"

import type { GetPopClientsTableInput } from "@/app/[siteId]/[popId]/clients/actions"
import {
  popClientsQueryKey,
  type PopClientsQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopClientsTable } from "@/lib/rootsyApi/clientsClient"
import { useQuery } from "@tanstack/react-query"

type UsePopClientsTableOptions = {
  enabled?: boolean
}

export function usePopClientsTable(
  popId: string | undefined,
  params: PopClientsQueryParams,
  options?: UsePopClientsTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const queryParams: GetPopClientsTableInput = {
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
    queryKey: popClientsQueryKey(popId ?? "", params),
    queryFn: () => fetchPopClientsTable(popId!, queryParams),
    enabled,
    ...sessionListQueryOptions,
  })
}
