"use client"

import type { GetPopPromotionsTableInput } from "@/app/[siteId]/[popId]/promotions/actions"
import type { PromotionType } from "@/lib/promotionTypes"
import {
  popPromotionsQueryKey,
  type PopPromotionsQueryParams,
} from "@/lib/queryKeys"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { fetchPopPromotionsTable } from "@/lib/rootsyApi/promotionsClient"
import { useQuery } from "@tanstack/react-query"

type UsePopPromotionsTableOptions = {
  enabled?: boolean
}

export function usePopPromotionsTable(
  popId: string | undefined,
  params: PopPromotionsQueryParams,
  options?: UsePopPromotionsTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const queryParams: GetPopPromotionsTableInput = {
    q: params.q,
    page: params.page,
    pageSize: params.pageSize,
    soloActivos: params.soloActivos,
    promotionType: params.promotionType as PromotionType | "",
    sort: params.sort,
    ord: params.ord,
  }

  return useQuery({
    queryKey: popPromotionsQueryKey(popId ?? "", params),
    queryFn: () => fetchPopPromotionsTable(popId!, queryParams),
    enabled,
    ...sessionListQueryOptions,
  })
}
