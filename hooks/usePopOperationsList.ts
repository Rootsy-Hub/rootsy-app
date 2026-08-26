"use client"

import type {
  GetOperationsListInput,
  GetOperationsListResult,
  OperationsListView,
} from "@/app/[siteId]/[popId]/operations/actions"
import { useDataWorkspaceInfiniteTableQuery } from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  pinDataWorkspaceTableInfiniteParams,
  uniqueTableRowsById,
} from "@/lib/dataWorkspaceTableInfinite"
import {
  popOperationsQueryKey,
  type PopOperationsQueryParams,
} from "@/lib/queryKeys"
import { fetchPopOperationsList } from "@/lib/rootsyApi/operationsClient"

type UsePopOperationsListOptions = {
  enabled?: boolean
}

export function usePopOperationsList(
  popId: string | undefined,
  params: PopOperationsQueryParams,
  options?: UsePopOperationsListOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)
  const queryParams: GetOperationsListInput = {
    view: params.view as OperationsListView,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    search: params.search,
    page: infiniteParams.page,
    pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
    sort: params.sort,
    ord: params.ord,
    fiscalOnly: params.fiscalOnly,
    filters: params.filters,
  }

  return useDataWorkspaceInfiniteTableQuery<GetOperationsListResult>({
    queryKey: popOperationsQueryKey(popId ?? "", infiniteParams),
    enabled,
    queryFn: (page) =>
      fetchPopOperationsList(popId!, { ...queryParams, page }),
    concat: (acc, page) => ({
      ...acc,
      page: page.page,
      sales: uniqueTableRowsById([...acc.sales, ...page.sales]),
      expenseLedger: uniqueTableRowsById([
        ...acc.expenseLedger,
        ...page.expenseLedger,
      ]),
      purchases: uniqueTableRowsById([...acc.purchases, ...page.purchases]),
      serviceCharges: uniqueTableRowsById([
        ...(acc.serviceCharges ?? []),
        ...(page.serviceCharges ?? []),
      ]),
    }),
  })
}
