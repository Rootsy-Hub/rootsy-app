import "server-only"

import { fetchPopArticlesTableServer } from "@/lib/rootsyApi/articlesServer"
import { articlesModalFiltersFromWorkspace } from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import type { ArticlesWorkspaceUrlState } from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import { getOperationsList } from "@/app/[siteId]/[popId]/operations/actions"
import { computeDataWorkspaceDateBounds } from "@/lib/dataWorkspaceDateFilter"
import { prefetchPopListQuery } from "@/lib/prefetchPopListQuery"
import {
  popArticlesQueryKey,
  popOperationsQueryKey,
  type PopOperationsQueryParams,
} from "@/lib/queryKeys"
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

export async function prefetchPopOperationsList(
  popId: string,
): Promise<DehydratedState | null> {
  const dateBounds = computeDataWorkspaceDateBounds("this_month", undefined)
  const params: PopOperationsQueryParams = {
    view: "sales",
    dateFrom: dateBounds.from,
    dateTo: dateBounds.to,
    search: "",
    page: 1,
    pageSize: 25,
    sort: null,
    ord: "asc",
  }
  return prefetchPopListQuery({
    queryKey: popOperationsQueryKey(popId, params),
    queryFn: () => getOperationsList(popId, { ...params, view: "sales" }),
  })
}


