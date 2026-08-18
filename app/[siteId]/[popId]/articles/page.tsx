import { ArticlesWorkspaceView } from "@/app/[siteId]/[popId]/articles/ArticlesWorkspaceView"
import { parseArticlesWorkspaceUrl } from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopArticlesTable } from "@/lib/prefetchPopListados"
import {
  workspaceUrlSearchParamsFromRecord,
  type PopPageParams,
  type PopPageSearchParams,
} from "@/lib/workspaceSearchParams"

export default function ArticlesPage({
  params,
  searchParams,
}: {
  params: PopPageParams
  searchParams: PopPageSearchParams
}) {
  return (
    <PopListHydrationPage state={loadArticlesTable(params, searchParams)}>
      <ArticlesWorkspaceView />
    </PopListHydrationPage>
  )
}

async function loadArticlesTable(
  params: PopPageParams,
  searchParams: PopPageSearchParams,
) {
  const { popId } = await params
  const url = parseArticlesWorkspaceUrl(
    workspaceUrlSearchParamsFromRecord(await searchParams),
  )
  return prefetchPopArticlesTable(popId, url)
}
