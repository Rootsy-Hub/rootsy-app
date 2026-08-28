"use client"

import { CobrarServiciosWorkspace } from "@/app/[siteId]/[popId]/cobrar-servicios/components/CobrarServiciosWorkspace"
import { useParams } from "@/lib/pop-spa/navigation"

function CobrarServiciosPage() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""

  if (!popId) return null

  return <CobrarServiciosWorkspace siteId={siteId} popId={popId} />
}

export default CobrarServiciosPage
