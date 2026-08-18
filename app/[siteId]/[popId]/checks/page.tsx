import { ChecksWorkspaceView } from "@/app/[siteId]/[popId]/checks/ChecksWorkspaceView"
import { parseChecksWorkspaceUrl } from "@/app/[siteId]/[popId]/checks/workspaceUrl"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopChecksTable } from "@/lib/prefetchPopListados"
import {
  workspaceUrlSearchParamsFromRecord,
  type PopPageParams,
  type PopPageSearchParams,
} from "@/lib/workspaceSearchParams"

export default async function ChecksPage({
  params,
  searchParams,
}: {
  params: PopPageParams
  searchParams: PopPageSearchParams
}) {
  const { popId } = await params
  const url = parseChecksWorkspaceUrl(
    workspaceUrlSearchParamsFromRecord(await searchParams),
  )

  return (
    <PopListHydrationPage state={await prefetchPopChecksTable(popId, url)}>
      <ChecksWorkspaceView />
    </PopListHydrationPage>
  )
}
