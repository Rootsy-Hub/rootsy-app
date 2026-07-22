"use client"

import type {
  OperationCartLineOverrideActions,
  OperationCartLineOverrideState,
} from "@/components/sale-operation/OperationCartLineRow"
import { seedCartLineDefaultDiscount } from "@/components/sale-operation/OperationCartLineRow"
import type { SaleCatalogProduct } from "@/components/sale-operation/saleCatalogProduct"
import {
  buildMostradorCartDisplayRows,
  cartDetailItemsFromCarrito,
  countAppliedPromotions,
} from "@/lib/mostradorCartDisplay"
import type { MenuCatalogProduct } from "@/lib/menuCatalogProduct"
import {
  computeMenuQuantityDealApplications,
  computeMenuQuantityDealDiscounts,
  buildMenuProductMap,
} from "@/lib/menuCheckoutPromotions"
import type { MenuCatalogPromotion } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import {
  applyCartLineQuantityDelta,
  cartLineCommentFingerprint,
  cartLinesMatchPromotion,
  createCartLineId,
  defaultDiscountFingerprintForProduct,
  findMergeableCartLine,
  normalizeCartLineDiscountDraftForApply,
  peelCartLineUnits,
  type CartLineOverrideSnapshot,
  type MostradorCartLineEditInput,
} from "@/lib/menuCartLineMerge"
import {
  normalizeCartItemKind,
  resolveCartLineId,
  type MenuCartItem,
  type MenuCartItemKind,
} from "@/lib/menuCart"
import type { PromotionCartSelection } from "@/lib/promotionPricing"
import {
  cartLineHasPaidUnits,
  materializePaidCartLines,
  type PartialPaymentSelection,
} from "@/lib/partialCheckoutSelection"
import type { Dispatch, SetStateAction } from "react"

export function saleProductToMenuCatalogProduct(
  product: SaleCatalogProduct,
): MenuCatalogProduct {
  return {
    ...product,
    kind: "article",
    section: "products",
    categoriaFiltro: "products:all",
  }
}

export function buildTicketCartDisplayRows(input: {
  carrito: MenuCartItem[]
  productosByKey: Map<string, MenuCatalogProduct>
  quantityDeals: MenuCatalogPromotion[]
  overrides: CartLineOverrideSnapshot
}) {
  const quantityDealApplications = computeMenuQuantityDealApplications({
    carrito: input.carrito,
    productosByKey: input.productosByKey,
    quantityDeals: input.quantityDeals,
    overrides: input.overrides,
  })

  const itemsDetallados = input.carrito
    .map((i) => {
      const kind = normalizeCartItemKind(i.kind)
      const producto = input.productosByKey.get(`${kind}:${i.productoId}`) ?? null
      if (kind === "promotion" && !i.promotionSelections?.length) return null
      if (kind !== "promotion" && !producto) return null
      return {
        ...i,
        kind,
        lineId: resolveCartLineId({ ...i, kind }),
        cartLineKey: resolveCartLineId({ ...i, kind }),
        producto,
      }
    })
    .filter((i): i is NonNullable<typeof i> => i != null)

  const cartDisplayRows = buildMostradorCartDisplayRows({
    items: cartDetailItemsFromCarrito(itemsDetallados),
    applications: quantityDealApplications,
    overrides: input.overrides,
    productosByKey: input.productosByKey,
  })

  const comboPromoLineCount = input.carrito.reduce(
    (sum, item) =>
      normalizeCartItemKind(item.kind) === "promotion" ? sum + item.cantidad : sum,
    0,
  )

  return {
    itemsDetallados,
    cartDisplayRows,
    quantityDealApplications,
    quantityDealDiscounts: computeMenuQuantityDealDiscounts({
      carrito: input.carrito,
      productosByKey: input.productosByKey,
      quantityDeals: input.quantityDeals,
      overrides: input.overrides,
    }),
    promocionesAplicadasCount: countAppliedPromotions({
      applications: quantityDealApplications,
      comboLineCount: comboPromoLineCount,
    }),
  }
}

