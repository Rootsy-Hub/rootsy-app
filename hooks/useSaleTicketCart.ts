"use client"

import type {
  MenuCatalogArticle,
  MenuCatalogPromotion,
} from "@/app/[siteId]/[popId]/menu-catalog/actions"
import {
  clearCartLineOverrides,
  seedCartLineDefaultDiscount,
  type OperationCartLineOverrideActions,
  type OperationCartLineOverrideState,
} from "@/components/sale-operation/OperationCartLineRow"
import {
  buildMenuProductMap,
  computeMenuQuantityDealApplications,
  computeMenuQuantityDealDiscounts,
  buildMenuCartTotalsLines,
  menuCartOrderTotals,
  menuPromotionToProduct,
  removeQuantityDealApplicationFromCart,
  tryAutoComboSelections,
} from "@/lib/menuCheckoutPromotions"
import {
  buildMostradorCartDisplayRows,
  cartDetailItemsFromCarrito,
  countAppliedPromotions,
} from "@/lib/mostradorCartDisplay"
import {
  applyTicketLineEdit,
  addPromotionToTicketCart,
} from "@/lib/menuSaleTicketCart"
import {
  cartLinesMatchPromotion,
  createCartLineId,
  defaultDiscountFingerprintForProduct,
  ensureCartLineIds,
  findMergeableCartLine,
  type MostradorCartLineEditInput,
} from "@/lib/menuCartLineMerge"
import { menuArticleToProduct } from "@/lib/menuCatalogProduct"
import type { PromotionCartSelection } from "@/lib/promotionPricing"
import {
  normalizeCartItemKind,
  resolveCartLineId,
  type MenuCartItem,
  type MenuCartItemKind,
} from "@/lib/menuCart"
import { useCallback, useEffect, useMemo, useState } from "react"

