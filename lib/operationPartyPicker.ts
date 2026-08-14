export type OperationPartyCatalogItem = {
  id: string
  name: string
  taxId?: string | null
  email?: string | null
  ivaCondition?: string | null
  defaultInvoiceTypeLabel?: string | null
}

export type OperationPartySelection = {
  id: string | null
  manual: boolean
  name: string
  taxId: string | null
  email?: string | null
  ivaCondition: string | null
  defaultInvoiceTypeLabel: string | null
}

export type OperationPartyManualConfirmPayload = {
  name: string
  taxId: string
  email: string
  ivaCondition: string
}

export type OperationPartyManualConfirmOptions = {
  persistInCatalog: boolean
}

export function buildOperationPartyManualSelection(
  payload: OperationPartyManualConfirmPayload,
): OperationPartySelection {
  return {
    id: null,
    manual: true,
    name: payload.name || "Cliente sin nombre",
    taxId: payload.taxId || null,
    email: payload.email || null,
    ivaCondition: payload.ivaCondition || null,
    defaultInvoiceTypeLabel: null,
  }
}

export function normalizarBusquedaParty(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
}

export function partyPickerTitle(
  flow: "sale" | "purchase",
  context: "venta" | "mesa" | "pedido" | "compra",
): string {
  if (flow === "purchase") return "Proveedor para esta compra"
  switch (context) {
    case "mesa":
      return "Cliente para esta mesa"
    case "pedido":
      return "Cliente para este pedido"
    default:
      return "Cliente para esta venta"
  }
}

export function discountDialogTitle(
  context: "venta" | "mesa" | "pedido" | "compra" | "cargo",
): string {
  switch (context) {
    case "mesa":
      return "Descuento en la mesa"
    case "pedido":
      return "Descuento en el pedido"
    case "compra":
      return "Descuento en la compra"
    case "cargo":
      return "Descuento en el cargo"
    default:
      return "Descuento en la venta"
  }
}

export function saleComprobanteDialogDescription(
  context: "venta" | "mesa" | "pedido",
): string {
  const scope =
    context === "mesa"
      ? "esta mesa"
      : context === "pedido"
        ? "este pedido"
        : "esta venta"
  return `Elegí el tipo para ${scope}. Facturas A/B/C registran IVA débito fiscal; sin comprobante y Recibo X no.`
}
