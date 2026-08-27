import type { CartLineOverrideSnapshot } from "@/lib/menuCartLineMerge"
import {
  normalizeCartItemKind,
  resolveCartLineId,
  type MenuCartItem,
  type MenuCartItemSnapshot,
} from "@/lib/menuCart"
import type { SqlParams } from "@/lib/popLocalDb/database"
import type { PopLocalDatabase } from "@/lib/popLocalDb/database"
import type { PromotionCartSelection } from "@/lib/promotionPricing"

export type SaleCartSnapshot = {
  carrito: MenuCartItem[]
  overrides: CartLineOverrideSnapshot
}

type SqlCartLineRow = {
  line_id: unknown
  sort_order: unknown
  product_id: unknown
  kind: unknown
  quantity: unknown
  snapshot_name: unknown
  snapshot_price: unknown
  snapshot_price_original: unknown
  snapshot_image: unknown
  snapshot_description: unknown
  snapshot_iva: unknown
  snapshot_category: unknown
  snapshot_discount_mode: unknown
  snapshot_discount_value: unknown
  comment: unknown
  discount_mode: unknown
  discount_draft: unknown
  discount_suppressed: unknown
  promotion_selections: unknown
  paid_locked: unknown
}

const UPSERT_LINE_SQL = `
INSERT OR REPLACE INTO sale_cart_lines (
  line_id, sort_order, product_id, kind, quantity,
  snapshot_name, snapshot_price, snapshot_price_original, snapshot_image,
  snapshot_description, snapshot_iva, snapshot_category,
  snapshot_discount_mode, snapshot_discount_value,
  comment, discount_mode, discount_draft, discount_suppressed,
  promotion_selections, paid_locked, updated_at
) VALUES (
  ?, ?, ?, ?, ?,
  ?, ?, ?, ?,
  ?, ?, ?,
  ?, ?,
  ?, ?, ?, ?,
  ?, ?, ?
)
`

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : value == null ? fallback : String(value)
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function asNullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function asBool(value: unknown): boolean {
  return value === 1 || value === true || value === "1"
}

function parseSelections(raw: unknown): PromotionCartSelection[] {
  const list = (() => {
    if (Array.isArray(raw)) return raw
    if (typeof raw === "string" && raw.trim()) {
      try {
        const parsed = JSON.parse(raw) as unknown
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  })()
  return list.flatMap((item) => {
    if (!item || typeof item !== "object") return []
    const row = item as Record<string, unknown>
    const slotId = asString(row.slotId).trim()
    const refId = asString(row.refId).trim()
    if (!slotId || !refId) return []
    return [
      {
        slotId,
        slotLabel: asString(row.slotLabel),
        kind: row.kind === "recipe" ? "recipe" : "article",
        refId,
        name: asString(row.name),
        listUnitPrice: asNumber(row.listUnitPrice),
        slotQuantity: Math.max(1, asNumber(row.slotQuantity, 1)),
        iva: asNumber(row.iva),
      },
    ]
  })
}

function snapshotFromRow(row: SqlCartLineRow): MenuCartItemSnapshot {
  const discountMode =
    row.snapshot_discount_mode === "porcentaje" ||
    row.snapshot_discount_mode === "fijo"
      ? row.snapshot_discount_mode
      : null
  return {
    nombre: asString(row.snapshot_name),
    precio: asNumber(row.snapshot_price),
    precioOriginal: asNullableNumber(row.snapshot_price_original) ?? undefined,
    imagen: asString(row.snapshot_image).trim() || undefined,
    descripcion: asString(row.snapshot_description) || undefined,
    iva: asNullableNumber(row.snapshot_iva) ?? undefined,
    categoria: asString(row.snapshot_category) || undefined,
    discountMode,
    discountValue: asNullableNumber(row.snapshot_discount_value),
  }
}

function lineBindValues(
  item: MenuCartItem,
  sortOrder: number,
  overrides: CartLineOverrideSnapshot,
  updatedAt: string,
): SqlParams {
  const lineId = resolveCartLineId(item)
  const snapshot = item.snapshot
  const discountMode =
    overrides.itemDescuentoModo[lineId] === "fijo" ? "fijo" : "porcentaje"
  const draft = overrides.itemDescuentoDraft[lineId] ?? ""
  return [
    lineId,
    sortOrder,
    item.productoId,
    normalizeCartItemKind(item.kind),
    item.cantidad,
    snapshot?.nombre ?? "",
    snapshot?.precio ?? 0,
    snapshot?.precioOriginal ?? null,
    snapshot?.imagen ?? null,
    snapshot?.descripcion ?? null,
    snapshot?.iva ?? null,
    snapshot?.categoria ?? null,
    snapshot?.discountMode ?? null,
    snapshot?.discountValue ?? null,
    overrides.itemComentarios[lineId] ?? "",
    draft.trim() ? discountMode : null,
    draft,
    overrides.itemDescuentoSuprimido[lineId] === true ? 1 : 0,
    JSON.stringify(item.promotionSelections ?? []),
    item.paidLocked ? 1 : 0,
    updatedAt,
  ]
}

export function listSaleCart(db: PopLocalDatabase): SaleCartSnapshot {
  const rows = db.all(
    `SELECT * FROM sale_cart_lines ORDER BY sort_order ASC, line_id ASC`,
  ) as SqlCartLineRow[]
  const carrito: MenuCartItem[] = []
  const itemDescuentoModo: CartLineOverrideSnapshot["itemDescuentoModo"] = {}
  const itemDescuentoDraft: CartLineOverrideSnapshot["itemDescuentoDraft"] = {}
  const itemDescuentoSuprimido: CartLineOverrideSnapshot["itemDescuentoSuprimido"] =
    {}
  const itemComentarios: CartLineOverrideSnapshot["itemComentarios"] = {}

  for (const row of rows) {
    const lineId = asString(row.line_id).trim()
    const productId = asString(row.product_id).trim()
    if (!lineId || !productId) continue
    const kind = normalizeCartItemKind(asString(row.kind))
    const selections = parseSelections(row.promotion_selections)
    carrito.push({
      lineId,
      productoId: productId,
      cantidad: Math.max(0, asNumber(row.quantity, 1)),
      kind,
      snapshot: snapshotFromRow(row),
      ...(selections.length > 0 ? { promotionSelections: selections } : {}),
      ...(asBool(row.paid_locked) ? { paidLocked: true } : {}),
    })
    const comment = asString(row.comment)
    if (comment) itemComentarios[lineId] = comment
    const draft = asString(row.discount_draft)
    if (draft) itemDescuentoDraft[lineId] = draft
    if (row.discount_mode === "fijo" || row.discount_mode === "porcentaje") {
      itemDescuentoModo[lineId] = row.discount_mode
    }
    if (asBool(row.discount_suppressed)) itemDescuentoSuprimido[lineId] = true
  }

  return {
    carrito: carrito.filter((item) => item.cantidad > 0),
    overrides: {
      itemDescuentoModo,
      itemDescuentoDraft,
      itemDescuentoSuprimido,
      itemComentarios,
    },
  }
}

export function replaceSaleCart(
  db: PopLocalDatabase,
  carrito: MenuCartItem[],
  overrides: CartLineOverrideSnapshot,
  updatedAt = new Date().toISOString(),
) {
  db.transaction(() => {
    db.run("DELETE FROM sale_cart_lines")
    carrito.forEach((item, index) => {
      if (item.cantidad <= 0) return
      db.run(UPSERT_LINE_SQL, lineBindValues(item, index, overrides, updatedAt))
    })
  })
}
