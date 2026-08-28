"use client"

import {
  concatTableRowKey,
  flattenDataWorkspaceTablePages,
} from "@/hooks/useDataWorkspaceInfiniteTableQuery"
import { articlesTableInfiniteQueryOptions } from "@/lib/articlesWorkspaceQuery"
import type { PopArticlesQueryParams } from "@/lib/queryKeys"
import type { PopArticlesTableResult } from "@/lib/rootsyApi/articlesClient"
import { useInfiniteQuery } from "@tanstack/react-query"

type UsePopArticlesTableOptions = {
  enabled?: boolean
}

export function usePopArticlesTable(
  popId: string | undefined,
  params: PopArticlesQueryParams,
  options?: UsePopArticlesTableOptions,
) {
  const enabled = (options?.enabled ?? true) && Boolean(popId)

  return useInfiniteQuery({
    ...articlesTableInfiniteQueryOptions(popId ?? "", params),
    enabled,
    select: (data) =>
      flattenDataWorkspaceTablePages<PopArticlesTableResult>(
        data,
        concatTableRowKey<PopArticlesTableResult, "articles">("articles"),
      ),
  })
}
