import "server-only"

import { fetchPopArticlesTableServer } from "@/lib/rootsyApi/articlesServer"
import { articlesModalFiltersFromWorkspace } from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import type { ArticlesWorkspaceUrlState } from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import { prefetchPopListQuery } from "@/lib/prefetchPopListQuery"
import { popArticlesQueryKey } from "@/lib/queryKeys"
import type { DehydratedState } from "@tanstack/react-query"

export async function prefetchPopArticlesTable(
  popId: string,
  url: ArticlesWorkspaceUrlState,
): Promise<DehydratedState | null> {
  const params = {
    page: url.page,
    pageSize: url.pageSize,
    search: url.q,
    ...articlesModalFiltersFromWorkspace(url),
    categoryId: url.categoryId,
    itemKinds: url.itemKinds,
    sort: url.sort,
    ord: url.ord,
  }
  return prefetchPopListQuery({
    queryKey: popArticlesQueryKey(popId, params),
    queryFn: () => fetchPopArticlesTableServer(popId, params),
  })
}
