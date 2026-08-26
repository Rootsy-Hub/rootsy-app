"use client"

import type { GetPopCurrentAccountPartiesInput } from "@/app/[siteId]/[popId]/current-accounts/actions"
import type {
  CurrentAccountAgingFilter,
  CurrentAccountDirection,
} from "@/lib/currentAccounts"
import {
  concatTableRowKey,
  useDataWorkspaceInfiniteTableQuery,
} from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  pinDataWorkspaceTableInfiniteParams,
} from "@/lib/dataWorkspaceTableInfinite"
import {
  popCurrentAccountPartiesQueryKey,
  type PopCurrentAccountPartiesQueryParams,
} from "@/lib/queryKeys"
import { fetchPopCurrentAccountParties, type PopCurrentAccountPartiesResult } from "@/lib/rootsyApi/currentAccountsClient"

type UsePopCurrentAccountPartiesOptions = {
  enabled?: boolean
}

export function usePopCurrentAccountParties(
  popId: string | undefined,
  params: PopCurrentAccountPartiesQueryParams,
  options?: UsePopCurrentAccountPartiesOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)
  const queryParams: GetPopCurrentAccountPartiesInput = {
    q: params.q,
    page: infiniteParams.page,
    pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
    direction: params.direction as CurrentAccountDirection | "",
    aging: params.aging as CurrentAccountAgingFilter | "",
    sort: params.sort,
    ord: params.ord,
  }

  return useDataWorkspaceInfiniteTableQuery<PopCurrentAccountPartiesResult>({
    queryKey: popCurrentAccountPartiesQueryKey(popId ?? "", infiniteParams),
    enabled,
    queryFn: (page) =>
      fetchPopCurrentAccountParties(popId!, { ...queryParams, page }),
    concat: concatTableRowKey<PopCurrentAccountPartiesResult, "parties">("parties"),
  })
}
