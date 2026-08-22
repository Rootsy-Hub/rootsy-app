export type CashRegisterOperationSaleLine = {
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
  discountAmount: number
  discountLabel: string | null
  comment: string | null
  extras: string | null
}

export type CashRegisterOperationSaleTicket = {
  lines: CashRegisterOperationSaleLine[]
  generalDiscountAmount: number
}

function parseMoney(value: unknown): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100) / 100
}

function parseQty(value: unknown): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return 1
  return Math.round(n * 1000) / 1000
}

function formatDiscountMoney(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDiscountLabel(
  mode: unknown,
  value: unknown,
  amount: number,
): string | null {
  if (!(amount > 0)) return null
  if (mode === "porcentaje") {
    const pct = Number(value)
    if (Number.isFinite(pct) && pct > 0) {
      const pctText = pct % 1 === 0 ? String(pct) : pct.toFixed(1)
      return `Descuento −${pctText}%`
    }
  }
  return `Descuento −${formatDiscountMoney(amount)}`
}

function extrasFromPromotion(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null
  const components = (raw as { components?: unknown }).components
  if (!Array.isArray(components) || components.length === 0) return null
  const names = components
    .map((item) => {
      if (!item || typeof item !== "object") return ""
      return String(
        (item as { name_snapshot?: unknown }).name_snapshot ?? "",
      ).trim()
    })
    .filter(Boolean)
  return names.length > 0 ? names.join(" · ") : null
}

export function parseCashRegisterSaleTicket(
  lineItemsRaw: unknown,
  discountTotal: number,
): CashRegisterOperationSaleTicket {
  const lines: CashRegisterOperationSaleLine[] = []
  const rawLines = Array.isArray(lineItemsRaw) ? lineItemsRaw : []

  for (const row of rawLines) {
    if (!row || typeof row !== "object") continue
    const o = row as Record<string, unknown>
    const name = String(o.name_snapshot ?? "—").trim() || "—"
    const quantity = parseQty(o.quantity)
    const unitPrice = parseMoney(o.unit_price)
    const lineTotal = parseMoney(o.line_total)
    const discountAmount = parseMoney(o.item_discount_amount)
    const comment =
      typeof o.comment === "string" && o.comment.trim()
        ? o.comment.trim()
        : null

    lines.push({
      name,
      quantity,
      unitPrice,
      lineTotal,
      discountAmount,
      discountLabel: formatDiscountLabel(
        o.item_discount_mode,
        o.item_discount_value,
        discountAmount,
      ),
      comment,
      extras: extrasFromPromotion(o.promotion_snapshot),
    })
  }

  return {
    lines,
    generalDiscountAmount:
      Number.isFinite(discountTotal) && discountTotal > 0
        ? Math.round(discountTotal * 100) / 100
        : 0,
  }
}

export function formatCashRegisterSaleDetail(
  lineItemsRaw: unknown,
  discountTotal: number,
): string {
  const ticket = parseCashRegisterSaleTicket(lineItemsRaw, discountTotal)
  const parts = ticket.lines.slice(0, 6).map((line) => {
    let chunk = `${line.quantity}× ${line.name}`
    if (line.discountLabel) chunk += ` (${line.discountLabel})`
    if (line.comment) chunk += ` — ${line.comment}`
    return chunk
  })

  if (ticket.lines.length > 6) {
    parts.push(`+${ticket.lines.length - 6} ítems más`)
  }
  if (ticket.generalDiscountAmount > 0) {
    parts.push("Descuento general")
  }

  return parts.length > 0 ? parts.join(" · ") : "—"
}
