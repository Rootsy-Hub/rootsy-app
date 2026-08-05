import { hasValidPopFiscalCuit } from "@/lib/popFiscalCuit"
import type { PopEmisorIvaCondition } from "@/lib/saleComprobanteRules"

export function resolvePopEmisorIvaFromSettings(
  settings: unknown,
): PopEmisorIvaCondition {
  if (settings == null || typeof settings !== "object") {
    return "responsable_inscripto"
  }
  const raw = (settings as Record<string, unknown>).fiscal_iva_condition
  if (raw === "monotributo") return "monotributo"
  return "responsable_inscripto"
}

export function mapPopAccessFiscal(input: {
  fiscalCuit: string | null
  settings: unknown
}) {
  const hasValidCuit = hasValidPopFiscalCuit(input.fiscalCuit)
  return {
    hasValidCuit,
    emisorIvaCondition: hasValidCuit
      ? resolvePopEmisorIvaFromSettings(input.settings)
      : ("responsable_inscripto" as PopEmisorIvaCondition),
  }
}
