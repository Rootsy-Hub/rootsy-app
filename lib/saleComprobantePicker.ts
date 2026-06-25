import {
  findSaleInvoiceTypeByLabel,
  getSaleInvoiceTypeOptionsForSite,
  type SaleInvoiceTypeOption,
} from "@/lib/saleInvoiceTypes"

/** Etiqueta visible para ventas sin comprobante fiscal. */
export const SALE_COMPROBANTE_SIN_LABEL = "Sin comprobante"

/** Recibo interno: no es factura válida y no se autoriza en ARCA. */
export const SALE_COMPROBANTE_RECIBO_X_LABEL = "Recibo X"

/** Tipos fiscales habituales en una venta (Argentina). */
const SALE_PICKER_ARCA_LABELS = [
  "Factura B",
  "Factura A",
  "Factura C",
] as const

export type SaleComprobantePickerOption =
  | {
      kind: "none"
      label: typeof SALE_COMPROBANTE_SIN_LABEL
    }
  | {
      kind: "arca"
      label: string
      arcaCbteTipo: number
      arcaRegimen: SaleInvoiceTypeOption["arcaRegimen"]
    }
  | {
      kind: "internal"
      label: typeof SALE_COMPROBANTE_RECIBO_X_LABEL
    }

export function isInternalSaleComprobante(label: string | null | undefined): boolean {
  return label === SALE_COMPROBANTE_RECIBO_X_LABEL
}

/**
 * Indica si el tipo de comprobante implica registrar IVA débito fiscal
 * (crédito en cuenta IVA a pagar) en el asiento de la venta.
 *
 * Sin comprobante, Recibo X y Recibos ARCA no generan ese pasivo;
 * Facturas y notas de crédito/débito sí (régimen general).
 */
export function saleComprobanteAccruesOutputVat(
  siteId: string,
  label: string | null | undefined,
): boolean {
  if (label == null) return false
  if (isInternalSaleComprobante(label)) return false

  const opt = findSaleInvoiceTypeByLabel(siteId, label)
  if (!opt) return false

  const l = opt.label
  if (l.startsWith("Recibo")) return false
  if (l.startsWith("Factura")) return true
  if (l.startsWith("Nota de cr")) return true
  if (l.startsWith("Nota de d")) return true
  return false
}

export function getSaleComprobanteDisplayLabel(value: string | null): string {
  return value ?? SALE_COMPROBANTE_SIN_LABEL
}

export function getSaleComprobantePickerOptions(
  siteId: string,
): SaleComprobantePickerOption[] {
  const all = getSaleInvoiceTypeOptionsForSite(siteId)
  const byLabel = new Map(all.map((o) => [o.label, o]))

  const out: SaleComprobantePickerOption[] = [
    { kind: "none", label: SALE_COMPROBANTE_SIN_LABEL },
  ]

  for (const label of SALE_PICKER_ARCA_LABELS) {
    const opt = byLabel.get(label)
    if (!opt) continue
    out.push({
      kind: "arca",
      label: opt.label,
      arcaCbteTipo: opt.arcaCbteTipo,
      arcaRegimen: opt.arcaRegimen,
    })
  }

  out.push({ kind: "internal", label: SALE_COMPROBANTE_RECIBO_X_LABEL })
  return out
}

export function isAllowedSaleComprobanteLabel(
  siteId: string,
  label: string | null,
): boolean {
  if (label == null) return true
  if (label === SALE_COMPROBANTE_RECIBO_X_LABEL) return true
  return Boolean(findSaleInvoiceTypeByLabel(siteId, label))
}

const STORAGE_PREFIX = "rootsy:sale-comprobante-default:"

export function readSavedSaleComprobante(
  popId: string,
): string | null | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${popId}`)
    if (raw == null) return undefined
    const parsed = JSON.parse(raw) as { v?: string | null }
    if (parsed.v == null || parsed.v === "") return null
    return String(parsed.v)
  } catch {
    return undefined
  }
}

export function writeSavedSaleComprobante(
  popId: string,
  value: string | null,
): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(
      `${STORAGE_PREFIX}${popId}`,
      JSON.stringify({ v: value }),
    )
  } catch {
    /* quota / private mode */
  }
}
