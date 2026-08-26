"use client"

import type { GetPopServicesTableInput } from "@/app/[siteId]/[popId]/services/actions"
import {
  concatTableRowKey,
  useDataWorkspaceInfiniteTableQuery,
} from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  pinDataWorkspaceTableInfiniteParams,
} from "@/lib/dataWorkspaceTableInfinite"
import {
  popServicesQueryKey,
  type PopServicesQueryParams,
} from "@/lib/queryKeys"
import { fetchPopServicesTable, type PopServicesTableResult } from "@/lib/rootsyApi/servicesClient"

type UsePopServicesTableOptions = {
  enabled?: boolean
}

export function usePopServicesTable(
  popId: string | undefined,
  params: PopServicesQueryParams,
  options?: UsePopServicesTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)
  const queryParams: GetPopServicesTableInput = {
    q: params.q,
    page: infiniteParams.page,
    pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
    soloActivos: params.soloActivos,
    categoryId: params.categoryId,
    sort: params.sort,
    ord: params.ord,
  }

  return useDataWorkspaceInfiniteTableQuery<PopServicesTableResult>({
    queryKey: popServicesQueryKey(popId ?? "", infiniteParams),
    enabled,
    queryFn: (page) =>
      fetchPopServicesTable(popId!, { ...queryParams, page }),
    concat: concatTableRowKey<PopServicesTableResult, "services">("services"),
  })
}
