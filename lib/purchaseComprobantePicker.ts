/** Etiqueta visible cuando la compra no tiene documento del proveedor. */
export const PURCHASE_COMPROBANTE_SIN_LABEL = "Sin comprobante"

/** Tipos fiscales de compra (solo facturas; devoluciones van en otro flujo). */
export const PURCHASE_FISCAL_DOCUMENT_TYPES = [
  "Factura A",
  "Factura B",
  "Factura C",
] as const

export type PurchaseFiscalDocumentType =
  (typeof PURCHASE_FISCAL_DOCUMENT_TYPES)[number]

/** Documentos no fiscales o complementarios del proveedor. */
export const PURCHASE_OTHER_DOCUMENT_TYPES = ["Remito", "Otro"] as const

export type PurchaseOtherDocumentType =
  (typeof PURCHASE_OTHER_DOCUMENT_TYPES)[number]

/** Valores históricos que pueden existir en BD; no se ofrecen en el picker de compra. */
export const PURCHASE_LEGACY_DOCUMENT_TYPES = [
  "Nota de crédito A",
  "Nota de crédito B",
  "Nota de crédito C",
  "Nota de débito A",
  "Nota de débito B",
  "Nota de débito C",
  "Ticket",
] as const

export type PurchaseDocumentType =
  | PurchaseFiscalDocumentType
  | PurchaseOtherDocumentType

export const PURCHASE_DOCUMENT_TYPES = [
  ...PURCHASE_FISCAL_DOCUMENT_TYPES,
  ...PURCHASE_OTHER_DOCUMENT_TYPES,
] as const

export type PurchaseComprobantePickerOption =
  | {
      kind: "none"
      label: typeof PURCHASE_COMPROBANTE_SIN_LABEL
      hint: string
    }
  | {
      kind: "fiscal" | "other"
      label: PurchaseDocumentType
      hint: string
    }

const PURCHASE_COMPROBANTE_PICKER: PurchaseComprobantePickerOption[] = [
  {
    kind: "none",
    label: PURCHASE_COMPROBANTE_SIN_LABEL,
    hint: "Registro interno · sin crédito fiscal en el asiento",
  },
  {
    kind: "fiscal",
    label: "Factura A",
    hint: "Proveedor RI · IVA discriminado · crédito fiscal",
  },
  {
    kind: "fiscal",
    label: "Factura B",
    hint: "IVA incluido · crédito fiscal",
  },
  {
    kind: "fiscal",
    label: "Factura C",
    hint: "Proveedor monotributo · sin crédito fiscal",
  },
  {
    kind: "other",
    label: "Remito",
    hint: "Entrega de mercadería · la factura puede venir aparte",
  },
  {
    kind: "other",
    label: "Otro",
    hint: "Otro documento · sin crédito fiscal en el asiento",
  },
]

/**
 * Indica si el comprobante de compra permite registrar IVA crédito fiscal
 * en el asiento (cuenta IVA crédito fiscal).
 *
 * Sin comprobante, remito u otros no fiscales: no.
 * Factura C (monotributo): no hay crédito fiscal para el comprador.
 */
export function purchaseComprobanteAccruesInputVat(
  documentKind: string | null | undefined,
): boolean {
  if (documentKind == null || !documentKind.trim()) return false
  const label = documentKind.trim()
  if (label === "Factura A" || label === "Factura B") {
    return true
  }
  return false
}

export function getPurchaseComprobantePickerOptions(): readonly PurchaseComprobantePickerOption[] {
  return PURCHASE_COMPROBANTE_PICKER
}

export function getPurchaseComprobanteDisplayLabel(
  value: string | null | undefined,
): string {
  return value?.trim() ? value.trim() : PURCHASE_COMPROBANTE_SIN_LABEL
}

export function isAllowedPurchaseComprobanteLabel(
  label: string | null | undefined,
): boolean {
  if (label == null || !label.trim()) return true
  const trimmed = label.trim()
  return (
    PURCHASE_DOCUMENT_TYPES.includes(trimmed as PurchaseDocumentType) ||
    (PURCHASE_LEGACY_DOCUMENT_TYPES as readonly string[]).includes(trimmed)
  )
}

/** @deprecated Usar getPurchaseComprobantePickerOptions */
export function getPurchaseDocumentTypeOptions(): readonly PurchaseDocumentType[] {
  return PURCHASE_DOCUMENT_TYPES
}
