"use client"

import {
  concatTableRowKey,
  flattenDataWorkspaceTablePages,
} from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import { clientsTableInfiniteQueryOptions } from "@/lib/clientsWorkspaceQuery"
import { pinDataWorkspaceTableInfiniteParams } from "@/lib/dataWorkspaceTableInfinite"
import type { PopClientsQueryParams } from "@/lib/queryKeys"
import type { PopClientsTableResult } from "@/lib/rootsyApi/clientsClient"
import { useInfiniteQuery } from "@tanstack/react-query"

type UsePopClientsTableOptions = {
  enabled?: boolean
}

export function usePopClientsTable(
  popId: string | undefined,
  params: PopClientsQueryParams,
  options?: UsePopClientsTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)

  return useInfiniteQuery({
    ...clientsTableInfiniteQueryOptions(popId ?? "", infiniteParams),
    enabled,
    select: (data) =>
      flattenDataWorkspaceTablePages<PopClientsTableResult>(
        data,
        concatTableRowKey<PopClientsTableResult, "clients">("clients"),
      ),
  })
}
