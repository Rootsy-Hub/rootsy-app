"use server"

import { lookupPadronContribuyente } from "@/lib/argentinaPadronLookup"
import { mapPadronCondicionIvaToClientEnum } from "@/lib/padronIvaMapping"
import type { SaleComprobanteEmitterContext } from "@/lib/saleComprobantePreview"
import { getPopById } from "@/lib/popHelpers"
import { hasValidPopFiscalCuit } from "@/lib/popFiscalCuit"
import {
  clientIvaToPopEmisorIva,
  popEmisorIvaConditionLabel,
  type PopEmisorIvaCondition,
} from "@/lib/saleComprobanteRules"
import { createClient } from "@/utils/supabase/server"

function resolveEmisorIvaFromSettings(
  settings: Record<string, unknown> | undefined,
): PopEmisorIvaCondition | null {
  const raw = settings?.fiscal_iva_condition
  if (raw === "monotributo" || raw === "responsable_inscripto") {
    return raw
  }
  return null
}

async function resolvePopEmisorIva(input: {
  fiscalCuit: string | null | undefined
  settings?: Record<string, unknown>
}): Promise<{
  ivaCondition: PopEmisorIvaCondition
  ivaConditionLabel: string
}> {
  const cuit = String(input.fiscalCuit ?? "").trim()
  if (cuit) {
    const pad = await lookupPadronContribuyente(cuit)
    if (!("error" in pad)) {
      const mapped = mapPadronCondicionIvaToClientEnum(pad.condicionIvaNombre)
      const ivaCondition = clientIvaToPopEmisorIva(mapped)
      const padronLabel = pad.condicionIvaNombre?.trim()
      return {
        ivaCondition,
        ivaConditionLabel:
          padronLabel || popEmisorIvaConditionLabel(ivaCondition),
      }
    }
  }

  const cached = resolveEmisorIvaFromSettings(input.settings)
  if (cached) {
    return {
      ivaCondition: cached,
      ivaConditionLabel: popEmisorIvaConditionLabel(cached),
    }
  }

  return {
    ivaCondition: "responsable_inscripto",
    ivaConditionLabel: popEmisorIvaConditionLabel("responsable_inscripto"),
  }
}

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
    const hasValidFiscalCuit = hasValidPopFiscalCuit(pop.fiscalCuit)
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

    const { ivaCondition, ivaConditionLabel } = hasValidFiscalCuit
      ? await resolvePopEmisorIva({
          fiscalCuit: pop.fiscalCuit,
          settings: pop.settings as Record<string, unknown> | undefined,
        })
      : {
          ivaCondition: "responsable_inscripto" as const,
          ivaConditionLabel: "—",
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
      ivaCondition,
      ivaConditionLabel,
      hasValidFiscalCuit,
    }

    return { success: true, emitter }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido"
    return { success: false, error: message }
  }
}
