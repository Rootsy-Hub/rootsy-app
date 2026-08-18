import { ChecksWorkspaceView } from "@/app/[siteId]/[popId]/checks/ChecksWorkspaceView"
import { parseChecksWorkspaceUrl } from "@/app/[siteId]/[popId]/checks/workspaceUrl"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopChecksTable } from "@/lib/prefetchPopListados"
import {
  workspaceUrlSearchParamsFromRecord,
  type PopPageParams,
  type PopPageSearchParams,
} from "@/lib/workspaceSearchParams"

export default function ChecksPage({
  params,
  searchParams,
}: {
  params: PopPageParams
  searchParams: PopPageSearchParams
}) {
  return (
    <PopListHydrationPage state={loadChecksTable(params, searchParams)}>
      <ChecksWorkspaceView />
    </PopListHydrationPage>
  )
}

async function loadChecksTable(
  params: PopPageParams,
  searchParams: PopPageSearchParams,
) {
  const { popId } = await params
  const url = parseChecksWorkspaceUrl(
    workspaceUrlSearchParamsFromRecord(await searchParams),
  )
  return prefetchPopChecksTable(popId, url)
}