export function copyTicketLineOverrides(
  fromLineId: string,
  toLineId: string,
  setters: {
    setItemDescuentoModo: Dispatch<SetStateAction<Record<string, "porcentaje" | "fijo">>>
    setItemDescuentoDraft: Dispatch<SetStateAction<Record<string, string>>>
    setItemDescuentoSuprimido: Dispatch<SetStateAction<Record<string, true>>>
    setItemComentarios: Dispatch<SetStateAction<Record<string, string>>>
  },
) {
  setters.setItemDescuentoModo((prev) => {
    if (!(fromLineId in prev)) return prev
    return { ...prev, [toLineId]: prev[fromLineId]! }
  })
  setters.setItemDescuentoDraft((prev) => {
    if (!(fromLineId in prev)) return prev
    return { ...prev, [toLineId]: prev[fromLineId]! }
  })
  setters.setItemDescuentoSuprimido((prev) => {
    if (prev[fromLineId] !== true) return prev
    return { ...prev, [toLineId]: true }
  })
  setters.setItemComentarios((prev) => {
    if (!(fromLineId in prev)) return prev
    return { ...prev, [toLineId]: prev[fromLineId]! }
  })
}

export function applyTicketLineEdit(input: {
  edit: MostradorCartLineEditInput
  carrito: MenuCartItem[]
  setCarrito: Dispatch<SetStateAction<MenuCartItem[]>>
  setters: {
    setItemDescuentoModo: Dispatch<SetStateAction<Record<string, "porcentaje" | "fijo">>>
    setItemDescuentoDraft: Dispatch<SetStateAction<Record<string, string>>>
    setItemDescuentoSuprimido: Dispatch<SetStateAction<Record<string, true>>>
    setItemComentarios: Dispatch<SetStateAction<Record<string, string>>>
  }
}) {
  const sourceLine = input.carrito.find(
    (item) => resolveCartLineId(item) === input.edit.cartLineId,
  )
  if (sourceLine?.paidLocked) {
    return
  }

  const needsPeel =
    input.edit.cartLineTotalCantidad != null &&
    input.edit.sliceUnits < input.edit.cartLineTotalCantidad &&
    (input.edit.hasQuantityEdit ||
      input.edit.hasCommentEdit ||
      input.edit.hasDiscountEdit)

  let targetLineId = input.edit.cartLineId
  let targetCommentKey = input.edit.commentStorageKey
  let nextCart = input.carrito

  if (needsPeel) {
    const peeled = peelCartLineUnits(
      nextCart,
      input.edit.cartLineId,
      input.edit.sliceUnits,
    )
    if (peeled) {
      nextCart = peeled.carrito
      targetLineId = peeled.peeledLineId
      if (targetCommentKey === input.edit.cartLineId) {
        targetCommentKey = peeled.peeledLineId
      }
    }
  }

  if (input.edit.hasQuantityEdit && input.edit.quantityDelta !== 0) {
    nextCart = applyCartLineQuantityDelta(
      nextCart,
      targetLineId,
      input.edit.quantityDelta,
    )
  }

  input.setCarrito(nextCart)

  if (needsPeel && targetLineId !== input.edit.cartLineId) {
    copyTicketLineOverrides(input.edit.cartLineId, targetLineId, input.setters)
  }

  if (input.edit.hasCommentEdit) {
    input.setters.setItemComentarios((prev) => ({
      ...prev,
      [targetCommentKey]: input.edit.comment,
    }))
  }

  if (input.edit.hasDiscountEdit) {
    const normalized = normalizeCartLineDiscountDraftForApply(
      input.edit.discountDraft,
    )
    if (normalized.suppressCatalog) {
      input.setters.setItemDescuentoDraft((prev) => ({
        ...prev,
        [targetLineId]: "",
      }))
      input.setters.setItemDescuentoSuprimido((prev) => ({
        ...prev,
        [targetLineId]: true,
      }))
    } else {
      const nextValue =
        input.edit.discountMode === "porcentaje"
          ? String(Math.min(100, Math.max(0, Number(normalized.draft))))
          : normalized.draft
      input.setters.setItemDescuentoSuprimido((prev) => {
        if (!(targetLineId in prev)) return prev
        const next = { ...prev }
        delete next[targetLineId]
        return next
      })
      input.setters.setItemDescuentoDraft((prev) => ({
        ...prev,
        [targetLineId]: nextValue,
      }))
      input.setters.setItemDescuentoModo((prev) => ({
        ...prev,
        [targetLineId]: input.edit.discountMode,
      }))
    }
  }
}

