type SaleLineLike = {
  name_snapshot?: unknown
  quantity?: unknown
  comment?: unknown
  item_discount_amount?: unknown
}

export function formatCashRegisterSaleDetail(
  lineItemsRaw: unknown,
  discountTotal: number,
): string {
  const lineItems = Array.isArray(lineItemsRaw)
    ? (lineItemsRaw as SaleLineLike[])
    : []
  const parts: string[] = []

  for (const line of lineItems.slice(0, 6)) {
    const name = String(line.name_snapshot ?? "—").trim() || "—"
    const qtyRaw = Number(line.quantity)
    const qty =
      Number.isFinite(qtyRaw) && qtyRaw > 0
        ? Math.round(qtyRaw * 1000) / 1000
        : 1
    const itemDiscount = Number(line.item_discount_amount)
    const comment =
      typeof line.comment === "string" && line.comment.trim()
        ? line.comment.trim()
        : ""
    let chunk = `${qty}× ${name}`
    if (Number.isFinite(itemDiscount) && itemDiscount > 0) {
      chunk += " (dto. ítem)"
    }
    if (comment) {
      chunk += ` — ${comment}`
    }
    parts.push(chunk)
  }

  if (lineItems.length > 6) {
    parts.push(`+${lineItems.length - 6} ítems más`)
  }

  if (Number.isFinite(discountTotal) && discountTotal > 0) {
    parts.push(`Descuento general`)
  }

  return parts.length > 0 ? parts.join(" · ") : "—"
}
