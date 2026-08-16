"use server"

import { getPopById, validatePopAccess } from "@/lib/popHelpers"
import type { ReportExportContext } from "@/lib/reportExportContext"

export async function getReportExportContext(
  popId: string,
): Promise<
  | { success: true; context: ReportExportContext }
  | { success: false; error: string }
> {
  try {
    const access = await validatePopAccess(popId)
    if (!access.hasAccess || !access.isActive) {
      return { success: false, error: access.error || "Sin acceso" }
    }

    const popRes = await getPopById(popId)
    if (!popRes.success || !popRes.pop) {
      return { success: false, error: "No se encontró el punto de venta." }
    }

    return {
      success: true,
      context: {
        popName: String(popRes.pop.name ?? "").trim(),
        popStreetAddress: popRes.pop.streetAddress
          ? String(popRes.pop.streetAddress).trim()
          : null,
        popFiscalCuit: popRes.pop.fiscalCuit
          ? String(popRes.pop.fiscalCuit).trim()
          : null,
        popFiscalRazonSocial: popRes.pop.fiscalRazonSocial
          ? String(popRes.pop.fiscalRazonSocial).trim()
          : null,
      },
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
