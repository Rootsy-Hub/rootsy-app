"use client"

import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query"
import {
  nextDataWorkspaceTablePage,
  pagesOfInfiniteTableData,
  uniqueTableRowsById,
} from "@/lib/dataWorkspaceTableInfinite"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"

export type DataWorkspaceTablePage = {
  success: boolean
  page: number
  totalCount: number
}

export function getDataWorkspaceTableNextPageParam<
  T extends DataWorkspaceTablePage,
>(lastPage: T, _allPages: T[], lastPageParam: number) {
  if (!lastPage.success) return undefined
  const page =
    Number.isFinite(lastPageParam) && lastPageParam > 0
      ? lastPageParam
      : lastPage.page
  return nextDataWorkspaceTablePage(page, lastPage.totalCount)
}

export function flattenDataWorkspaceTablePages<T extends DataWorkspaceTablePage>(
  data: InfiniteData<T, number> | T,
  concat: (acc: T, page: T) => T,
): T {
  const [first, ...rest] = pagesOfInfiniteTableData(data)
  if (!first) {
    throw new Error("flattenDataWorkspaceTablePages: empty pages")
  }
  if (!first.success) return first
  // concat(page, page) dedupea ids dentro de la primera página (join/refetch).
  let acc = concat(first, first)
  for (const page of rest) {
    if (!page.success) continue
    acc = concat(acc, page)
  }
  return acc
}

export function concatTableRowKey<
  TPage extends DataWorkspaceTablePage,
  K extends keyof TPage,
>(key: K) {
  return (acc: TPage, page: TPage): TPage => {
    const accRows = acc[key]
    const pageRows = page[key]
    if (!Array.isArray(accRows) || !Array.isArray(pageRows)) {
      return { ...acc, page: page.page }
    }
    return {
      ...acc,
      [key]: uniqueTableRowsById([...accRows, ...pageRows]),
      page: page.page,
    }
  }
}

export function useDataWorkspaceInfiniteTableQuery<
  TPage extends DataWorkspaceTablePage,
>(options: {
  queryKey: QueryKey
  enabled: boolean
  queryFn: (page: number) => Promise<TPage>
  concat: (acc: TPage, page: TPage) => TPage
  /** Primera página del tramo actual. El scroll infinito sigue hacia abajo. */
  initialPageParam?: number
}) {
  const initialPageParam =
    Number.isFinite(options.initialPageParam) && (options.initialPageParam ?? 0) > 0
      ? Math.floor(options.initialPageParam as number)
      : 1

  return useInfiniteQuery<TPage, Error, TPage, QueryKey, number>({
    queryKey: options.queryKey,
    enabled: options.enabled,
    initialPageParam,
    queryFn: ({ pageParam }) => options.queryFn(pageParam),
    getNextPageParam: getDataWorkspaceTableNextPageParam<TPage>,
    select: (data) => flattenDataWorkspaceTablePages(data, options.concat),
    ...sessionListQueryOptions,
  })
}
