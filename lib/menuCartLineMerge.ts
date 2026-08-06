import { defaultItemDiscountFromProduct } from "@/components/sale-operation/saleCatalogProduct"
import type { SaleCatalogProduct } from "@/components/sale-operation/saleCatalogProduct"
import {
  cartItemsMatch,
  normalizeCartItemKind,
  resolveCartLineId,
  type MenuCartItem,
  type MenuCartItemKind,
} from "@/lib/menuCart"
import {
  cartLineHasPaidUnits,
} from "@/lib/partialCheckoutSelection"

export type CartLineOverrideSnapshot = {
  itemDescuentoModo: Record<string, "porcentaje" | "fijo">
  itemDescuentoDraft: Record<string, string>
  itemDescuentoSuprimido: Record<string, true>
  itemComentarios: Record<string, string>
}

export function defaultDiscountFingerprintForProduct(
  product:
    | Pick<
        SaleCatalogProduct,
        "precio" | "precioOriginal" | "discountMode" | "discountValue"
      >
    | null
    | undefined,
): string {
  if (!product) return "none"
  const def = defaultItemDiscountFromProduct(product)
  if (def) return `catalog:${def.mode}:${def.draft}`
  return "none"
}

export function cartLineDiscountFingerprint(
  lineId: string,
  product:
    | Pick<
        SaleCatalogProduct,
        "precio" | "precioOriginal" | "discountMode" | "discountValue"
      >
    | null
    | undefined,
  overrides: CartLineOverrideSnapshot,
): string {
  if (overrides.itemDescuentoSuprimido[lineId]) return "none"
  const draft = overrides.itemDescuentoDraft[lineId] ?? ""
  if (draft.trim() !== "") {
    const mode = overrides.itemDescuentoModo[lineId] ?? "porcentaje"
    const catalogDefault = product
      ? defaultItemDiscountFromProduct(product)
      : null
    if (
      catalogDefault &&
      mode === catalogDefault.mode &&
      draft.trim() === catalogDefault.draft.trim()
    ) {
      return defaultDiscountFingerprintForProduct(product)
    }
    return `manual:${mode}:${draft.trim()}`
  }
  return defaultDiscountFingerprintForProduct(product)
}

export function cartLineCommentFingerprint(
  lineId: string,
  overrides: CartLineOverrideSnapshot,
): string {
  return (overrides.itemComentarios[lineId] ?? "").trim()
}

/** Descuento ingresado a mano distinto al de catálogo (no incluye suprimir catálogo). */
export function cartLineHasPersonalizedManualDiscount(
  lineId: string,
  product:
    | Pick<
        SaleCatalogProduct,
        "precio" | "precioOriginal" | "discountMode" | "discountValue"
      >
    | null
    | undefined,
  overrides: CartLineOverrideSnapshot,
): boolean {
  if (overrides.itemDescuentoSuprimido[lineId]) return false
  const draft = (overrides.itemDescuentoDraft[lineId] ?? "").trim()
  if (!draft) return false
  if (!product) return true
  const catalogDefault = defaultItemDiscountFromProduct(product)
  if (!catalogDefault) return true
  const mode = overrides.itemDescuentoModo[lineId] ?? "porcentaje"
  return (
    mode !== catalogDefault.mode || draft !== catalogDefault.draft.trim()
  )
}

export function findMergeableCartLine(
  carrito: MenuCartItem[],
  productoId: string,
  kind: MenuCartItemKind,
  discountFingerprint: string,
  commentFingerprint: string,
  overrides: CartLineOverrideSnapshot,
  productosByKey: Map<string, { kind: MenuCartItemKind } & SaleCatalogProduct>,
  paidPartialUnits?: Record<string, number>,
): MenuCartItem | undefined {
  if (kind === "promotion") {
    return undefined
  }

  return carrito.find((item) => {
    const itemKind = normalizeCartItemKind(item.kind)
    if (itemKind !== kind || item.productoId !== productoId) return false
    const lineId = resolveCartLineId(item)
    if (
      cartLineHasPaidUnits(lineId, item, paidPartialUnits ?? {}) ||
      item.paidLocked
    ) {
      return false
    }
    const poolKey = `${itemKind}:${item.productoId}`
    const producto = productosByKey.get(poolKey)
    const itemDiscountFp = cartLineDiscountFingerprint(
      lineId,
      producto,
      overrides,
    )
    const itemCommentFp = cartLineCommentFingerprint(lineId, overrides)
    return (
      itemDiscountFp === discountFingerprint &&
      itemCommentFp === commentFingerprint
    )
  })
}

