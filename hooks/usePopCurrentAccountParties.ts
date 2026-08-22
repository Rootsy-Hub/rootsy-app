"use client"

import type { GetPopCurrentAccountPartiesInput } from "@/app/[siteId]/[popId]/current-accounts/actions"
import type {
  CurrentAccountAgingFilter,
  CurrentAccountDirection,
} from "@/lib/currentAccounts"
import {
  popCurrentAccountPartiesQueryKey,
  type PopCurrentAccountPartiesQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopCurrentAccountParties } from "@/lib/rootsyApi/currentAccountsClient"
import { useQuery } from "@tanstack/react-query"

type UsePopCurrentAccountPartiesOptions = {
  enabled?: boolean
}

export function usePopCurrentAccountParties(
  popId: string | undefined,
  params: PopCurrentAccountPartiesQueryParams,
  options?: UsePopCurrentAccountPartiesOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const queryParams: GetPopCurrentAccountPartiesInput = {
    q: params.q,
    page: params.page,
    pageSize: params.pageSize,
    direction: params.direction as CurrentAccountDirection | "",
    aging: params.aging as CurrentAccountAgingFilter | "",
    sort: params.sort,
    ord: params.ord,
  }

  return useQuery({
    queryKey: popCurrentAccountPartiesQueryKey(popId ?? "", params),
    queryFn: () => fetchPopCurrentAccountParties(popId!, queryParams),
    enabled,
    ...sessionListQueryOptions,
  })
}
