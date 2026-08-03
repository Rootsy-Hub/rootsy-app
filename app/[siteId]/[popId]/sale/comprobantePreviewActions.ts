"use server"

import type { SaleComprobanteEmitterContext } from "@/lib/saleComprobantePreview"
import { getPopById } from "@/lib/popHelpers"
import { createClient } from "@/utils/supabase/server"

export async function getPopComprobanteEmitterPreview(
  popId: string,
  cashRegisterId?: string | null,
): Promise<
  | { success: true; emitter: SaleComprobanteEmitterContext }
  | { success: false; error: string }
> {
  try {
    const popRes = await getPopById(popId)
    if (!popRes.success || !popRes.pop) {
      return {
        success: false,
        error: popRes.error ?? "No se pudieron leer los datos del local.",
      }
    }

    const pop = popRes.pop
    let arcaPtoVta: number | null = null

    if (cashRegisterId?.trim()) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("cash_registers")
        .select("arca_pto_vta")
        .eq("id", cashRegisterId.trim())
        .maybeSingle()

      if (!error && data?.arca_pto_vta != null) {
        const parsed = Number(data.arca_pto_vta)
        if (Number.isFinite(parsed)) arcaPtoVta = parsed
      }
    }

    const emitter: SaleComprobanteEmitterContext = {
      tradeName: String(pop.name ?? "").trim() || "Comercio",
      razonSocial:
        String(pop.fiscalRazonSocial ?? pop.name ?? "").trim() || "Comercio",
      address: pop.address?.trim() || null,
      cuit: pop.fiscalCuit?.trim() || null,
      ingresosBrutos: pop.fiscalIngresosBrutosText?.trim() || null,
      inicioActividades: pop.fiscalInicioActividadesDate?.trim() || null,
      phone: pop.phone?.trim() || null,
      arcaPtoVta,
    }

    return { success: true, emitter }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
