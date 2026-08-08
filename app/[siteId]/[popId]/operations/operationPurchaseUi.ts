const PURCHASE_KIND_LABEL: Record<string, string> = {
  merchandise: "Mercadería",
  raw_material: "Materia prima",
  supply: "Insumo",
}

export function purchaseKindLabel(kind: string): string {
  return PURCHASE_KIND_LABEL[kind] ?? kind
}

export function purchaseHasComprobante(purchase: {
  documentKindLabel?: string | null
  documentNumber?: string | null
}): boolean {
  return Boolean(
    purchase.documentKindLabel?.trim() || purchase.documentNumber?.trim(),
  )
}

function roundMoney(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100) / 100
}

export function computePurchaseTaxFromLineItems(
  lineItems: Array<{ iva: number; lineTotal: number }>,
): number {
  let sum = 0
  for (const line of lineItems) {
    if (line.iva <= 0 || line.lineTotal <= 0) continue
    sum += roundMoney((line.lineTotal * line.iva) / (100 + line.iva))
  }
  return roundMoney(sum)
}

export function resolvePurchaseDisplayTaxTotal(purchase: {
  accruesInputVat: boolean
  taxTotal: number
  subtotal: number
  total: number
  vatIncludedEstimate?: number | null
  lineItems: Array<{ iva: number; lineTotal: number }>
}): number | null {
  if (!purchase.accruesInputVat) return null
  if (purchase.taxTotal > 0) return purchase.taxTotal
  if (purchase.vatIncludedEstimate != null && purchase.vatIncludedEstimate > 0) {
    return purchase.vatIncludedEstimate
  }
  const fromLines = computePurchaseTaxFromLineItems(purchase.lineItems)
  if (fromLines > 0) return fromLines
  const diff = roundMoney(purchase.total - purchase.subtotal)
  if (diff > 0) return diff
  return null
}
