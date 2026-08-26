import "server-only"

import { fetchPopArticlesTableServer } from "@/lib/rootsyApi/articlesServer"
import { articlesModalFiltersFromWorkspace } from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import type { ArticlesWorkspaceUrlState } from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import {
  DATA_WORKSPACE_TABLE_PAGE_SIZE,
  pinDataWorkspaceTableInfiniteParams,
} from "@/lib/dataWorkspaceTableInfinite"
import { prefetchPopInfiniteListQuery } from "@/lib/prefetchPopListQuery"
import { popArticlesQueryKey } from "@/lib/queryKeys"
import type { DehydratedState } from "@tanstack/react-query"

export async function prefetchPopArticlesTable(
  popId: string,
  url: ArticlesWorkspaceUrlState,
): Promise<DehydratedState | null> {
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
  return prefetchPopInfiniteListQuery({
    queryKey: popArticlesQueryKey(popId, params),
    queryFn: (page) =>
      fetchPopArticlesTableServer(popId, {
        ...params,
        page,
        pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
      }),
  })
}
