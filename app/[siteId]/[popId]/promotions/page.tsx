import { PromotionsWorkspaceView } from "@/app/[siteId]/[popId]/promotions/PromotionsWorkspaceView"
import { parsePromotionsWorkspaceUrl } from "@/app/[siteId]/[popId]/promotions/workspaceUrl"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopPromotionsTable } from "@/lib/prefetchPopListados"
import {
  workspaceUrlSearchParamsFromRecord,
  type PopPageParams,
  type PopPageSearchParams,
} from "@/lib/workspaceSearchParams"

export default function PromotionsPage({
  params,
  searchParams,
}: {
  params: PopPageParams
  searchParams: PopPageSearchParams
}) {
  return (
    <PopListHydrationPage state={loadPromotionsTable(params, searchParams)}>
      <PromotionsWorkspaceView />
    </PopListHydrationPage>
  )
}

async function loadPromotionsTable(
  params: PopPageParams,
  searchParams: PopPageSearchParams,
) {
  const { popId } = await params
  const url = parsePromotionsWorkspaceUrl(
    workspaceUrlSearchParamsFromRecord(await searchParams),
  )
  return prefetchPopPromotionsTable(popId, url)
}
