import "server-only"

import { fetchPopArticlesTableServer } from "@/lib/rootsyApi/articlesServer"
import { articlesModalFiltersFromWorkspace } from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import type { ArticlesWorkspaceUrlState } from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  dataWorkspaceTableStartPage,
  pinDataWorkspaceTableInfiniteParams,
} from "@/lib/dataWorkspaceTableInfinite"
import { prefetchPopInfiniteListQuery } from "@/lib/prefetchPopListQuery"
import { popArticlesQueryKey } from "@/lib/queryKeys"
import type { DehydratedState } from "@tanstack/react-query"

export async function prefetchPopArticlesTable(
  popId: string,
  url: ArticlesWorkspaceUrlState,
): Promise<DehydratedState | null> {
  const startPage = dataWorkspaceTableStartPage(url.page)
  const params = pinDataWorkspaceTableInfiniteParams({
    page: url.page,
    pageSize: url.pageSize,
    search: url.q,
    ...articlesModalFiltersFromWorkspace(url),
    categoryId: url.categoryId,
    itemKinds: url.itemKinds,
    sort: url.sort,
    ord: url.ord,
  })
  const keyParams = { ...params, page: startPage }
  return prefetchPopInfiniteListQuery({
    queryKey: popArticlesQueryKey(popId, keyParams),
    initialPageParam: startPage,
    queryFn: (page) =>
      fetchPopArticlesTableServer(popId, {
        ...params,
        page,
        pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
      }),
  })
}
