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
import {
  resolveMenuCartCatalogProduct,
  snapshotFromCatalogProduct,
  type MenuCatalogProduct,
} from "@/lib/menuCatalogProduct"
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
  remapCommentStorageKeyAfterPeel,
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

export function mapMenuCartToDetallados<T extends MenuCartItem>(
  source: T[],
  productosByKey: Map<string, MenuCatalogProduct>,
) {
  return source.map((item) => {
    const kind = normalizeCartItemKind(item.kind)
    return {
      ...item,
      kind,
      lineId: resolveCartLineId({ ...item, kind }),
      cartLineKey: resolveCartLineId({ ...item, kind }),
      producto: resolveMenuCartCatalogProduct(
        productosByKey,
        item.productoId,
        kind,
        item.snapshot,
      ),
    }
  })
}

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

  const itemsDetallados = mapMenuCartToDetallados(
    input.carrito,
    input.productosByKey,
  )

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
      targetCommentKey = remapCommentStorageKeyAfterPeel(
        targetCommentKey,
        input.edit.cartLineId,
        peeled.peeledLineId,
      )
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

export type TicketCartMutationResult = {
  carrito: MenuCartItem[]
  paidPartialUnits: PartialPaymentSelection
  overrideCopies: Array<{ fromLineId: string; toLineId: string }>
  affectedLineId: string
}

function materializeTicketCartAfterMutation(
  carrito: MenuCartItem[],
  paidPartialUnits?: PartialPaymentSelection,
): Omit<TicketCartMutationResult, "affectedLineId"> {
  const paid = paidPartialUnits ?? {}
  const needsMaterialize =
    carrito.some((item) => item.paidLocked) ||
    Object.values(paid).some((value) => Number(value) > 0)
  if (!needsMaterialize) {
    return { carrito, paidPartialUnits: paid, overrideCopies: [] }
  }
  const materialized = materializePaidCartLines({ carrito, paidPartialUnits: paid })
  return {
    carrito: materialized.carrito,
    paidPartialUnits: materialized.paidPartialUnits,
    overrideCopies: materialized.overrideCopies,
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
  quantity?: number
}): TicketCartMutationResult {
  const quantity = Math.max(1, Math.round(input.quantity ?? 1))
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

  const paidPartialUnits = input.paidPartialUnits ?? {}
  const mergeTarget = findMergeableCartLine(
    input.carrito,
    input.productoId,
    kind,
    discountFp,
    commentFp,
    input.overrides,
    input.productosByKey,
    paidPartialUnits,
  )
  if (mergeTarget) {
    const mergeTargetId = resolveCartLineId(mergeTarget)
    const canMerge =
      !mergeTarget.paidLocked &&
      !cartLineHasPaidUnits(mergeTargetId, mergeTarget, paidPartialUnits)
    if (canMerge) {
      const merged = input.carrito.map((i) =>
        resolveCartLineId(i) === mergeTargetId
          ? { ...i, cantidad: i.cantidad + quantity }
          : i,
      )
      return {
        ...materializeTicketCartAfterMutation(merged, paidPartialUnits),
        affectedLineId: mergeTargetId,
      }
    }
  }
  const lineId = createCartLineId()
  if (product?.kind === "article") {
    seedCartLineDefaultDiscount(product, lineId, input.overrideActions)
  }
  return {
    ...materializeTicketCartAfterMutation(
      [
        ...input.carrito,
        {
          lineId,
          productoId: input.productoId,
          cantidad: quantity,
          kind,
          ...(product
            ? { snapshot: snapshotFromCatalogProduct(product) }
            : {}),
        },
      ],
      paidPartialUnits,
    ),
    affectedLineId: lineId,
  }
}

export function addPromotionToTicketCart(input: {
  carrito: MenuCartItem[]
  promotionId: string
  selections: PromotionCartSelection[]
  paidPartialUnits?: Record<string, number>
  snapshot?: MenuCartItem["snapshot"]
}): TicketCartMutationResult {
  const paidPartialUnits = input.paidPartialUnits ?? {}
  const existe = input.carrito.find((i) => {
    if (i.paidLocked) return false
    if (cartLineHasPaidUnits(resolveCartLineId(i), i, paidPartialUnits)) {
      return false
    }
    return cartLinesMatchPromotion(i, input.promotionId, input.selections)
  })
  if (existe) {
    const existenteId = resolveCartLineId(existe)
    const merged = input.carrito.map((i) =>
      cartLinesMatchPromotion(i, input.promotionId, input.selections)
        ? { ...i, cantidad: i.cantidad + 1 }
        : i,
    )
    return {
      ...materializeTicketCartAfterMutation(merged, paidPartialUnits),
      affectedLineId: existenteId,
    }
  }
  const lineId = createCartLineId()
  return {
    ...materializeTicketCartAfterMutation(
      [
        ...input.carrito,
        {
          lineId,
          productoId: input.promotionId,
          cantidad: 1,
          kind: "promotion" as const,
          promotionSelections: input.selections,
          ...(input.snapshot ? { snapshot: input.snapshot } : {}),
        },
      ],
      paidPartialUnits,
    ),
    affectedLineId: lineId,
  }
}

export function buildProductMapFromSaleCatalog(
  products: SaleCatalogProduct[],
): Map<string, MenuCatalogProduct> {
  return buildMenuProductMap(products.map(saleProductToMenuCatalogProduct))
}

export type TicketCartOverrideState = OperationCartLineOverrideState