export function useSaleTicketCart(input: {
  menuArticles: MenuCatalogArticle[]
  menuPromotions: MenuCatalogPromotion[]
  menuQuantityDeals: MenuCatalogPromotion[]
}) {
  const { menuArticles, menuPromotions, menuQuantityDeals } = input

  const [carrito, setCarrito] = useState<MenuCartItem[]>([])
  const [itemDetalleAbiertoId, setItemDetalleAbiertoId] = useState<string | null>(
    null,
  )
  const [itemDescuentoModo, setItemDescuentoModo] = useState<
    Record<string, "porcentaje" | "fijo">
  >({})
  const [itemDescuentoDraft, setItemDescuentoDraft] = useState<
    Record<string, string>
  >({})
  const [itemDescuentoSuprimido, setItemDescuentoSuprimido] = useState<
    Record<string, true>
  >({})
  const [itemComentarios, setItemComentarios] = useState<Record<string, string>>(
    {},
  )
  const [promoWizardOpen, setPromoWizardOpen] = useState(false)
  const [promoWizardTarget, setPromoWizardTarget] =
    useState<MenuCatalogPromotion | null>(null)

  useEffect(() => {
    setCarrito((prev) => ensureCartLineIds(prev))
  }, [])

  const productosCatalogo = useMemo(
    () => [
      ...menuPromotions.map(menuPromotionToProduct),
      ...menuArticles.map(menuArticleToProduct),
    ],
    [menuPromotions, menuArticles],
  )

  const productosByKey = useMemo(
    () => buildMenuProductMap(productosCatalogo),
    [productosCatalogo],
  )

  const overrideSnapshot = useMemo(
    () => ({
      itemDescuentoModo,
      itemDescuentoDraft,
      itemDescuentoSuprimido,
      itemComentarios,
    }),
    [
      itemDescuentoModo,
      itemDescuentoDraft,
      itemDescuentoSuprimido,
      itemComentarios,
    ],
  )

  const quantityDealApplications = useMemo(
    () =>
      computeMenuQuantityDealApplications({
        carrito,
        productosByKey,
        quantityDeals: menuQuantityDeals,
        overrides: overrideSnapshot,
      }),
    [carrito, productosByKey, menuQuantityDeals, overrideSnapshot],
  )

  const quantityDealDiscounts = useMemo(
    () =>
      computeMenuQuantityDealDiscounts({
        carrito,
        productosByKey,
        quantityDeals: menuQuantityDeals,
        overrides: overrideSnapshot,
      }),
    [carrito, productosByKey, menuQuantityDeals, overrideSnapshot],
  )

  const itemsDetallados = useMemo(
    () =>
      carrito
        .map((i) => {
          const kind = normalizeCartItemKind(i.kind)
          const producto = productosByKey.get(`${kind}:${i.productoId}`) ?? null
          if (kind === "promotion" && !i.promotionSelections?.length) {
            return null
          }
          if (kind !== "promotion" && !producto) return null
          return {
            ...i,
            kind,
            lineId: resolveCartLineId({ ...i, kind }),
            cartLineKey: resolveCartLineId({ ...i, kind }),
            producto,
          }
        })
        .filter((i): i is NonNullable<typeof i> => i != null),
    [carrito, productosByKey],
  )

  const cartDisplayRows = useMemo(
    () =>
      buildMostradorCartDisplayRows({
        items: cartDetailItemsFromCarrito(itemsDetallados),
        applications: quantityDealApplications,
        overrides: overrideSnapshot,
        productosByKey,
      }),
    [itemsDetallados, quantityDealApplications, overrideSnapshot, productosByKey],
  )

  const comboPromoLineCount = useMemo(
    () =>
      carrito.reduce(
        (sum, item) =>
          normalizeCartItemKind(item.kind) === "promotion"
            ? sum + item.cantidad
            : sum,
        0,
      ),
    [carrito],
  )

  const promocionesAplicadasCount = useMemo(
    () =>
      countAppliedPromotions({
        applications: quantityDealApplications,
        comboLineCount: comboPromoLineCount,
      }),
    [quantityDealApplications, comboPromoLineCount],
  )

  const cartTotalsInput = useMemo(
    () =>
      buildMenuCartTotalsLines({
        items: itemsDetallados,
        quantityDealApplications,
        quantityDealDiscounts,
        itemDescuentoModo,
        itemDescuentoDraft,
        itemDescuentoSuprimido,
      }),
    [
      itemsDetallados,
      quantityDealApplications,
      quantityDealDiscounts,
      itemDescuentoModo,
      itemDescuentoDraft,
      itemDescuentoSuprimido,
    ],
  )

  const catalogTotals = useMemo(
    () => menuCartOrderTotals(cartTotalsInput),
    [cartTotalsInput],
  )

  const promocionesAplicadasMonto = useMemo(
    () =>
      catalogTotals.descuentoPromoMonto +
      catalogTotals.descuentoQuantityDealMonto,
    [
      catalogTotals.descuentoPromoMonto,
      catalogTotals.descuentoQuantityDealMonto,
    ],
  )

  const cartLineOverrideActions: OperationCartLineOverrideActions & {
    setItemDetalleAbiertoId: typeof setItemDetalleAbiertoId
  } = useMemo(
    () => ({
      toggleItemDetalle: (lineKey: string) => {
        setItemDetalleAbiertoId((prev) => (prev === lineKey ? null : lineKey))
      },
      setItemDescuentoModo,
      setItemDescuentoDraft,
      setItemDescuentoSuprimido,
      setItemComentarios,
      setItemDetalleAbiertoId,
    }),
    [],
  )

  const cartLineOverrides: OperationCartLineOverrideState = useMemo(
    () => ({
      itemDetalleAbiertoId,
      itemDescuentoModo,
      itemDescuentoDraft,
      itemDescuentoSuprimido,
      itemComentarios,
    }),
    [
      itemDetalleAbiertoId,
      itemDescuentoModo,
      itemDescuentoDraft,
      itemDescuentoSuprimido,
      itemComentarios,
    ],
  )

  const agregarPromoAlCarrito = useCallback(
    (promotionId: string, selections: PromotionCartSelection[]) => {
      setCarrito((prev) =>
        addPromotionToTicketCart({
          carrito: prev,
          promotionId,
          selections,
        }).carrito,
      )
    },
    [],
  )

  const confirmarPromoWizard = useCallback(
    (promotionId: string, selections: PromotionCartSelection[]) => {
      agregarPromoAlCarrito(promotionId, selections)
      setPromoWizardTarget(null)
    },
    [agregarPromoAlCarrito],
  )

  const agregarAlCarrito = useCallback(
    (productoId: string, kindHint?: MenuCartItemKind) => {
      const product =
        (kindHint
          ? productosByKey.get(`${kindHint}:${productoId}`)
          : null) ??
        productosByKey.get(`promotion:${productoId}`) ??
        productosByKey.get(`article:${productoId}`)

      const kind = product?.kind ?? kindHint ?? "article"

      if (kind === "promotion" && product?.promotionMeta) {
        const auto = tryAutoComboSelections(product.promotionMeta)
        if (auto) {
          agregarPromoAlCarrito(productoId, auto)
          return
        }
        setPromoWizardTarget(product.promotionMeta)
        setPromoWizardOpen(true)
        return
      }

      const overrideSnap = {
        itemDescuentoModo,
        itemDescuentoDraft,
        itemDescuentoSuprimido,
        itemComentarios,
      }
      const discountFp = defaultDiscountFingerprintForProduct(product)
      const commentFp = ""

      setCarrito((prev) => {
        const mergeTarget = findMergeableCartLine(
          prev,
          productoId,
          kind,
          discountFp,
          commentFp,
          overrideSnap,
          productosByKey,
        )
        const mergeTargetId = mergeTarget ? resolveCartLineId(mergeTarget) : null
        if (mergeTarget && mergeTargetId) {
          return prev.map((i) =>
            resolveCartLineId(i) === mergeTargetId
              ? { ...i, cantidad: i.cantidad + 1 }
              : i,
          )
        }
        const lineId = createCartLineId()
        if (product?.kind === "article") {
          seedCartLineDefaultDiscount(product, lineId, cartLineOverrideActions)
        }
        return [...prev, { lineId, productoId, cantidad: 1, kind }]
      })
    },
    [
      productosByKey,
      itemDescuentoModo,
      itemDescuentoDraft,
      itemDescuentoSuprimido,
      itemComentarios,
      cartLineOverrideActions,
      agregarPromoAlCarrito,
    ],
  )

  const aplicarEdicionLineaTicket = useCallback(
    (input: MostradorCartLineEditInput) => {
      applyTicketLineEdit({
        edit: input,
        carrito,
        setCarrito,
        setters: {
          setItemDescuentoModo,
          setItemDescuentoDraft,
          setItemDescuentoSuprimido,
          setItemComentarios,
        },
      })
    },
    [carrito],
  )

  const cambiarCantidadPorLinea = useCallback(
    (lineId: string, delta: number) => {
      setCarrito((prev) => {
        const next = prev
          .map((i) =>
            resolveCartLineId(i) === lineId
              ? { ...i, cantidad: Math.max(0, i.cantidad + delta) }
              : i,
          )
          .filter((i) => i.cantidad > 0)
        if (delta < 0 && !next.some((i) => resolveCartLineId(i) === lineId)) {
          clearCartLineOverrides(lineId, cartLineOverrideActions)
          setItemComentarios((comments) => {
            const prefix = `combo:${lineId}:`
            const cleaned = { ...comments }
            for (const key of Object.keys(cleaned)) {
              if (key.startsWith(prefix)) delete cleaned[key]
            }
            return cleaned
          })
        }
        return next
      })
    },
    [cartLineOverrideActions],
  )

  const quitarQuantityDealApplication = useCallback(
    (applicationId: string) => {
      const application = quantityDealApplications.find(
        (a) => a.id === applicationId,
      )
      if (!application) return
      setCarrito((prev) =>
        removeQuantityDealApplicationFromCart(prev, application),
      )
      for (const lineKey of Object.keys(application.unitsPerLineKey)) {
        clearCartLineOverrides(lineKey, cartLineOverrideActions)
      }
      for (const lineKey of Object.keys(application.discountByLineKey)) {
        clearCartLineOverrides(lineKey, cartLineOverrideActions)
      }
    },
    [quantityDealApplications, cartLineOverrideActions],
  )

  const limpiarCarrito = useCallback(() => {
    setCarrito([])
    setItemDetalleAbiertoId(null)
    setItemComentarios({})
    setItemDescuentoModo({})
    setItemDescuentoDraft({})
    setItemDescuentoSuprimido({})
    setPromoWizardOpen(false)
    setPromoWizardTarget(null)
  }, [])

  return {
    carrito,
    productosCatalogo,
    cartDisplayRows,
    itemsDetallados,
    catalogTotals,
    cartLineOverrides,
    itemComentarios,
    quantityDealDiscounts,
    quantityDealApplications,
    promocionesAplicadasMonto,
    promocionesAplicadasCount,
    agregarAlCarrito,
    aplicarEdicionLineaTicket,
    cambiarCantidadPorLinea,
    quitarQuantityDealApplication,
    limpiarCarrito,
    promoWizardOpen,
    setPromoWizardOpen,
    promoWizardTarget,
    confirmarPromoWizard,
  }
}