export function cartLinesMatchPromotion(
  a: MenuCartItem,
  promotionId: string,
  selections: MenuCartItem["promotionSelections"],
): boolean {
  return cartItemsMatch(a, promotionId, "promotion", selections)
}

export function createCartLineId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID()
  }
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function ensureCartLineIds(carrito: MenuCartItem[]): MenuCartItem[] {
  let changed = false
  const next = carrito.map((item) => {
    if (item.lineId?.trim()) return item
    changed = true
    return { ...item, lineId: createCartLineId() }
  })
  return changed ? next : carrito
}

/** Separa unidades de una línea del carrito en una línea nueva (mismo producto). */
export function peelCartLineUnits(
  carrito: MenuCartItem[],
  sourceLineId: string,
  peelCount: number,
): { carrito: MenuCartItem[]; peeledLineId: string } | null {
  if (peelCount <= 0) return null
  const idx = carrito.findIndex((i) => resolveCartLineId(i) === sourceLineId)
  if (idx < 0) return null
  const item = carrito[idx]!
  if (item.paidLocked || peelCount >= item.cantidad) return null

  const peeledLineId = createCartLineId()
  const peeled: MenuCartItem = {
    ...item,
    lineId: peeledLineId,
    cantidad: peelCount,
  }
  const remainder: MenuCartItem = {
    ...item,
    cantidad: item.cantidad - peelCount,
  }
  const next = carrito.slice()
  next[idx] = remainder
  next.push(peeled)
  return { carrito: next, peeledLineId }
}

/** Reasigna claves de overrides cuando peelCartLineUnits crea una línea nueva. */
export function remapCommentStorageKeyAfterPeel(
  commentKey: string,
  sourceLineId: string,
  peeledLineId: string,
): string {
  if (commentKey.startsWith("row:")) {
    const rowKey = commentKey.slice(4)
    if (
      rowKey.startsWith(`${sourceLineId}:`) ||
      rowKey.startsWith(`${sourceLineId}@`)
    ) {
      return `row:${peeledLineId}${rowKey.slice(sourceLineId.length)}`
    }
    return commentKey
  }

  if (commentKey === sourceLineId) {
    return peeledLineId
  }

  if (commentKey.startsWith(`combo:${sourceLineId}:`)) {
    return `combo:${peeledLineId}:${commentKey.slice(`combo:${sourceLineId}:`.length)}`
  }

  if (commentKey.startsWith(`combo:${sourceLineId}@`)) {
    return `combo:${peeledLineId}@${commentKey.slice(`combo:${sourceLineId}@`.length)}`
  }

  return commentKey
}

export function applyCartLineQuantityDelta(
  carrito: MenuCartItem[],
  lineId: string,
  delta: number,
): MenuCartItem[] {
  if (delta === 0) return carrito
  return carrito
    .map((i) => {
      if (resolveCartLineId(i) !== lineId) return i
      if (i.paidLocked) return i
      return { ...i, cantidad: Math.max(0, i.cantidad + delta) }
    })
    .filter((i) => i.cantidad > 0)
}

export function normalizeCartLineDiscountDraftForApply(raw: string): {
  draft: string
  suppressCatalog: boolean
} {
  const trimmed = raw.trim()
  if (trimmed === "") {
    return { draft: "", suppressCatalog: true }
  }
  const parsed = Number.parseFloat(trimmed.replace(",", "."))
  if (Number.isFinite(parsed) && parsed <= 0) {
    return { draft: "", suppressCatalog: true }
  }
  return { draft: trimmed, suppressCatalog: false }
}

export type MostradorCartLineEditInput = {
  cartLineId: string
  cartLineTotalCantidad: number | null
  sliceUnits: number
  commentStorageKey: string
  quantityDelta: number
  comment: string
  hasQuantityEdit: boolean
  hasCommentEdit: boolean
  hasDiscountEdit: boolean
  discountMode: "porcentaje" | "fijo"
  discountDraft: string
}
