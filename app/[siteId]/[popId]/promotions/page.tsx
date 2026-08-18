import { PromotionsWorkspaceView } from "@/app/[siteId]/[popId]/promotions/PromotionsWorkspaceView"
import { parsePromotionsWorkspaceUrl } from "@/app/[siteId]/[popId]/promotions/workspaceUrl"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopPromotionsTable } from "@/lib/prefetchPopListados"
import {
  workspaceUrlSearchParamsFromRecord,
  type PopPageParams,
  type PopPageSearchParams,
} from "@/lib/workspaceSearchParams"

export default async function PromotionsPage({
  params,
  searchParams,
}: {
  params: PopPageParams
  searchParams: PopPageSearchParams
}) {
  const { popId } = await params
  const url = parsePromotionsWorkspaceUrl(
    workspaceUrlSearchParamsFromRecord(await searchParams),
  )

  return (
    <PopListHydrationPage state={await prefetchPopPromotionsTable(popId, url)}>
      <PromotionsWorkspaceView />
    </PopListHydrationPage>
  )
}
