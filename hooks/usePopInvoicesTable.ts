"use client"

import type { GetPopInvoicesArcaTableInput } from "@/app/[siteId]/[popId]/invoices/actions"
import {
  concatTableRowKey,
  useDataWorkspaceInfiniteTableQuery,
} from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  pinDataWorkspaceTableInfiniteParams,
} from "@/lib/dataWorkspaceTableInfinite"
import {
  popInvoicesQueryKey,
  type PopInvoicesQueryParams,
} from "@/lib/queryKeys"
import { fetchPopInvoicesTable, type PopInvoicesTableResult } from "@/lib/rootsyApi/invoicesClient"

type UsePopInvoicesTableOptions = {
  enabled?: boolean
}

export function usePopInvoicesTable(
  popId: string | undefined,
  params: PopInvoicesQueryParams,
  options?: UsePopInvoicesTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)
  const queryParams: GetPopInvoicesArcaTableInput = {
    q: params.q,
    page: infiniteParams.page,
    pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
    status: params.status,
    cbteTipo: params.cbteTipo,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    sort: params.sort,
    ord: params.ord,
  }

  return useDataWorkspaceInfiniteTableQuery<PopInvoicesTableResult>({
    queryKey: popInvoicesQueryKey(popId ?? "", infiniteParams),
    enabled,
    queryFn: (page) =>
      fetchPopInvoicesTable(popId!, { ...queryParams, page }),
    concat: concatTableRowKey<PopInvoicesTableResult, "invoices">("invoices"),
  })
}
