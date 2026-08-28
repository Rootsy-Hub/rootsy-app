"use client"

import {
  concatTableRowKey,
  flattenDataWorkspaceTablePages,
} from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import { pinDataWorkspaceTableInfiniteParams } from "@/lib/dataWorkspaceTableInfinite"
import { recipesTableInfiniteQueryOptions } from "@/lib/recipesWorkspaceQuery"
import type { PopRecipesQueryParams } from "@/lib/queryKeys"
import type { PopRecipesTableResult } from "@/lib/rootsyApi/recipesClient"
import { useInfiniteQuery } from "@tanstack/react-query"

type UsePopRecipesTableOptions = {
  enabled?: boolean
}

export function usePopRecipesTable(
  popId: string | undefined,
  params: PopRecipesQueryParams,
  options?: UsePopRecipesTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)
  const infiniteParams = pinDataWorkspaceTableInfiniteParams(params)

  return useInfiniteQuery({
    ...recipesTableInfiniteQueryOptions(popId ?? "", infiniteParams),
    enabled,
    select: (data) =>
      flattenDataWorkspaceTablePages<PopRecipesTableResult>(
        data,
        concatTableRowKey<PopRecipesTableResult, "recipes">("recipes"),
      ),
  })
}
