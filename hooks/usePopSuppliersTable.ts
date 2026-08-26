"use client"

import type { GetPopSuppliersTableInput } from "@/app/[siteId]/[popId]/suppliers/actions"
import {
  concatTableRowKey,
  useDataWorkspaceInfiniteTableQuery,
} from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  pinDataWorkspaceTableInfiniteParams,
} from "@/lib/dataWorkspaceTableInfinite"
import {
  popSuppliersQueryKey,
  type PopSuppliersQueryParams,
} from "@/lib/queryKeys"
import { fetchPopSuppliersTable, type PopSuppliersTableResult } from "@/lib/rootsyApi/suppliersClient"

type UsePopSuppliersTableOptions = {
  enabled?: boolean
}

export function usePopSuppliersTable(
  popId: string | undefined,
  params: PopSuppliersQueryParams,
  options?: UsePopSuppliersTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)
  const queryParams: GetPopSuppliersTableInput = {
    page: infiniteParams.page,
    pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
    search: params.search,
    soloActivos: params.soloActivos,
    withEmail: params.withEmail,
    withTaxId: params.withTaxId,
    sort: params.sort,
    ord: params.ord,
  }

  return useDataWorkspaceInfiniteTableQuery<PopSuppliersTableResult>({
    queryKey: popSuppliersQueryKey(popId ?? "", infiniteParams),
    enabled,
    queryFn: (page) =>
      fetchPopSuppliersTable(popId!, { ...queryParams, page }),
    concat: concatTableRowKey<PopSuppliersTableResult, "suppliers">("suppliers"),
  })
}
