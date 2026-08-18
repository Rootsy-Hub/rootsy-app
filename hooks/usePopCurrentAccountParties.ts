"use client"

import { getPopCurrentAccountParties } from "@/app/[siteId]/[popId]/current-accounts/actions"
import type {
  CurrentAccountAgingFilter,
  CurrentAccountDirection,
} from "@/lib/currentAccounts"
import {
  popCurrentAccountPartiesQueryKey,
  type PopCurrentAccountPartiesQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
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

  return useQuery({
    queryKey: popCurrentAccountPartiesQueryKey(popId ?? "", params),
    queryFn: () =>
      getPopCurrentAccountParties(popId!, {
        q: params.q,
        page: params.page,
        pageSize: params.pageSize,
        direction: params.direction as CurrentAccountDirection | "",
        aging: params.aging as CurrentAccountAgingFilter | "",
        sort: params.sort,
        ord: params.ord,
      }),
    enabled,
    ...sessionListQueryOptions,
  })
}
