import { ServicesWorkspaceView } from "@/app/[siteId]/[popId]/services/ServicesWorkspaceView"
import { parseServicesWorkspaceUrl } from "@/app/[siteId]/[popId]/services/workspaceUrl"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopServicesTable } from "@/lib/prefetchPopListados"
import {
  workspaceUrlSearchParamsFromRecord,
  type PopPageParams,
  type PopPageSearchParams,
} from "@/lib/workspaceSearchParams"

export default function ServicesPage({
  params,
  searchParams,
}: {
  params: PopPageParams
  searchParams: PopPageSearchParams
}) {
  return (
    <PopListHydrationPage state={loadServicesTable(params, searchParams)}>
      <ServicesWorkspaceView />
    </PopListHydrationPage>
  )
}

async function loadServicesTable(
  params: PopPageParams,
  searchParams: PopPageSearchParams,
) {
  const { popId } = await params
  const url = parseServicesWorkspaceUrl(
    workspaceUrlSearchParamsFromRecord(await searchParams),
  )
  return prefetchPopServicesTable(popId, url)
}
