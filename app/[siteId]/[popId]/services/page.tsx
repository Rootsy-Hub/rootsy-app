import { ServicesWorkspaceView } from "@/app/[siteId]/[popId]/services/ServicesWorkspaceView"
import { parseServicesWorkspaceUrl } from "@/app/[siteId]/[popId]/services/workspaceUrl"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopServicesTable } from "@/lib/prefetchPopListados"
import {
  workspaceUrlSearchParamsFromRecord,
  type PopPageParams,
  type PopPageSearchParams,
} from "@/lib/workspaceSearchParams"

export default async function ServicesPage({
  params,
  searchParams,
}: {
  params: PopPageParams
  searchParams: PopPageSearchParams
}) {
  const { popId } = await params
  const url = parseServicesWorkspaceUrl(
    workspaceUrlSearchParamsFromRecord(await searchParams),
  )

  return (
    <PopListHydrationPage state={await prefetchPopServicesTable(popId, url)}>
      <ServicesWorkspaceView />
    </PopListHydrationPage>
  )
}
