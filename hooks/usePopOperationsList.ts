"use client"

import {
  getOperationsList,
  type GetOperationsListInput,
  type OperationsListView,
} from "@/app/[siteId]/[popId]/operations/actions"
import {
  popOperationsQueryKey,
  type PopOperationsQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { useQuery } from "@tanstack/react-query"

type UsePopOperationsListOptions = {
  enabled?: boolean
}

export function usePopOperationsList(
  popId: string | undefined,
  params: PopOperationsQueryParams,
  options?: UsePopOperationsListOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const queryParams: GetOperationsListInput = {
    view: params.view as OperationsListView,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    search: params.search,
    page: params.page,
    pageSize: params.pageSize,
    sort: params.sort,
    ord: params.ord,
    fiscalOnly: params.fiscalOnly,
    filters: params.filters,
  }

  return useQuery({
    queryKey: popOperationsQueryKey(popId ?? "", params),
    queryFn: () => getOperationsList(popId!, queryParams),
    enabled,
    ...sessionListQueryOptions,
  })
}
