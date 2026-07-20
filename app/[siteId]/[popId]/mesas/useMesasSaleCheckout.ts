"use client"

import { saveTableSessionCheckout } from "@/app/[siteId]/[popId]/mesas/actions"
import {
  emptyTableSessionCheckout,
  type MesasCartItem,
  type MesasClienteSeleccionado,
  type TableSessionCheckoutSnapshot,
} from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import { getMenuCatalog, type MenuCatalogArticle, type MenuCatalogCategorySection, type MenuCatalogPromotion, type MenuCatalogRecipe } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type { SaleCatalogClient, SaleCatalogPaymentMethod, SaleOpenCashSession } from "@/app/[siteId]/[popId]/sale/actions"
import { completeSale } from "@/app/[siteId]/[popId]/sale/completeSale"
import {
  buildMenuProductMap,
  buildMenuCartDisplayLines,
  computeMenuQuantityDealApplications,
  computeMenuQuantityDealDiscounts,
  menuCartOrderTotals,
  menuPromotionToProduct,
  removeQuantityDealApplicationFromCart,
  resolvePromotionCartPricing,
  tryAutoComboSelections,
  type MenuCartDisplayLine,
} from "@/lib/menuCheckoutPromotions"
import type { PromotionCartSelection } from "@/lib/promotionPricing"
import {
  clearCartLineOverrides,
  seedCartLineDefaultDiscount,
  type OperationCartLineOverrideActions,
  type OperationCartLineOverrideState,
} from "@/components/sale-operation/OperationCartLineRow"
import {
  menuArticleToProduct,
  menuRecipeToProduct,
  type MenuCatalogProduct,
} from "@/lib/menuCatalogProduct"
import {
  cartItemKey,
  cartItemsMatch,
  normalizeCartItemKind,
  type MenuCartItemKind,
} from "@/lib/menuCart"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import { CLIENT_IVA_CONDITION_OPTIONS, type ClientIvaConditionValue } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import { CLIENT_ACCOUNT_PAYMENT_LABEL } from "@/lib/operationPaymentLabels"
import {
  getSaleComprobanteDisplayLabel,
  getSaleComprobantePickerOptions,
  isAllowedSaleComprobanteLabel,
  readSavedSaleComprobante,
  writeSavedSaleComprobante,
} from "@/lib/saleComprobantePicker"
import {
  resolveSaleComprobanteForClient,
  suggestSaleComprobanteForClientIva,
} from "@/lib/saleComprobanteRules"
import { DEFAULT_SALE_SITE_ID } from "@/lib/saleInvoiceTypes"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const MANUAL_PARTY_LIST_ID = "__manual__"

export type { MesasCartItem, MesasClienteSeleccionado }

const CHECKOUT_PERSIST_MS = 450

export type RemoteTableSessionCheckout = {
  checkout: TableSessionCheckoutSnapshot | null
  updatedAt: string
} | null

