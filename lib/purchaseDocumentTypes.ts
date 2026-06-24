/** Tipos de comprobante que puede emitir un proveedor (compra). */
export const PURCHASE_DOCUMENT_TYPES = [
  "Factura A",
  "Factura B",
  "Factura C",
  "Nota de crédito A",
  "Nota de crédito B",
  "Nota de crédito C",
  "Nota de débito A",
  "Nota de débito B",
  "Nota de débito C",
  "Remito",
  "Ticket",
  "Otro",
] as const

export type PurchaseDocumentType = (typeof PURCHASE_DOCUMENT_TYPES)[number]

export function getPurchaseDocumentTypeOptions(): readonly PurchaseDocumentType[] {
  return PURCHASE_DOCUMENT_TYPES
}