export function applyPartialPaymentCartMaterialization(input: {
  carrito: MenuCartItem[]
  paidPartialUnits: PartialPaymentSelection
  setters: {
    setItemDescuentoModo: Dispatch<
      SetStateAction<Record<string, "porcentaje" | "fijo">>
    >
    setItemDescuentoDraft: Dispatch<SetStateAction<Record<string, string>>>
    setItemDescuentoSuprimido: Dispatch<SetStateAction<Record<string, true>>>
    setItemComentarios: Dispatch<SetStateAction<Record<string, string>>>
  }
}): { carrito: MenuCartItem[]; paidPartialUnits: PartialPaymentSelection } {
  const materialized = materializePaidCartLines({
    carrito: input.carrito,
    paidPartialUnits: input.paidPartialUnits,
  })
  for (const { fromLineId, toLineId } of materialized.overrideCopies) {
    copyTicketLineOverrides(fromLineId, toLineId, input.setters)
  }
  return {
    carrito: materialized.carrito,
    paidPartialUnits: materialized.paidPartialUnits,
  }
}

export function addProductToTicketCart(input: {
  carrito: MenuCartItem[]
  productoId: string
  kindHint?: MenuCartItemKind
  productosByKey: Map<string, MenuCatalogProduct>
  overrides: CartLineOverrideSnapshot
  overrideActions: Pick<
    OperationCartLineOverrideActions,
    "setItemDescuentoModo" | "setItemDescuentoDraft" | "setItemDescuentoSuprimido"
  >
  paidPartialUnits?: Record<string, number>
}): MenuCartItem[] {
  const product =
    (input.kindHint
      ? input.productosByKey.get(`${input.kindHint}:${input.productoId}`)
      : null) ??
    input.productosByKey.get(`promotion:${input.productoId}`) ??
    input.productosByKey.get(`article:${input.productoId}`) ??
    input.productosByKey.get(`recipe:${input.productoId}`)
  const kind = product?.kind ?? input.kindHint ?? "article"
  const discountFp = defaultDiscountFingerprintForProduct(product)
  const commentFp = ""

  const mergeTarget = findMergeableCartLine(
    input.carrito,
    input.productoId,
    kind,
    discountFp,
    commentFp,
    input.overrides,
    input.productosByKey,
    input.paidPartialUnits,
  )
  if (mergeTarget) {
    return input.carrito.map((i) =>
      i.lineId === mergeTarget.lineId
        ? { ...i, cantidad: i.cantidad + 1 }
        : i,
    )
  }
  const lineId = createCartLineId()
  if (product?.kind === "article") {
    seedCartLineDefaultDiscount(product, lineId, input.overrideActions)
  }
  return [...input.carrito, { lineId, productoId: input.productoId, cantidad: 1, kind }]
}

export function addPromotionToTicketCart(input: {
  carrito: MenuCartItem[]
  promotionId: string
  selections: PromotionCartSelection[]
  paidPartialUnits?: Record<string, number>
}): MenuCartItem[] {
  const existe = input.carrito.find((i) => {
    if (i.paidLocked) return false
    if (cartLineHasPaidUnits(resolveCartLineId(i), i, input.paidPartialUnits ?? {})) {
      return false
    }
    return cartLinesMatchPromotion(i, input.promotionId, input.selections)
  })
  if (existe) {
    return input.carrito.map((i) =>
      cartLinesMatchPromotion(i, input.promotionId, input.selections)
        ? { ...i, cantidad: i.cantidad + 1 }
        : i,
    )
  }
  const lineId = createCartLineId()
  return [
    ...input.carrito,
    {
      lineId,
      productoId: input.promotionId,
      cantidad: 1,
      kind: "promotion" as const,
      promotionSelections: input.selections,
    },
  ]
}

export function buildProductMapFromSaleCatalog(
  products: SaleCatalogProduct[],
): Map<string, MenuCatalogProduct> {
  return buildMenuProductMap(products.map(saleProductToMenuCatalogProduct))
}

export type TicketCartOverrideState = OperationCartLineOverrideState
