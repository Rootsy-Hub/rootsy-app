"use client"

import type { GetPurchaseOrdersTableInput } from "@/app/[siteId]/[popId]/purchase-orders/actions"
import {
  concatTableRowKey,
  useDataWorkspaceInfiniteTableQuery,
} from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  pinDataWorkspaceTableInfiniteParams,
} from "@/lib/dataWorkspaceTableInfinite"
import {
  popPurchaseOrdersQueryKey,
  type PopPurchaseOrdersQueryParams,
} from "@/lib/queryKeys"
import { fetchPopPurchaseOrdersTable, type PopPurchaseOrdersTableResult } from "@/lib/rootsyApi/purchaseOrdersClient"

type UsePopPurchaseOrdersTableOptions = {
  enabled?: boolean
}

export function usePopPurchaseOrdersTable(
  popId: string | undefined,
  params: PopPurchaseOrdersQueryParams,
  options?: UsePopPurchaseOrdersTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)
  const queryParams: GetPurchaseOrdersTableInput = {
    page: infiniteParams.page,
    pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
    q: params.q,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  }

  return useDataWorkspaceInfiniteTableQuery<PopPurchaseOrdersTableResult>({
    queryKey: popPurchaseOrdersQueryKey(popId ?? "", infiniteParams),
    enabled,
    queryFn: (page) =>
      fetchPopPurchaseOrdersTable(popId!, { ...queryParams, page }),
    concat: concatTableRowKey<PopPurchaseOrdersTableResult, "rows">("rows"),
  })
}
