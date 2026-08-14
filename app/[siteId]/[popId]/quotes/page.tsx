"use client"

import { QuotesWorkspaceView } from "@/components/quotes/QuotesWorkspaceView"
import withAuth from "@/hoc/withAuth"
import { useParams } from "next/navigation"

function QuotesPage() {
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

  return <QuotesWorkspaceView siteId={siteId} popId={popId} />
}

export default withAuth(QuotesPage)
