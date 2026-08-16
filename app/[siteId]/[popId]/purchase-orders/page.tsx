"use client"

import { PurchaseOrdersWorkspaceView } from "@/components/purchase-orders/PurchaseOrdersWorkspaceView"
import withAuth from "@/hoc/withAuth"
import { useParams } from "next/navigation"

function PurchaseOrdersPage() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""

  if (!siteId || !popId) {
    return (
      <div className="min-h-screen bg-background p-10 text-sm text-muted-foreground">
        Punto de venta no encontrado.
      </div>
    )
  }

  return <PurchaseOrdersWorkspaceView siteId={siteId} popId={popId} />
}

export default withAuth(PurchaseOrdersPage)
