"use client"

import type { MenuCatalogPromotion } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import {
  clearCartLineOverrides,
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
  clearComboCommentsForCartLine,
  countAppliedPromotions,
} from "@/lib/mostradorCartDisplay"
import {
  applyTicketLineEdit,
  addPromotionToTicketCart,
  addProductToTicketCart,
  mapMenuCartToDetallados,
} from "@/lib/menuSaleTicketCart"
import {
  ensureCartLineIds,
  type MostradorCartLineEditInput,
} from "@/lib/menuCartLineMerge"
import {
  catalogProductFromCartSnapshot,
  menuArticleToProduct,
  snapshotFromCatalogProduct,
} from "@/lib/menuCatalogProduct"
import { usePopLocalDb } from "@/hooks/usePopLocalDb"
import {
  getArticleById,
  listSaleCart,
  openPopLocalDb,
  replaceSaleCart,
} from "@/lib/popLocalDb"
import { articleSnapshotToSaleCatalogArticle } from "@/lib/saleCatalogArticleMap"
import { useSalePriceListId } from "@/lib/salePriceListSession"
import type { TableSessionCheckoutSnapshot } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import type { PromotionCartSelection } from "@/lib/promotionPricing"
import {
  normalizeCartItemKind,
  resolveCartLineId,
  type MenuCartItem,
  type MenuCartItemKind,
} from "@/lib/menuCart"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export function useSaleTicketCart(input: {
  popId: string | undefined
  menuPromotions: MenuCatalogPromotion[]
  menuQuantityDeals: MenuCatalogPromotion[]
  onCartLineAdded?: (lineId: string) => void
}) {
  const { popId, menuPromotions, menuQuantityDeals, onCartLineAdded } = input
  const localStatus = usePopLocalDb(popId)
  const sqliteReady = localStatus === "ready"
  const priceListId = useSalePriceListId(popId)
  const skipPersistRef = useRef(true)

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
  const [cartHydrated, setCartHydrated] = useState(false)

  useEffect(() => {
    skipPersistRef.current = true
    setCartHydrated(false)
    setCarrito([])
    setItemDetalleAbiertoId(null)
    setItemDescuentoModo({})
    setItemDescuentoDraft({})
    setItemDescuentoSuprimido({})
    setItemComentarios({})
    setPromoWizardOpen(false)
    setPromoWizardTarget(null)
  }, [popId])

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

  useEffect(() => {
    if (localStatus === "fallback") {
      skipPersistRef.current = true
      setCartHydrated(true)
    }
  }, [localStatus])

  useEffect(() => {
    if (!popId || !sqliteReady) return
    let cancelled = false
    skipPersistRef.current = true
    void openPopLocalDb(popId).then((handle) => {
      if (cancelled) return
      const loaded = listSaleCart(handle.database)
      setCarrito(ensureCartLineIds(loaded.carrito))
      setItemDescuentoModo(loaded.overrides.itemDescuentoModo)
      setItemDescuentoDraft(loaded.overrides.itemDescuentoDraft)
      setItemDescuentoSuprimido(loaded.overrides.itemDescuentoSuprimido)
      setItemComentarios(loaded.overrides.itemComentarios)
      setCartHydrated(true)
    })
    return () => {
      cancelled = true
    }
  }, [popId, sqliteReady])

  useEffect(() => {
    if (!popId || !sqliteReady || !cartHydrated) return
    if (skipPersistRef.current) {
      skipPersistRef.current = false
      return
    }
    void openPopLocalDb(popId).then((handle) => {
      replaceSaleCart(handle.database, carrito, overrideSnapshot)
      handle.markDirty()
    })
  }, [carrito, cartHydrated, overrideSnapshot, popId, sqliteReady])

  const productosCatalogo = useMemo(
    () => menuPromotions.map(menuPromotionToProduct),
    [menuPromotions],
  )

  const productosByKey = useMemo(() => {
    const fromPromos = buildMenuProductMap(productosCatalogo)
    for (const item of carrito) {
      const product = catalogProductFromCartSnapshot(item)
      if (!product) continue
      const key = `${normalizeCartItemKind(item.kind)}:${item.productoId}`
      if (!fromPromos.has(key)) fromPromos.set(key, product)
    }
    return fromPromos
  }, [carrito, productosCatalogo])

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
    () => mapMenuCartToDetallados(carrito, productosByKey),
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
      const product = productosByKey.get(`promotion:${promotionId}`)
      let affectedLineId: string | null = null
      setCarrito((prev) => {
        const result = addPromotionToTicketCart({
          carrito: prev,
          promotionId,
          selections,
          snapshot: product
            ? snapshotFromCatalogProduct(product)
            : undefined,
        })
        affectedLineId = result.affectedLineId
        return result.carrito
      })
      if (affectedLineId) onCartLineAdded?.(affectedLineId)
    },
    [onCartLineAdded, productosByKey],
  )

  const confirmarPromoWizard = useCallback(
    (promotionId: string, selections: PromotionCartSelection[]) => {
      agregarPromoAlCarrito(promotionId, selections)
      setPromoWizardTarget(null)
    },
    [agregarPromoAlCarrito],
  )

  const agregarAlCarrito = useCallback(
    (productoId: string, kindHint?: MenuCartItemKind, quantity = 1) => {
      if (!cartHydrated) return
      const promotion =
        (kindHint === "promotion"
          ? productosByKey.get(`promotion:${productoId}`)
          : null) ?? productosByKey.get(`promotion:${productoId}`)
      if (kindHint === "promotion" || (promotion && kindHint !== "article")) {
        if (promotion?.promotionMeta) {
          const auto = tryAutoComboSelections(promotion.promotionMeta)
          if (auto) {
            agregarPromoAlCarrito(productoId, auto)
            return
          }
          setPromoWizardTarget(promotion.promotionMeta)
          setPromoWizardOpen(true)
          return
        }
      }

      void (async () => {
        if (!popId) return
        const handle = await openPopLocalDb(popId)
        const row = getArticleById(handle.database, productoId)
        if (
          !row ||
          !row.isActive ||
          !row.isSellable ||
          row.itemKind !== "merchandise"
        ) {
          return
        }
        const product = menuArticleToProduct(
          articleSnapshotToSaleCatalogArticle(row, priceListId),
        )
        const map = new Map(productosByKey)
        map.set(`article:${product.id}`, product)
        let affectedLineId: string | null = null
        setCarrito((prev) => {
          const result = addProductToTicketCart({
            carrito: prev,
            productoId,
            kindHint: "article",
            productosByKey: map,
            quantity,
            overrides: {
              itemDescuentoModo,
              itemDescuentoDraft,
              itemDescuentoSuprimido,
              itemComentarios,
            },
            overrideActions: cartLineOverrideActions,
          })
          affectedLineId = result.affectedLineId
          return result.carrito
        })
        if (affectedLineId) onCartLineAdded?.(affectedLineId)
      })()
    },
    [
      agregarPromoAlCarrito,
      cartHydrated,
      cartLineOverrideActions,
      itemComentarios,
      itemDescuentoDraft,
      itemDescuentoModo,
      itemDescuentoSuprimido,
      onCartLineAdded,
      popId,
      priceListId,
      productosByKey,
    ],
  )

  const aplicarEdicionLineaTicket = useCallback(
    (edit: MostradorCartLineEditInput) => {
      applyTicketLineEdit({
        edit,
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
          setItemComentarios((comments) =>
            clearComboCommentsForCartLine(comments, lineId),
          )
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

  const restaurarDesdeCheckout = useCallback(
    (snapshot: TableSessionCheckoutSnapshot) => {
      setCarrito(ensureCartLineIds(snapshot.carrito))
      setItemDetalleAbiertoId(null)
      setItemDescuentoModo({ ...(snapshot.itemDescuentoModo ?? {}) })
      setItemDescuentoDraft({ ...(snapshot.itemDescuentoDraft ?? {}) })
      setItemDescuentoSuprimido({ ...(snapshot.itemDescuentoSuprimido ?? {}) })
      setItemComentarios({ ...(snapshot.itemComentarios ?? {}) })
      setPromoWizardOpen(false)
      setPromoWizardTarget(null)
    },
    [],
  )

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
    restaurarDesdeCheckout,
    cartReady: cartHydrated,
    promoWizardOpen,
    setPromoWizardOpen,
    promoWizardTarget,
    confirmarPromoWizard,
  }
}
