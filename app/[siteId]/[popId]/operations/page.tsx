import { OperationsWorkspaceView } from "@/app/[siteId]/[popId]/operations/OperationsWorkspaceView"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopOperationsList } from "@/lib/prefetchPopListados"
import type { PopPageParams } from "@/lib/workspaceSearchParams"

export default async function OperationsPage({
  params,
}: {
  params: PopPageParams
}) {
  const { popId } = await params

  return (
    <PopListHydrationPage state={await prefetchPopOperationsList(popId)}>
      <OperationsWorkspaceView />
    </PopListHydrationPage>
  )
}
