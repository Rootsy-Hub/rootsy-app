import { SuppliersWorkspaceView } from "@/app/[siteId]/[popId]/suppliers/SuppliersWorkspaceView"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopSuppliersTable } from "@/lib/prefetchPopListados"
import type { PopPageParams } from "@/lib/workspaceSearchParams"

export default function SuppliersPage({ params }: { params: PopPageParams }) {
  return (
    <PopListHydrationPage state={loadSuppliersTable(params)}>
      <SuppliersWorkspaceView />
    </PopListHydrationPage>
  )
}

async function loadSuppliersTable(params: PopPageParams) {
  const { popId } = await params
  return prefetchPopSuppliersTable(popId)
}
