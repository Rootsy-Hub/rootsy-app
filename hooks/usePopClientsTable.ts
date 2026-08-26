"use client"

import type { GetPopClientsTableInput } from "@/app/[siteId]/[popId]/clients/actions"
import {
  concatTableRowKey,
  useDataWorkspaceInfiniteTableQuery,
} from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  pinDataWorkspaceTableInfiniteParams,
} from "@/lib/dataWorkspaceTableInfinite"
import {
  popClientsQueryKey,
  type PopClientsQueryParams,
} from "@/lib/queryKeys"
import { fetchPopClientsTable, type PopClientsTableResult } from "@/lib/rootsyApi/clientsClient"

type UsePopClientsTableOptions = {
  enabled?: boolean
}

export function usePopClientsTable(
  popId: string | undefined,
  params: PopClientsQueryParams,
  options?: UsePopClientsTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)
  const queryParams: GetPopClientsTableInput = {
    page: infiniteParams.page,
    pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
    search: params.search,
    soloActivos: params.soloActivos,
    withEmail: params.withEmail,
    withTaxId: params.withTaxId,
    sort: params.sort,
    ord: params.ord,
  }

  return useDataWorkspaceInfiniteTableQuery<PopClientsTableResult>({
    queryKey: popClientsQueryKey(popId ?? "", infiniteParams),
    enabled,
    queryFn: (page) =>
      fetchPopClientsTable(popId!, { ...queryParams, page }),
    concat: concatTableRowKey<PopClientsTableResult, "clients">("clients"),
  })
}
