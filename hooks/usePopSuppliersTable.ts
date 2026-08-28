"use client"

import {
  concatTableRowKey,
  flattenDataWorkspaceTablePages,
} from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import { pinDataWorkspaceTableInfiniteParams } from "@/lib/dataWorkspaceTableInfinite"
import { suppliersTableInfiniteQueryOptions } from "@/lib/suppliersWorkspaceQuery"
import type { PopSuppliersQueryParams } from "@/lib/queryKeys"
import type { PopSuppliersTableResult } from "@/lib/rootsyApi/suppliersClient"
import { useInfiniteQuery } from "@tanstack/react-query"

type UsePopSuppliersTableOptions = {
  enabled?: boolean
}

export function usePopSuppliersTable(
  popId: string | undefined,
  params: PopSuppliersQueryParams,
  options?: UsePopSuppliersTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)

  return useInfiniteQuery({
    ...suppliersTableInfiniteQueryOptions(popId ?? "", infiniteParams),
    enabled,
    select: (data) =>
      flattenDataWorkspaceTablePages<PopSuppliersTableResult>(
        data,
        concatTableRowKey<PopSuppliersTableResult, "suppliers">("suppliers"),
      ),
  })
}
