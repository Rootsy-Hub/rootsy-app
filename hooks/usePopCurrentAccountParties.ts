"use client"

import {
  concatTableRowKey,
  flattenDataWorkspaceTablePages,
} from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import { currentAccountPartiesInfiniteQueryOptions } from "@/lib/currentAccountsWorkspaceQuery"
import { pinDataWorkspaceTableInfiniteParams } from "@/lib/dataWorkspaceTableInfinite"
import type { PopCurrentAccountPartiesQueryParams } from "@/lib/queryKeys"
import type { PopCurrentAccountPartiesResult } from "@/lib/rootsyApi/currentAccountsClient"
import { useInfiniteQuery } from "@tanstack/react-query"

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

  return useInfiniteQuery({
    ...currentAccountPartiesInfiniteQueryOptions(popId ?? "", infiniteParams),
    enabled,
    select: (data) =>
      flattenDataWorkspaceTablePages<PopCurrentAccountPartiesResult>(
        data,
        concatTableRowKey<PopCurrentAccountPartiesResult, "parties">("parties"),
      ),
  })
}
