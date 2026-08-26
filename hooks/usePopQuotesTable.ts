"use client"

import type { GetSaleQuotesTableInput } from "@/app/[siteId]/[popId]/quotes/actions"
import {
  concatTableRowKey,
  useDataWorkspaceInfiniteTableQuery,
} from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  pinDataWorkspaceTableInfiniteParams,
} from "@/lib/dataWorkspaceTableInfinite"
import {
  popQuotesQueryKey,
  type PopQuotesQueryParams,
} from "@/lib/queryKeys"
import { fetchPopQuotesTable, type PopQuotesTableResult } from "@/lib/rootsyApi/quotesClient"

type UsePopQuotesTableOptions = {
  enabled?: boolean
}

export function usePopQuotesTable(
  popId: string | undefined,
  params: PopQuotesQueryParams,
  options?: UsePopQuotesTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)
  const queryParams: GetSaleQuotesTableInput = {
    page: infiniteParams.page,
    pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
    q: params.q,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  }

  return useDataWorkspaceInfiniteTableQuery<PopQuotesTableResult>({
    queryKey: popQuotesQueryKey(popId ?? "", infiniteParams),
    enabled,
    queryFn: (page) =>
      fetchPopQuotesTable(popId!, { ...queryParams, page }),
    concat: concatTableRowKey<PopQuotesTableResult, "rows">("rows"),
  })
}
