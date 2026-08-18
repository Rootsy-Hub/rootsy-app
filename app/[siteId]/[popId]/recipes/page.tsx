import { RecipesWorkspaceView } from "@/app/[siteId]/[popId]/recipes/RecipesWorkspaceView"
import { parseRecipesWorkspaceUrl } from "@/app/[siteId]/[popId]/recipes/workspaceUrl"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopRecipesTable } from "@/lib/prefetchPopListados"
import {
  workspaceUrlSearchParamsFromRecord,
  type PopPageParams,
  type PopPageSearchParams,
} from "@/lib/workspaceSearchParams"

export default async function RecipesPage({
  params,
  searchParams,
}: {
  params: PopPageParams
  searchParams: PopPageSearchParams
}) {
  const { popId } = await params
  const url = parseRecipesWorkspaceUrl(
    workspaceUrlSearchParamsFromRecord(await searchParams),
  )

  return (
    <PopListHydrationPage state={await prefetchPopRecipesTable(popId, url)}>
      <RecipesWorkspaceView />
    </PopListHydrationPage>
  )
}
