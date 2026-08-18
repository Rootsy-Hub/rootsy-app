import { ClientsWorkspaceView } from "@/app/[siteId]/[popId]/clients/ClientsWorkspaceView"
import { parseClientsWorkspaceUrl } from "@/app/[siteId]/[popId]/clients/workspaceUrl"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopClientsTable } from "@/lib/prefetchPopListados"
import {
  workspaceUrlSearchParamsFromRecord,
  type PopPageParams,
  type PopPageSearchParams,
} from "@/lib/workspaceSearchParams"

export default function ClientsPage({
  params,
  searchParams,
}: {
  params: PopPageParams
  searchParams: PopPageSearchParams
}) {
  return (
    <PopListHydrationPage state={loadClientsTable(params, searchParams)}>
      <ClientsWorkspaceView />
    </PopListHydrationPage>
  )
}

async function loadClientsTable(
  params: PopPageParams,
  searchParams: PopPageSearchParams,
) {
  const { popId } = await params
  const url = parseClientsWorkspaceUrl(
    workspaceUrlSearchParamsFromRecord(await searchParams),
  )
  return prefetchPopClientsTable(popId, url)
}
