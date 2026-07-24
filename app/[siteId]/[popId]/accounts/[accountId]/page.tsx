"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

/** Redirige URLs antiguas al listado inline de cuentas. */
export default function TreasuryAccountDetailRedirectPage() {
  const router = useRouter()
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const accountId =
    typeof params?.accountId === "string" ? params.accountId : ""

  useEffect(() => {
    if (!siteId || !popId) return
    router.replace(`/${siteId}/${popId}/accounts`)
  }, [siteId, popId, accountId, router])

  return (
    <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
      <p className="text-sm text-muted-foreground">Redirigiendo a cuentas…</p>
    </div>
  )
}
