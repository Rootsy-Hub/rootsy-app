import { SuppliersWorkspaceView } from "@/app/[siteId]/[popId]/suppliers/SuppliersWorkspaceView"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopSuppliersTable } from "@/lib/prefetchPopListados"
import type { PopPageParams } from "@/lib/workspaceSearchParams"

export default async function SuppliersPage({
  params,
}: {
  params: PopPageParams
}) {
  const { popId } = await params

  return (
    <PopListHydrationPage state={await prefetchPopSuppliersTable(popId)}>
      <SuppliersWorkspaceView />
    </PopListHydrationPage>
  )
}
