import { PurchaseOrdersWorkspaceView } from "@/components/purchase-orders/PurchaseOrdersWorkspaceView"
import { PopListHydrationPage } from "@/lib/PopListHydrationPage"
import { prefetchPopPurchaseOrdersTable } from "@/lib/prefetchPopListados"
import type { PopPageParams } from "@/lib/workspaceSearchParams"

export default async function PurchaseOrdersPage({
  params,
}: {
  params: PopPageParams
}) {
  const { siteId, popId } = await params
  if (!siteId || !popId) {
    return (
      <div className="min-h-screen bg-background p-10 text-sm text-muted-foreground">
        Punto de venta no encontrado.
      </div>
    )
  }

  return (
    <PopListHydrationPage state={await prefetchPopPurchaseOrdersTable(popId)}>
      <PurchaseOrdersWorkspaceView siteId={siteId} popId={popId} />
    </PopListHydrationPage>
  )
}
