import { RecipesWorkspaceView } from "@/app/[siteId]/[popId]/recipes/RecipesWorkspaceView"
import { parseRecipesWorkspaceUrl } from "@/app/[siteId]/[popId]/recipes/workspaceUrl"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopRecipesTable } from "@/lib/prefetchPopListados"
import {
  workspaceUrlSearchParamsFromRecord,
  type PopPageParams,
  type PopPageSearchParams,
} from "@/lib/workspaceSearchParams"

export default function RecipesPage({
  params,
  searchParams,
}: {
  params: PopPageParams
  searchParams: PopPageSearchParams
}) {
  return (
    <PopListHydrationPage state={loadRecipesTable(params, searchParams)}>
      <RecipesWorkspaceView />
    </PopListHydrationPage>
  )
}

async function loadRecipesTable(
  params: PopPageParams,
  searchParams: PopPageSearchParams,
) {
  const { popId } = await params
  const url = parseRecipesWorkspaceUrl(
    workspaceUrlSearchParamsFromRecord(await searchParams),
  )
  return prefetchPopRecipesTable(popId, url)
}