const IVA_LABEL_BY_VALUE = Object.fromEntries(
  CLIENT_IVA_CONDITION_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>

function labelCondicionIva(value: string | null | undefined) {
  if (!value?.trim()) return null
  return IVA_LABEL_BY_VALUE[value] ?? value
}

function normalizarBusqueda(s: string) {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
}

function defaultComprobanteForPop(
  popId: string | undefined,
  invoiceTypeSiteId: string,
): string | null {
  if (!popId) return null
  const persisted = readSavedSaleComprobante(popId)
  if (
    persisted !== undefined &&
    isAllowedSaleComprobanteLabel(invoiceTypeSiteId, persisted)
  ) {
    return persisted
  }
  return null
}

export function useMesasSaleCheckout(
  popId: string | undefined,
  siteId: string,
  tableSessionId: string | null,
  remoteSession: RemoteTableSessionCheckout = null,
) {
  const [menuCategorySections, setMenuCategorySections] = useState<
    MenuCatalogCategorySection[]
  >([])
  const [menuRecipes, setMenuRecipes] = useState<MenuCatalogRecipe[]>([])
  const [menuArticles, setMenuArticles] = useState<MenuCatalogArticle[]>([])
  const [menuPromotions, setMenuPromotions] = useState<MenuCatalogPromotion[]>([])
  const [menuQuantityDeals, setMenuQuantityDeals] = useState<MenuCatalogPromotion[]>([])
  const [saleClients, setSaleClients] = useState<SaleCatalogClient[]>([])
  const [salePaymentMethods, setSalePaymentMethods] = useState<SaleCatalogPaymentMethod[]>([])
  const [canReadClients, setCanReadClients] = useState(false)
  const [canCreateSale, setCanCreateSale] = useState(false)
  const [canReadCashRegisters, setCanReadCashRegisters] = useState(false)
  const [openCashSession, setOpenCashSession] = useState<SaleOpenCashSession | null>(null)
  const [invoiceTypeSiteId, setInvoiceTypeSiteId] = useState<string>(DEFAULT_SALE_SITE_ID)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)

  const [carrito, setCarrito] = useState<MesasCartItem[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<MesasClienteSeleccionado | null>(null)
  const [manualNombreCliente, setManualNombreCliente] = useState("")
  const [fiscalDocVenta, setFiscalDocVenta] = useState("")
  const [ventaIvaCondition, setVentaIvaCondition] = useState("")
  const [comprobante, setComprobante] = useState<string | null>(null)
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<{
    id: string
    label: string
  } | null>(null)
  const [payOnClientAccount, setPayOnClientAccount] = useState(false)
  const [modoDescuento, setModoDescuento] = useState<"porcentaje" | "fijo">("porcentaje")
  const [valorDescuentoPorcentaje, setValorDescuentoPorcentaje] = useState(0)
  const [valorDescuentoFijo, setValorDescuentoFijo] = useState(0)

  const [clienteModalAbierto, setClienteModalAbierto] = useState(false)
  const [comprobanteModalAbierto, setComprobanteModalAbierto] = useState(false)
  const [pagoModalAbierto, setPagoModalAbierto] = useState(false)
  const [descuentoModalAbierto, setDescuentoModalAbierto] = useState(false)
  const [descartarConfirmOpen, setDescartarConfirmOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [busquedaClienteModal, setBusquedaClienteModal] = useState("")
  const [descuentoDraftModo, setDescuentoDraftModo] = useState<"porcentaje" | "fijo">("porcentaje")
  const [descuentoDraftTexto, setDescuentoDraftTexto] = useState("")

  const [itemDetalleAbiertoId, setItemDetalleAbiertoId] = useState<string | null>(null)
  const [itemDescuentoModo, setItemDescuentoModo] = useState<
    Record<string, "porcentaje" | "fijo">
  >({})
  const [itemDescuentoDraft, setItemDescuentoDraft] = useState<
    Record<string, string>
  >({})
  const [itemDescuentoSuprimido, setItemDescuentoSuprimido] = useState<
    Record<string, true>
  >({})
  const [itemComentarios, setItemComentarios] = useState<Record<string, string>>({})

  const [promoWizardOpen, setPromoWizardOpen] = useState(false)
  const [promoWizardTarget, setPromoWizardTarget] = useState<MenuCatalogPromotion | null>(
    null,
  )

  const comprobanteInitRef = useRef(false)
  const loadedSessionIdRef = useRef<string | null>(null)
  const checkoutStateRef = useRef<TableSessionCheckoutSnapshot>(
    emptyTableSessionCheckout(),
  )
  const skipNextPersistRef = useRef(false)
  const lastSavedUpdatedAtRef = useRef<string | null>(null)
  const lastAppliedRemoteUpdatedAtRef = useRef<string | null>(null)
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  checkoutStateRef.current = {
    carrito,
    clienteSeleccionado,
    manualNombreCliente,
    fiscalDocVenta,
    ventaIvaCondition,
    comprobante,
    metodoPagoSeleccionado,
    payOnClientAccount,
    modoDescuento,
    valorDescuentoPorcentaje,
    valorDescuentoFijo,
    itemDescuentoModo,
    itemDescuentoDraft,
    itemDescuentoSuprimido,
    itemComentarios,
  }

  const applySessionSnapshot = useCallback((snap: TableSessionCheckoutSnapshot) => {
    skipNextPersistRef.current = true
    if (snap.comprobante != null) {
      comprobanteInitRef.current = true
    }
    setCarrito(snap.carrito)
    setClienteSeleccionado(snap.clienteSeleccionado)
    setManualNombreCliente(snap.manualNombreCliente)
    setFiscalDocVenta(snap.fiscalDocVenta)
    setVentaIvaCondition(snap.ventaIvaCondition)
    setComprobante(snap.comprobante)
    setMetodoPagoSeleccionado(snap.metodoPagoSeleccionado)
    setPayOnClientAccount(snap.payOnClientAccount)
    setModoDescuento(snap.modoDescuento)
    setValorDescuentoPorcentaje(snap.valorDescuentoPorcentaje)
    setValorDescuentoFijo(snap.valorDescuentoFijo)
    setItemDetalleAbiertoId(null)
    setItemDescuentoModo(snap.itemDescuentoModo ?? {})
    setItemDescuentoDraft(snap.itemDescuentoDraft ?? {})
    setItemDescuentoSuprimido(snap.itemDescuentoSuprimido ?? {})
    setItemComentarios(snap.itemComentarios ?? {})
    setClienteModalAbierto(false)
    setComprobanteModalAbierto(false)
    setPagoModalAbierto(false)
    setDescuentoModalAbierto(false)
    setDescartarConfirmOpen(false)
    setConfirmOpen(false)
    setSubmitError(null)
  }, [])

  const flushCheckoutPersist = useCallback(
    async (sessionId: string, snap: TableSessionCheckoutSnapshot) => {
      if (!popId) return
      const res = await saveTableSessionCheckout(popId, siteId, sessionId, snap)
      if (res.success) {
        lastSavedUpdatedAtRef.current = res.updatedAt
      }
    },
    [popId, siteId],
  )

  useEffect(() => {
    const prevId = loadedSessionIdRef.current
    if (prevId && prevId !== tableSessionId && popId) {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current)
        persistTimerRef.current = null
      }
      void flushCheckoutPersist(prevId, checkoutStateRef.current)
    }

    loadedSessionIdRef.current = tableSessionId
    lastSavedUpdatedAtRef.current = null
    lastAppliedRemoteUpdatedAtRef.current = null
    comprobanteInitRef.current = false

    if (tableSessionId && remoteSession) {
      const snap =
        remoteSession.checkout ??
        emptyTableSessionCheckout(
          defaultComprobanteForPop(popId, invoiceTypeSiteId),
        )
      applySessionSnapshot(snap)
      lastAppliedRemoteUpdatedAtRef.current = remoteSession.updatedAt
    } else if (tableSessionId) {
      applySessionSnapshot(
        emptyTableSessionCheckout(
          defaultComprobanteForPop(popId, invoiceTypeSiteId),
        ),
      )
    } else {
      applySessionSnapshot(
        emptyTableSessionCheckout(
          defaultComprobanteForPop(popId, invoiceTypeSiteId),
        ),
      )
    }
    // Solo al cambiar de sesión de mesa; el snapshot remoto se sincroniza aparte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableSessionId, applySessionSnapshot])

  useEffect(() => {
    if (!tableSessionId || !remoteSession) return
    const { updatedAt, checkout } = remoteSession
    if (updatedAt === lastSavedUpdatedAtRef.current) return
    if (updatedAt === lastAppliedRemoteUpdatedAtRef.current) return

    const snap =
      checkout ??
      emptyTableSessionCheckout(defaultComprobanteForPop(popId, invoiceTypeSiteId))
    applySessionSnapshot(snap)
    lastAppliedRemoteUpdatedAtRef.current = updatedAt
  }, [
    tableSessionId,
    remoteSession?.updatedAt,
    remoteSession?.checkout,
    applySessionSnapshot,
    popId,
    invoiceTypeSiteId,
  ])

  useEffect(() => {
    if (!popId || !tableSessionId) return
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false
      return
    }

    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current)
    }

    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null
      void flushCheckoutPersist(tableSessionId, checkoutStateRef.current)
    }, CHECKOUT_PERSIST_MS)

    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current)
        persistTimerRef.current = null
      }
    }
  }, [
    popId,
    siteId,
    tableSessionId,
    carrito,
    clienteSeleccionado,
    manualNombreCliente,
    fiscalDocVenta,
    ventaIvaCondition,
    comprobante,
    metodoPagoSeleccionado,
    payOnClientAccount,
    modoDescuento,
    valorDescuentoPorcentaje,
    valorDescuentoFijo,
    itemDescuentoModo,
    itemDescuentoDraft,
    itemDescuentoSuprimido,
    itemComentarios,
    flushCheckoutPersist,
  ])

  useEffect(() => {
    return () => {
      const sessionId = loadedSessionIdRef.current
      if (sessionId && popId) {
        if (persistTimerRef.current) {
          clearTimeout(persistTimerRef.current)
          persistTimerRef.current = null
        }
        void flushCheckoutPersist(sessionId, checkoutStateRef.current)
      }
    }
  }, [popId, flushCheckoutPersist])

  const ventaPadron = usePadronAutofillRazonSocial(popId, fiscalDocVenta, {
    enabled: Boolean(popId) && (clienteSeleccionado == null || clienteSeleccionado.manual),
  })

  const loadCatalog = useCallback(async () => {
    if (!popId) {
      setCatalogLoading(false)
      setCatalogError(null)
      return
    }
    setCatalogLoading(true)
    const res = await getMenuCatalog(popId)
    if (!res.success) {
      setMenuCategorySections([])
    setMenuRecipes([])
    setMenuArticles([])
    setMenuPromotions([])
    setMenuQuantityDeals([])
      setSaleClients([])
      setSalePaymentMethods([])
      setCatalogError(res.error)
      setCatalogLoading(false)
      return
    }
    setMenuCategorySections(res.categorySections)
    setMenuRecipes(res.recipes)
    setMenuArticles(res.articles)
    setMenuPromotions(res.promotions)
    setMenuQuantityDeals(res.quantityDeals)
    setSaleClients(res.clients)
    setSalePaymentMethods(res.paymentMethods)
    setCanReadClients(res.canReadClients)
    setCanCreateSale(res.canCreateSale)
    setCanReadCashRegisters(res.canReadCashRegisters)
    setOpenCashSession(res.openCashSession)
    setInvoiceTypeSiteId(res.invoiceTypeSiteId)
    setCatalogError(null)
    setCatalogLoading(false)
  }, [popId])

  useEffect(() => {
    void loadCatalog()
  }, [loadCatalog])

  useEffect(() => {
    if (salePaymentMethods.length === 0 || tableSessionId == null) return
    setMetodoPagoSeleccionado((prev) => {
      if (prev && salePaymentMethods.some((m) => m.id === prev.id)) return prev
      const efectivo = salePaymentMethods.find((m) => m.kind === "cash")
      return efectivo ? { id: efectivo.id, label: efectivo.name } : null
    })
  }, [salePaymentMethods, tableSessionId])

  useEffect(() => {
    if (!popId || comprobanteInitRef.current || tableSessionId == null) return
    comprobanteInitRef.current = true
    const saved = readSavedSaleComprobante(popId)
    if (saved !== undefined) {
      setComprobante(
        isAllowedSaleComprobanteLabel(invoiceTypeSiteId, saved) ? saved : null,
      )
    }
  }, [popId, invoiceTypeSiteId, tableSessionId])

  const productosCatalogo = useMemo((): MenuCatalogProduct[] => {
    return [
      ...menuPromotions.map(menuPromotionToProduct),
      ...menuRecipes.map(menuRecipeToProduct),
      ...menuArticles.map(menuArticleToProduct),
    ]
  }, [menuPromotions, menuRecipes, menuArticles])

  const productosByKey = useMemo(
    () => buildMenuProductMap(productosCatalogo),
    [productosCatalogo],
  )

  const quantityDealApplications = useMemo(
    () =>
      computeMenuQuantityDealApplications({
        carrito,
        productosByKey,
        quantityDeals: menuQuantityDeals,
        itemDescuentoSuprimido,
      }),
    [carrito, productosByKey, menuQuantityDeals, itemDescuentoSuprimido],
  )

  const quantityDealDiscounts = useMemo(
    () =>
      computeMenuQuantityDealDiscounts({
        carrito,
        productosByKey,
        quantityDeals: menuQuantityDeals,
        itemDescuentoSuprimido,
      }),
    [carrito, productosByKey, menuQuantityDeals, itemDescuentoSuprimido],
  )

  const itemsDetallados = useMemo(
    () =>
      carrito
        .map((i) => {
          const kind = normalizeCartItemKind(i.kind)
          const producto =
            productosByKey.get(`${kind}:${i.productoId}`) ?? null
          if (kind === "promotion" && !i.promotionSelections?.length) {
            return null
          }
          if (kind !== "promotion" && !producto) return null
          return {
            ...i,
            kind,
            cartLineKey: cartItemKey({ ...i, kind }),
            producto,
          }
        })
        .filter((i): i is NonNullable<typeof i> => i != null),
    [carrito, productosByKey],
  )

  const cartDisplayLines = useMemo(
    (): MenuCartDisplayLine[] =>
      buildMenuCartDisplayLines(
        itemsDetallados.map((item) => ({
          cartLineKey: item.cartLineKey,
          productoId: item.productoId,
          kind: item.kind,
          cantidad: item.cantidad,
          producto: item.producto,
          promotionSelections: item.promotionSelections,
        })),
        quantityDealApplications,
      ),
    [itemsDetallados, quantityDealApplications],
  )

  const cartTotalsInput = useMemo(
    () =>
      itemsDetallados.map((item) => {
        const lineKey = item.cartLineKey
        const suprimido = itemDescuentoSuprimido[lineKey] === true
        const draft = itemDescuentoDraft[lineKey] ?? ""
        const deal = quantityDealDiscounts.get(lineKey)
        const quantityDealActive = Boolean(deal)
        return {
          producto: item.producto,
          cantidad: item.cantidad,
          suppressCatalogDiscount: suprimido || quantityDealActive,
          manualDiscount:
            !suprimido && !quantityDealActive && draft !== ""
              ? {
                  mode: itemDescuentoModo[lineKey] ?? "porcentaje",
                  draft,
                }
              : null,
          promotionMeta: item.producto?.promotionMeta,
          promotionSelections: item.promotionSelections,
          quantityDealDiscount: deal?.amount ?? 0,
        }
      }),
    [
      itemsDetallados,
      itemDescuentoModo,
      itemDescuentoDraft,
      itemDescuentoSuprimido,
      quantityDealDiscounts,
    ],
  )

  const catalogTotals = useMemo(
    () => menuCartOrderTotals(cartTotalsInput),
    [cartTotalsInput],
  )

  const subtotal = catalogTotals.subtotal
  const descuentoItemsMonto = catalogTotals.descuentoItemsMonto
  const hayDescuentoItems = catalogTotals.hayDescuentoItems

  const descuentoMonto = useMemo(() => {
    if (modoDescuento === "porcentaje") {
      return subtotal * (valorDescuentoPorcentaje / 100)
    }
    return Math.min(valorDescuentoFijo, subtotal)
  }, [modoDescuento, subtotal, valorDescuentoPorcentaje, valorDescuentoFijo])

  const total = subtotal - descuentoMonto
  const hayDescuento = descuentoMonto > 0
  const hayItemsEnPedido = itemsDetallados.length > 0
  const pagoConfigurado = payOnClientAccount || metodoPagoSeleccionado != null

  const pagoResumenLabel = useMemo(() => {
    if (payOnClientAccount) return CLIENT_ACCOUNT_PAYMENT_LABEL
    return metodoPagoSeleccionado?.label ?? "Elegir forma de pago"
  }, [payOnClientAccount, metodoPagoSeleccionado])

  const comprobanteDisplayLabel = useMemo(
    () => getSaleComprobanteDisplayLabel(comprobante),
    [comprobante],
  )

  const ventaIvaLabel = useMemo(
    () => labelCondicionIva(clienteSeleccionado?.ivaCondition ?? ventaIvaCondition),
    [ventaIvaCondition, clienteSeleccionado?.ivaCondition],
  )

  const puedeRegistrar = useMemo(
    () =>
      hayItemsEnPedido &&
      pagoConfigurado &&
      (payOnClientAccount
        ? Boolean(clienteSeleccionado?.id)
        : metodoPagoSeleccionado != null) &&
      canCreateSale &&
      canReadCashRegisters &&
      openCashSession != null &&
      tableSessionId != null,
    [
      hayItemsEnPedido,
      pagoConfigurado,
      payOnClientAccount,
      clienteSeleccionado?.id,
      metodoPagoSeleccionado,
      canCreateSale,
      canReadCashRegisters,
      openCashSession,
      tableSessionId,
    ],
  )

  const hayContenidoVenta = useMemo(() => {
    if (carrito.length > 0) return true
    if (clienteSeleccionado != null) return true
    if (comprobante != null) return true
    if (hayDescuento) return true
    if (descuentoItemsMonto > 0) return true
    if (Object.values(itemComentarios).some((c) => c?.trim())) return true
    if (payOnClientAccount || metodoPagoSeleccionado != null) return true
    return false
  }, [
    carrito.length,
    clienteSeleccionado,
    comprobante,
    hayDescuento,
    descuentoItemsMonto,
    itemComentarios,
    payOnClientAccount,
    metodoPagoSeleccionado,
  ])

  const comprobantePickerOptions = useMemo(
    () => getSaleComprobantePickerOptions(invoiceTypeSiteId),
    [invoiceTypeSiteId],
  )

  const paymentMethodListItems = useMemo(() => {
    const order = ["cash", "card_debit", "card_credit", "transfer", "other"] as const
    const sectionLabel: Record<(typeof order)[number], string> = {
      cash: "Efectivo",
      card_debit: "Débito",
      card_credit: "Crédito",
      transfer: "Transferencia",
      other: "Otros",
    }
    const buckets: Record<string, typeof salePaymentMethods> = {}
    for (const k of order) buckets[k] = []
    for (const m of salePaymentMethods) {
      const k = order.includes(m.kind as (typeof order)[number])
        ? (m.kind as (typeof order)[number])
        : "other"
      buckets[k].push(m)
    }
    return order.flatMap((kind) =>
      buckets[kind].map((method) => ({
        method,
        groupTitle: sectionLabel[kind],
      })),
    )
  }, [salePaymentMethods])

  const clientesFiltradosModal = useMemo(() => {
    const q = normalizarBusqueda(busquedaClienteModal.trim())
    if (!q) return []
    return saleClients.filter((c) => normalizarBusqueda(c.name).includes(q))
  }, [busquedaClienteModal, saleClients])

  const elegirComprobante = useCallback(
    (value: string | null) => {
      setComprobante(value)
      if (popId) writeSavedSaleComprobante(popId, value)
    },
    [popId],
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
      if (!product?.promotionMeta) return
      const kind = "promotion" as const
      const esNuevo = !carrito.some((i) =>
        cartItemsMatch(i, promotionId, kind, selections),
      )
      const lineKey = cartItemKey({
        productoId: promotionId,
        cantidad: 1,
        kind,
        promotionSelections: selections,
      })
      setCarrito((prev) => {
        const existe = prev.find((i) =>
          cartItemsMatch(i, promotionId, kind, selections),
        )
        if (existe) {
          return prev.map((i) =>
            cartItemsMatch(i, promotionId, kind, selections)
              ? { ...i, cantidad: i.cantidad + 1 }
              : i,
          )
        }
        return [
          ...prev,
          {
            productoId: promotionId,
            cantidad: 1,
            kind,
            promotionSelections: selections,
          },
        ]
      })
      if (esNuevo) {
        clearCartLineOverrides(lineKey, cartLineOverrideActions)
      }
    },
    [productosByKey, carrito, cartLineOverrideActions],
  )

  const agregarAlCarrito = useCallback(
    (productoId: string, kindHint?: MenuCartItemKind) => {
      const product =
        (kindHint
          ? productosByKey.get(`${kindHint}:${productoId}`)
          : null) ??
        productosByKey.get(`promotion:${productoId}`) ??
        productosByKey.get(`article:${productoId}`) ??
        productosByKey.get(`recipe:${productoId}`)
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

      const lineKey = cartItemKey({ productoId, cantidad: 1, kind })
      const esNuevo = !carrito.some((i) => cartItemsMatch(i, productoId, kind))
      setCarrito((prev) => {
        const existe = prev.find((i) => cartItemsMatch(i, productoId, kind))
        if (existe) {
          return prev.map((i) =>
            cartItemsMatch(i, productoId, kind)
              ? { ...i, cantidad: i.cantidad + 1 }
              : i,
          )
        }
        return [...prev, { productoId, cantidad: 1, kind }]
      })
      if (esNuevo && product?.kind === "article") {
        seedCartLineDefaultDiscount(product, lineKey, cartLineOverrideActions)
      }
    },
    [productosByKey, carrito, cartLineOverrideActions, agregarPromoAlCarrito],
  )

  const cambiarCantidad = useCallback(
    (
      productoId: string,
      delta: number,
      kind?: MenuCartItemKind,
      promotionSelections?: PromotionCartSelection[],
    ) => {
      setCarrito((prev) =>
        prev
          .map((i) =>
            cartItemsMatch(i, productoId, kind, promotionSelections)
              ? { ...i, cantidad: Math.max(0, i.cantidad + delta) }
              : i,
          )
          .filter((i) => i.cantidad > 0),
      )
    },
    [],
  )

  const quitarDelCarrito = useCallback(
    (
      productoId: string,
      kind?: MenuCartItemKind,
      promotionSelections?: PromotionCartSelection[],
    ) => {
      const resolvedKind = kind ?? "article"
      const lineKey = cartItemKey({
        productoId,
        cantidad: 1,
        kind: resolvedKind,
        promotionSelections,
      })
      setCarrito((prev) =>
        prev.filter((i) => !cartItemsMatch(i, productoId, kind, promotionSelections)),
      )
      clearCartLineOverrides(lineKey, cartLineOverrideActions)
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
      clearCartLineOverrides(`qtydeal:${application.id}`, cartLineOverrideActions)
      setItemDetalleAbiertoId((prev) =>
        prev === `qtydeal:${application.id}` ? null : prev,
      )
    },
    [quantityDealApplications, cartLineOverrideActions],
  )

  const limpiarPedido = useCallback(() => {
    setCarrito([])
    setItemDetalleAbiertoId(null)
    setItemDescuentoModo({})
    setItemDescuentoDraft({})
    setItemDescuentoSuprimido({})
    setItemComentarios({})
    setClienteSeleccionado(null)
    setManualNombreCliente("")
    setFiscalDocVenta("")
    setVentaIvaCondition("")
    if (popId) {
      const saved = readSavedSaleComprobante(popId)
      setComprobante(saved !== undefined ? saved : null)
    } else {
      setComprobante(null)
    }
    setModoDescuento("porcentaje")
    setValorDescuentoPorcentaje(0)
    setValorDescuentoFijo(0)
    setMetodoPagoSeleccionado(() => {
      const efectivo = salePaymentMethods.find((m) => m.kind === "cash")
      return efectivo ? { id: efectivo.id, label: efectivo.name } : null
    })
    setPayOnClientAccount(false)
    setDescartarConfirmOpen(false)
    setConfirmOpen(false)
    setSubmitError(null)
  }, [popId, salePaymentMethods])

  const confirmarMesa = useCallback(async () => {
    if (!popId || !siteId || !pagoConfigurado || !tableSessionId) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      const catalogClientId =
        clienteSeleccionado?.id && !clienteSeleccionado.manual
          ? clienteSeleccionado.id
          : null
      const manualOrFiscalName =
        manualNombreCliente.trim() ||
        ventaPadron.razonSocial.trim() ||
        clienteSeleccionado?.name ||
        ""
      const manualOrFiscalTaxId =
        fiscalDocVenta.trim() || clienteSeleccionado?.taxId || null
      const hasFiscalOverride =
        Boolean(clienteSeleccionado?.manual) ||
        Boolean(fiscalDocVenta.trim()) ||
        Boolean(ventaPadron.razonSocial.trim()) ||
        Boolean(manualNombreCliente.trim())
      const res = await completeSale(popId, {
        siteId,
        lines: carrito.map((i) => {
          const kind = normalizeCartItemKind(i.kind)
          const lineKey = cartItemKey({ ...i, kind })
          const suprimido = itemDescuentoSuprimido[lineKey] === true
          const draft = itemDescuentoSuprimido[lineKey]
            ? ""
            : (itemDescuentoDraft[lineKey] ?? "")
          const deal = quantityDealDiscounts.get(lineKey)
          const base = {
            quantity: i.cantidad,
            itemDiscountMode: itemDescuentoModo[lineKey] ?? "porcentaje",
            itemDiscountDraft: draft,
            suppressCatalogDiscount: suprimido || Boolean(deal),
            comment: itemComentarios[lineKey] ?? "",
            promotionDealDiscount: deal?.amount ?? 0,
            promotionDealId: deal?.promotionId,
          }
          if (kind === "promotion") {
            return {
              ...base,
              promotionId: i.productoId,
              promotionSelections: (i.promotionSelections ?? []).map((s) => ({
                slotId: s.slotId,
                kind: s.kind,
                refId: s.refId,
              })),
            }
          }
          return kind === "recipe"
            ? { ...base, recipeId: i.productoId }
            : { ...base, articleId: i.productoId }
        }),
        clientId: catalogClientId,
        payOnClientAccount,
        paymentMethodId: payOnClientAccount ? null : metodoPagoSeleccionado?.id,
        generalDiscountMode: modoDescuento === "porcentaje" ? "porcentaje" : "fijo",
        valorDescuentoPorcentaje,
        valorDescuentoFijo,
        invoiceTypeLabel: comprobante,
        customerIvaCondition:
          ventaIvaCondition.trim() || clienteSeleccionado?.ivaCondition || null,
        fiscalCustomer: hasFiscalOverride
          ? { name: manualOrFiscalName, taxId: manualOrFiscalTaxId }
          : null,
        tableSessionId,
      })
      if (!res.success) {
        setSubmitError(res.error)
        return false
      }
      setConfirmOpen(false)
      limpiarPedido()
      return true
    } finally {
      setSubmitting(false)
    }
  }, [
    popId,
    siteId,
    tableSessionId,
    carrito,
    clienteSeleccionado,
    payOnClientAccount,
    pagoConfigurado,
    metodoPagoSeleccionado,
    modoDescuento,
    valorDescuentoPorcentaje,
    valorDescuentoFijo,
    comprobante,
    ventaIvaCondition,
    fiscalDocVenta,
    manualNombreCliente,
    ventaPadron.razonSocial,
    itemDescuentoModo,
    itemDescuentoDraft,
    itemDescuentoSuprimido,
    itemComentarios,
    quantityDealDiscounts,
    limpiarPedido,
  ])

  const abrirModalDescuento = useCallback(() => {
    if (hayDescuento) {
      if (modoDescuento === "porcentaje") {
        setDescuentoDraftModo("porcentaje")
        setDescuentoDraftTexto(String(valorDescuentoPorcentaje))
      } else {
        setDescuentoDraftModo("fijo")
        setDescuentoDraftTexto(String(valorDescuentoFijo))
      }
    } else {
      setDescuentoDraftModo("porcentaje")
      setDescuentoDraftTexto("")
    }
    setDescuentoModalAbierto(true)
  }, [hayDescuento, modoDescuento, valorDescuentoPorcentaje, valorDescuentoFijo])

  const aplicarDescuentoModal = useCallback(() => {
    const raw = descuentoDraftTexto.trim()
    if (!raw) {
      setModoDescuento("porcentaje")
      setValorDescuentoPorcentaje(0)
      setValorDescuentoFijo(0)
      setDescuentoModalAbierto(false)
      return
    }
    const n = Number.parseFloat(raw.replace(",", "."))
    if (!Number.isFinite(n) || n <= 0) return
    if (descuentoDraftModo === "porcentaje") {
      setModoDescuento("porcentaje")
      setValorDescuentoPorcentaje(Math.min(100, n))
      setValorDescuentoFijo(0)
    } else {
      const tope = Math.min(n, subtotal)
      setModoDescuento("fijo")
      setValorDescuentoFijo(Math.max(0, tope))
      setValorDescuentoPorcentaje(0)
    }
    setDescuentoModalAbierto(false)
  }, [descuentoDraftModo, descuentoDraftTexto, subtotal])

  const descuentoToolbarLabel = useMemo(() => {
    if (!hayDescuento) return "Sin descuento"
    if (modoDescuento === "porcentaje") return `${valorDescuentoPorcentaje}%`
    return `Fijo ${saleOpFmt.format(valorDescuentoFijo)}`
  }, [hayDescuento, modoDescuento, valorDescuentoPorcentaje, valorDescuentoFijo])

  const clienteToolbarLabel = !canReadClients
    ? "Sin permiso"
    : tableSessionId == null
      ? "Sin mesa abierta"
      : (clienteSeleccionado?.name ?? "Elegir cliente")

  const sessionClientLabel = useMemo(() => {
    if (!canReadClients) return "Sin permiso"
    const manual = manualNombreCliente.trim()
    return clienteSeleccionado?.name ?? (manual || null)
  }, [canReadClients, clienteSeleccionado?.name, manualNombreCliente])

  const mesaToolbarDisabled = tableSessionId == null

  return {
    catalogLoading,
    catalogError,
    menuCategorySections,
    productosCatalogo,
    carrito,
    itemsDetallados,
    cartDisplayLines,
    agregarAlCarrito,
    agregarPromoAlCarrito,
    cambiarCantidad,
    quitarDelCarrito,
    subtotal,
    subtotalOriginal: catalogTotals.subtotalOriginal,
    descuentoItemsMonto,
    hayDescuentoItems,
    descuentoCatalogoMonto: catalogTotals.descuentoCatalogoMonto,
    hayDescuentoCatalogo: catalogTotals.hayDescuentoCatalogo,
    descuentoMonto,
    total,
    hayDescuento,
    hayItemsEnPedido,
    hayContenidoVenta,
    puedeRegistrar,
    submitting,
    submitError,
    sessionClientLabel,
    promoWizardOpen,
    setPromoWizardOpen,
    promoWizardTarget,
    confirmarPromoWizard: agregarPromoAlCarrito,
    quantityDealDiscounts,
    quantityDealApplications,
    quitarQuantityDealApplication,
    cartLineOverrides,
    cartLineOverrideActions,
    // Toolbox
    toolbox: {
      clienteLabel: clienteToolbarLabel,
      clienteIvaLabel: mesaToolbarDisabled ? null : ventaIvaLabel,
      clienteDisabled: !canReadClients || mesaToolbarDisabled,
      clienteConfigurado: Boolean(clienteSeleccionado) && !mesaToolbarDisabled,
      toolbarDisabled: mesaToolbarDisabled,
      comprobanteLabel: mesaToolbarDisabled
        ? "Sin comprobante"
        : comprobanteDisplayLabel,
      pagoLabel: mesaToolbarDisabled ? "Elegir forma de pago" : pagoResumenLabel,
      pagoConfigurado: pagoConfigurado && !mesaToolbarDisabled,
      descuentoLabel: mesaToolbarDisabled ? "Sin descuento" : descuentoToolbarLabel,
      hayDescuento: hayDescuento && !mesaToolbarDisabled,
      onClienteClick: () => {
        if (!canReadClients || mesaToolbarDisabled) return
        setBusquedaClienteModal("")
        setClienteModalAbierto(true)
      },
      onComprobanteClick: () => {
        if (mesaToolbarDisabled) return
        setComprobanteModalAbierto(true)
      },
      onPagoClick: () => {
        if (mesaToolbarDisabled) return
        setPagoModalAbierto(true)
      },
      onDescuentoClick: () => {
        if (mesaToolbarDisabled) return
        abrirModalDescuento()
      },
    },
    actions: {
      discardDisabled: !hayContenidoVenta,
      confirmDisabled: !puedeRegistrar,
      confirmLoading: submitting,
      onDiscard: () => setDescartarConfirmOpen(true),
      onConfirm: () => {
        setSubmitError(null)
        setConfirmOpen(true)
      },
    },
    modals: {
      clienteModalAbierto,
      setClienteModalAbierto,
      comprobanteModalAbierto,
      setComprobanteModalAbierto,
      pagoModalAbierto,
      setPagoModalAbierto,
      descuentoModalAbierto,
      setDescuentoModalAbierto,
      descartarConfirmOpen,
      setDescartarConfirmOpen,
      confirmOpen,
      setConfirmOpen,
      busquedaClienteModal,
      setBusquedaClienteModal,
      manualNombreCliente,
      setManualNombreCliente,
      fiscalDocVenta,
      setFiscalDocVenta,
      ventaIvaCondition,
      setVentaIvaCondition,
      clienteSeleccionado,
      setClienteSeleccionado,
      ventaPadron,
      clientesFiltradosModal,
      comprobante,
      comprobantePickerOptions,
      elegirComprobante,
      paymentMethodListItems,
      payOnClientAccount,
      setPayOnClientAccount,
      metodoPagoSeleccionado,
      setMetodoPagoSeleccionado,
      descuentoDraftModo,
      setDescuentoDraftModo,
      descuentoDraftTexto,
      setDescuentoDraftTexto,
      subtotal,
      aplicarDescuentoModal,
      quitarDescuento: () => {
        setModoDescuento("porcentaje")
        setValorDescuentoPorcentaje(0)
        setValorDescuentoFijo(0)
        setDescuentoModalAbierto(false)
      },
      limpiarPedido,
      confirmarMesa,
      submitError,
      total,
      payOnClientAccountLabel: CLIENT_ACCOUNT_PAYMENT_LABEL,
      seleccionarCliente: (c: SaleCatalogClient) => {
        setClienteSeleccionado({
          id: c.id,
          manual: false,
          name: c.name,
          taxId: c.taxId,
          ivaCondition: c.ivaCondition,
          defaultInvoiceTypeLabel: c.defaultInvoiceTypeLabel,
        })
        setManualNombreCliente(c.name)
        setFiscalDocVenta(c.taxId ?? "")
        setVentaIvaCondition(c.ivaCondition ?? "")
        const resolved = resolveSaleComprobanteForClient({
          clientIvaCondition: c.ivaCondition as ClientIvaConditionValue | null,
          defaultInvoiceTypeLabel: c.defaultInvoiceTypeLabel,
        })
        elegirComprobante(resolved)
        setClienteModalAbierto(false)
      },
      aplicarComprobanteDesdeIva: (iva: ClientIvaConditionValue) => {
        const suggested = suggestSaleComprobanteForClientIva(iva)
        if (suggested) elegirComprobante(suggested)
      },
      quitarCliente: () => {
        setClienteSeleccionado(null)
        setManualNombreCliente("")
        setFiscalDocVenta("")
        setVentaIvaCondition("")
      },
    },
  }
}

export type MesasSaleCheckout = ReturnType<typeof useMesasSaleCheckout>
