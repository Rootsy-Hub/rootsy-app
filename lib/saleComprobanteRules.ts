import type { ClientIvaConditionValue } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import { SALE_COMPROBANTE_SIN_LABEL } from "@/lib/saleComprobantePicker"

/** Condición IVA del emisor (POP). Por ahora asumimos RI hasta persistirla en ajustes. */
export type PopEmisorIvaCondition = "responsable_inscripto" | "monotributo"

/**
 * Reglas Argentina (simplificadas) emisor → receptor → comprobante.
 *
 * - RI → RI: Factura A (IVA discriminado; impacta débito fiscal en contabilidad).
 * - RI → CF / monotributo / exento / sin categorizar: Factura B.
 * - Monotributo → cualquier receptor: Factura C.
 *
 * El IVA contable en `completeSale` depende del **tipo de comprobante elegido**
 * (`saleComprobanteAccruesOutputVat`), no de la condición IVA del cliente directamente.
 * Elegir el comprobante correcto es lo que alinea facturación y asiento.
 */
export function suggestSaleComprobanteForClientIva(
  clientIva: ClientIvaConditionValue | null | undefined,
  emisorIva: PopEmisorIvaCondition = "responsable_inscripto",
): string | null {
  if (emisorIva === "monotributo") {
    return "Factura C"
  }

  switch (clientIva) {
    case "responsable_inscripto":
      return "Factura A"
    case "monotributo":
    case "monotributo_social":
    case "consumidor_final":
    case "exento":
    case "no_categorizado":
      return "Factura B"
    default:
      return "Factura B"
  }
}

/**
 * Resuelve el comprobante a usar en una venta:
 * 1. Override explícito del cliente (`defaultInvoiceTypeLabel`)
 * 2. Regla según condición IVA
 * 3. null = sin comprobante (el POS puede aplicar default del POP en localStorage)
 */
export function resolveSaleComprobanteForClient(input: {
  clientIvaCondition: ClientIvaConditionValue | null | undefined
  defaultInvoiceTypeLabel: string | null | undefined
  emisorIva?: PopEmisorIvaCondition
}): string | null {
  const explicit = input.defaultInvoiceTypeLabel?.trim()
  if (explicit && explicit !== SALE_COMPROBANTE_SIN_LABEL) {
    return explicit
  }
  if (input.clientIvaCondition) {
    return suggestSaleComprobanteForClientIva(
      input.clientIvaCondition,
      input.emisorIva,
    )
  }
  return null
}
