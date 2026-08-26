"use client"

import type { GetPopPromotionsTableInput } from "@/app/[siteId]/[popId]/promotions/actions"
import type { PromotionType } from "@/lib/promotionTypes"
import {
  concatTableRowKey,
  useDataWorkspaceInfiniteTableQuery,
} from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  pinDataWorkspaceTableInfiniteParams,
} from "@/lib/dataWorkspaceTableInfinite"
import {
  popPromotionsQueryKey,
  type PopPromotionsQueryParams,
} from "@/lib/queryKeys"
import { fetchPopPromotionsTable, type PopPromotionsTableResult } from "@/lib/rootsyApi/promotionsClient"

type UsePopPromotionsTableOptions = {
  enabled?: boolean
}

export function usePopPromotionsTable(
  popId: string | undefined,
  params: PopPromotionsQueryParams,
  options?: UsePopPromotionsTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)
  const queryParams: GetPopPromotionsTableInput = {
    q: params.q,
    page: infiniteParams.page,
    pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
    soloActivos: params.soloActivos,
    promotionType: params.promotionType as PromotionType | "",
    sort: params.sort,
    ord: params.ord,
  }

  return useDataWorkspaceInfiniteTableQuery<PopPromotionsTableResult>({
    queryKey: popPromotionsQueryKey(popId ?? "", infiniteParams),
    enabled,
    queryFn: (page) =>
      fetchPopPromotionsTable(popId!, { ...queryParams, page }),
    concat: concatTableRowKey<PopPromotionsTableResult, "promotions">("promotions"),
  })
}
