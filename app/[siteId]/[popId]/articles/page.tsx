import { ArticlesWorkspaceView } from "@/app/[siteId]/[popId]/articles/ArticlesWorkspaceView"
import { parseArticlesWorkspaceUrl } from "@/app/[siteId]/[popId]/articles/workspaceUrl"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopArticlesTable } from "@/lib/prefetchPopListados"
import {
  workspaceUrlSearchParamsFromRecord,
  type PopPageParams,
  type PopPageSearchParams,
} from "@/lib/workspaceSearchParams"

export default async function ArticlesPage({
  params,
  searchParams,
}: {
  params: PopPageParams
  searchParams: PopPageSearchParams
}) {
  const { popId } = await params
  const url = parseArticlesWorkspaceUrl(
    workspaceUrlSearchParamsFromRecord(await searchParams),
  )

  return (
    <PopListHydrationPage state={await prefetchPopArticlesTable(popId, url)}>
      <ArticlesWorkspaceView />
    </PopListHydrationPage>
  )
}
