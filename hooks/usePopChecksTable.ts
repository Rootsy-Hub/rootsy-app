"use client"

import type { GetPopChecksTableInput } from "@/app/[siteId]/[popId]/checks/actions"
import type { CheckDirection, CheckStatus } from "@/lib/checkDocuments"
import {
  popChecksQueryKey,
  type PopChecksQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopChecksTable } from "@/lib/rootsyApi/checksClient"
import { useQuery } from "@tanstack/react-query"

type UsePopChecksTableOptions = {
  enabled?: boolean
}

export function usePopChecksTable(
  popId: string | undefined,
  params: PopChecksQueryParams,
  options?: UsePopChecksTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const queryParams: GetPopChecksTableInput = {
    q: params.q,
    page: params.page,
    pageSize: params.pageSize,
    direction: params.direction as CheckDirection | "",
    status: params.status as CheckStatus | "",
    sort: params.sort,
    ord: params.ord,
  }

  return useQuery({
    queryKey: popChecksQueryKey(popId ?? "", params),
    queryFn: () => fetchPopChecksTable(popId!, queryParams),
    enabled,
    ...sessionListQueryOptions,
  })
}
