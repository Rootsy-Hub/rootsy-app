"use client"

import { useParams } from "@/lib/pop-spa/navigation"
import { useMemo } from "react"
import { timezoneForSiteId } from "@/lib/popTimezone"

/** Zona horaria del POP en componentes cliente (usa `[siteId]` de la ruta). */
export function usePopTimeZone(): string {
  const params = useParams()
  const siteId = String(params?.siteId ?? "")
  return useMemo(() => timezoneForSiteId(siteId), [siteId])
}
