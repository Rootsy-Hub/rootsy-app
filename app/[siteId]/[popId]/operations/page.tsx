import { OperationsWorkspaceView } from "@/app/[siteId]/[popId]/operations/OperationsWorkspaceView"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopOperationsList } from "@/lib/prefetchPopListados"
import type { PopPageParams } from "@/lib/workspaceSearchParams"

export default function OperationsPage({ params }: { params: PopPageParams }) {
  return (
    <PopListHydrationPage state={loadOperationsList(params)}>
      <OperationsWorkspaceView />
    </PopListHydrationPage>
  )
}

async function loadOperationsList(params: PopPageParams) {
  const { popId } = await params
  return prefetchPopOperationsList(popId)
}
