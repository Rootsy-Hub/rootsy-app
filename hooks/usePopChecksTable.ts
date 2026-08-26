"use client"

import type { GetPopChecksTableInput } from "@/app/[siteId]/[popId]/checks/actions"
import type { CheckDirection, CheckStatus } from "@/lib/checkDocuments"
import {
  concatTableRowKey,
  useDataWorkspaceInfiniteTableQuery,
} from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  pinDataWorkspaceTableInfiniteParams,
} from "@/lib/dataWorkspaceTableInfinite"
import {
  popChecksQueryKey,
  type PopChecksQueryParams,
} from "@/lib/queryKeys"
import { fetchPopChecksTable, type PopChecksTableResult } from "@/lib/rootsyApi/checksClient"

type UsePopChecksTableOptions = {
  enabled?: boolean
}

export function usePopChecksTable(
  popId: string | undefined,
  params: PopChecksQueryParams,
  options?: UsePopChecksTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)
  const queryParams: GetPopChecksTableInput = {
    q: params.q,
    page: infiniteParams.page,
    pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
    direction: params.direction as CheckDirection | "",
    status: params.status as CheckStatus | "",
    sort: params.sort,
    ord: params.ord,
  }

  return useDataWorkspaceInfiniteTableQuery<PopChecksTableResult>({
    queryKey: popChecksQueryKey(popId ?? "", infiniteParams),
    enabled,
    queryFn: (page) =>
      fetchPopChecksTable(popId!, { ...queryParams, page }),
    concat: concatTableRowKey<PopChecksTableResult, "checks">("checks"),
  })
}
