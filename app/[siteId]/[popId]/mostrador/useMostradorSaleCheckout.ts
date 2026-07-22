"use client"

import { saveCounterOrderCheckout, closeCounterOrderCheckout } from "@/app/[siteId]/[popId]/mostrador/actions"
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
  computeMenuQuantityDealApplications,
  computeMenuQuantityDealDiscounts,
  buildMenuCartTotalsLines,
  menuCartOrderTotals,
  menuPromotionToProduct,
  removeQuantityDealApplicationFromCart,
  tryAutoComboSelections,
} from "@/lib/menuCheckoutPromotions"
import type { PromotionCartSelection } from "@/lib/promotionPricing"
import {
  buildMostradorCartDisplayRows,
  cartDetailItemsFromCarrito,
  countAppliedPromotions,
  groupMostradorCartDisplayRows,
} from "@/lib/mostradorCartDisplay"
import {
  applyTicketLineEdit,
  addProductToTicketCart,
  addPromotionToTicketCart,
  applyPartialPaymentCartMaterialization,
} from "@/lib/menuSaleTicketCart"
import {
  ensureCartLineIds,
  type MostradorCartLineEditInput,
} from "@/lib/menuCartLineMerge"
import {
  clearCartLineOverrides,
  type OperationCartLineOverrideActions,
  type OperationCartLineOverrideState,
} from "@/components/sale-operation/OperationCartLineRow"
import {
  menuArticleToProduct,
  menuRecipeToProduct,
  type MenuCatalogProduct,
} from "@/lib/menuCatalogProduct"
import {
  cartItemsMatch,
  normalizeCartItemKind,
  resolveCartLineId,
  type MenuCartItemKind,
} from "@/lib/menuCart"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import { buildCompleteSaleLinesFromCart } from "@/lib/saleCompleteLines"
import {
  applyPartialPaymentSuccess,
  buildCarritoForPartialSelection,
  buildPartialPaymentUnits,
  buildUnpaidCarrito,
  cartLineHasPaidUnits,
  computePartialPaymentPricingContext,
  computeSelectionCheckoutTotals,
  hasAnyPartialPayment,
  isCheckoutFullyPaid,
  isQuantityDealApplicationPaid,
  type PartialPaymentSelection,
} from "@/lib/partialCheckoutSelection"
import type { SaleOperationCheckoutConfirmOptions } from "@/components/sale-operation/SaleOperationCheckoutConfirmDialog"
import { evaluateChannelCloseEligibility } from "@/lib/channelCheckoutClose"
import { CLIENT_IVA_CONDITION_OPTIONS, type ClientIvaConditionValue } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import { CLIENT_ACCOUNT_PAYMENT_LABEL } from "@/lib/operationPaymentLabels"
import {
  getSaleComprobanteDisplayLabel,
  hasConfiguredSaleComprobante,
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

export type RemoteCounterOrderCheckout = {
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

export function useMostradorSaleCheckout(
  popId: string | undefined,
  siteId: string,
  counterOrderId: string | null,
  remoteOrder: RemoteCounterOrderCheckout = null,
  options?: { isPaid?: boolean; onSaleComplete?: () => void },
) {
  const isPaid = options?.isPaid === true
  const onSaleComplete = options?.onSaleComplete
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
  const [partialPayment, setPartialPayment] = useState(false)
  const [partialSelection, setPartialSelection] = useState<PartialPaymentSelection>({})
  const [closeOnComplete, setCloseOnComplete] = useState(true)
  const [imprimirComprobante, setImprimirComprobante] = useState(true)
  const [paidPartialUnits, setPaidPartialUnits] = useState<Record<string, number>>({})
  const [totalPagadoAcumulado, setTotalPagadoAcumulado] = useState(0)
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
    paidPartialUnits,
    totalPagadoAcumulado,
  }

  const applySessionSnapshot = useCallback((snap: TableSessionCheckoutSnapshot) => {
    skipNextPersistRef.current = true
    if (snap.comprobante != null) {
      comprobanteInitRef.current = true
    }
    setItemDescuentoModo(snap.itemDescuentoModo ?? {})
    setItemDescuentoDraft(snap.itemDescuentoDraft ?? {})
    setItemDescuentoSuprimido(snap.itemDescuentoSuprimido ?? {})
    setItemComentarios(snap.itemComentarios ?? {})
    const materialized = applyPartialPaymentCartMaterialization({
      carrito: ensureCartLineIds(snap.carrito),
      paidPartialUnits: snap.paidPartialUnits ?? {},
      setters: {
        setItemDescuentoModo,
        setItemDescuentoDraft,
        setItemDescuentoSuprimido,
        setItemComentarios,
      },
    })
    setCarrito(materialized.carrito)
    setPaidPartialUnits(materialized.paidPartialUnits)
    setTotalPagadoAcumulado(snap.totalPagadoAcumulado ?? 0)
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
    setPartialPayment(false)
    setPartialSelection({})
    setCloseOnComplete(true)
    setImprimirComprobante(true)
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
      const res = await saveCounterOrderCheckout(popId, siteId, sessionId, snap)
      if (res.success) {
        lastSavedUpdatedAtRef.current = res.updatedAt
      }
    },
    [popId, siteId],
  )

  useEffect(() => {
    const prevId = loadedSessionIdRef.current
    if (prevId && prevId !== counterOrderId && popId) {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current)
        persistTimerRef.current = null
      }
      void flushCheckoutPersist(prevId, checkoutStateRef.current)
    }

    loadedSessionIdRef.current = counterOrderId
    lastSavedUpdatedAtRef.current = null
    lastAppliedRemoteUpdatedAtRef.current = null
    comprobanteInitRef.current = false

    if (counterOrderId && remoteOrder) {
      const snap =
        remoteOrder.checkout ??
        emptyTableSessionCheckout(
          defaultComprobanteForPop(popId, invoiceTypeSiteId),
        )
      applySessionSnapshot(snap)
      lastAppliedRemoteUpdatedAtRef.current = remoteOrder.updatedAt
    } else if (counterOrderId) {
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
  }, [counterOrderId, applySessionSnapshot])

  useEffect(() => {
    if (!counterOrderId || !remoteOrder) return
    const { updatedAt, checkout } = remoteOrder
    if (updatedAt === lastSavedUpdatedAtRef.current) return
    if (updatedAt === lastAppliedRemoteUpdatedAtRef.current) return

    const snap =
      checkout ??
      emptyTableSessionCheckout(defaultComprobanteForPop(popId, invoiceTypeSiteId))
    applySessionSnapshot(snap)
    lastAppliedRemoteUpdatedAtRef.current = updatedAt
  }, [
    counterOrderId,
    remoteOrder?.updatedAt,
    remoteOrder?.checkout,
    applySessionSnapshot,
    popId,
    invoiceTypeSiteId,
  ])

  useEffect(() => {
    if (!popId || !counterOrderId) return
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false
      return
    }

    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current)
    }

    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null
      void flushCheckoutPersist(counterOrderId, checkoutStateRef.current)
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
    counterOrderId,
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
    paidPartialUnits,
    totalPagadoAcumulado,
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
    setCarrito((prev) => ensureCartLineIds(prev))
  }, [])

  useEffect(() => {
    void loadCatalog()
  }, [loadCatalog])

  useEffect(() => {
    if (salePaymentMethods.length === 0 || counterOrderId == null) return
    setMetodoPagoSeleccionado((prev) => {
      if (prev && salePaymentMethods.some((m) => m.id === prev.id)) return prev
      const efectivo = salePaymentMethods.find((m) => m.kind === "cash")
      return efectivo ? { id: efectivo.id, label: efectivo.name } : null
    })
  }, [salePaymentMethods, counterOrderId])

  useEffect(() => {
    if (!popId || comprobanteInitRef.current || counterOrderId == null) return
    comprobanteInitRef.current = true
    const saved = readSavedSaleComprobante(popId)
    if (saved !== undefined) {
      setComprobante(
        isAllowedSaleComprobanteLabel(invoiceTypeSiteId, saved) ? saved : null,
      )
    }
  }, [popId, invoiceTypeSiteId, counterOrderId])

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

  const unpaidCarrito = useMemo(
    () =>
      buildUnpaidCarrito({
        carrito,
        paidPartialUnits,
        quantityDealApplications,
      }),
    [carrito, paidPartialUnits, quantityDealApplications],
  )

  const mapCarritoToDetallados = useCallback(
    (source: MesasCartItem[]) =>
      source
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
            lineId: resolveCartLineId({ ...i, kind }),
            cartLineKey: resolveCartLineId({ ...i, kind }),
            producto,
          }
        })
        .filter((i): i is NonNullable<typeof i> => i != null),
    [productosByKey],
  )

  const itemsDetallados = useMemo(
    () => mapCarritoToDetallados(carrito),
    [carrito, mapCarritoToDetallados],
  )

  const itemsDetalladosUnpaid = useMemo(
    () => mapCarritoToDetallados(unpaidCarrito),
    [unpaidCarrito, mapCarritoToDetallados],
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
        items: itemsDetalladosUnpaid,
        quantityDealApplications,
        quantityDealDiscounts,
        itemDescuentoModo,
        itemDescuentoDraft,
        itemDescuentoSuprimido,
      }),
    [
      itemsDetalladosUnpaid,
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

  const subtotal = catalogTotals.subtotal
  const descuentoItemsMonto = useMemo(
    () =>
      catalogTotals.descuentoCatalogoMonto + catalogTotals.descuentoManualMonto,
    [catalogTotals.descuentoCatalogoMonto, catalogTotals.descuentoManualMonto],
  )
  const promocionesAplicadasMonto = useMemo(
    () =>
      catalogTotals.descuentoPromoMonto +
      catalogTotals.descuentoQuantityDealMonto,
    [catalogTotals.descuentoPromoMonto, catalogTotals.descuentoQuantityDealMonto],
  )
  const hayDescuentoItems = descuentoItemsMonto > 0

  const descuentoMonto = useMemo(() => {
    if (modoDescuento === "porcentaje") {
      return subtotal * (valorDescuentoPorcentaje / 100)
    }
    return Math.min(valorDescuentoFijo, subtotal)
  }, [modoDescuento, subtotal, valorDescuentoPorcentaje, valorDescuentoFijo])

  const total = subtotal - descuentoMonto
  const hayDescuento = descuentoMonto > 0
  const hayItemsEnPedido = itemsDetalladosUnpaid.length > 0

  const checkoutFullyPaid = useMemo(
    () =>
      carrito.length > 0 &&
      isCheckoutFullyPaid({
        carrito,
        paidPartialUnits,
        quantityDealApplications,
      }),
    [carrito, paidPartialUnits, quantityDealApplications],
  )

  const channelCloseEligibility = useMemo(
    () =>
      evaluateChannelCloseEligibility({
        carrito,
        paidPartialUnits,
        totalPagadoAcumulado,
        quantityDealApplications,
        isAlreadySettled: isPaid,
      }),
    [
      carrito,
      paidPartialUnits,
      totalPagadoAcumulado,
      quantityDealApplications,
      isPaid,
    ],
  )

  const puedeCerrarPedido = channelCloseEligibility.canClose
  const cerrarPedidoBlockReason = channelCloseEligibility.blockReason
  const cerrarPedidoMode = channelCloseEligibility.mode

  const puedeCancelarPedido = useMemo(
    () =>
      !isPaid &&
      !hasAnyPartialPayment({ paidPartialUnits, totalPagadoAcumulado }),
    [isPaid, paidPartialUnits, totalPagadoAcumulado],
  )

  const partialPaymentUnits = useMemo(
    () =>
      buildPartialPaymentUnits({
        groups: groupMostradorCartDisplayRows(cartDisplayRows),
        carrito,
        paidPartialUnits,
        overrides: overrideSnapshot,
        productosByKey,
      }),
    [cartDisplayRows, carrito, paidPartialUnits, overrideSnapshot, productosByKey],
  )

  const confirmCheckoutTotals = useMemo(() => {
    if (!partialPayment) {
      return { subtotal, descuentoMonto, total }
    }
    return computeSelectionCheckoutTotals({
      carrito,
      itemsDetallados,
      quantityDealApplications,
      quantityDealDiscounts,
      overrides: overrideSnapshot,
      selection: partialSelection,
      units: partialPaymentUnits,
      fullSubtotal: subtotal,
      modoDescuento,
      valorDescuentoPorcentaje,
      valorDescuentoFijo,
    })
  }, [
    partialPayment,
    subtotal,
    descuentoMonto,
    total,
    carrito,
    itemsDetallados,
    quantityDealApplications,
    quantityDealDiscounts,
    overrideSnapshot,
    partialSelection,
    partialPaymentUnits,
    modoDescuento,
    valorDescuentoPorcentaje,
    valorDescuentoFijo,
  ])
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
      counterOrderId != null &&
      !isPaid,
    [
      hayItemsEnPedido,
      pagoConfigurado,
      payOnClientAccount,
      clienteSeleccionado?.id,
      metodoPagoSeleccionado,
      canCreateSale,
      canReadCashRegisters,
      openCashSession,
      counterOrderId,
      isPaid,
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
      setCarrito((prev) =>
        addPromotionToTicketCart({
          carrito: prev,
          promotionId,
          selections,
          paidPartialUnits,
        }),
      )
    },
    [productosByKey, paidPartialUnits],
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

      setCarrito((prev) =>
        addProductToTicketCart({
          carrito: prev,
          productoId,
          kindHint: kind,
          productosByKey,
          overrides: {
            itemDescuentoModo,
            itemDescuentoDraft,
            itemDescuentoSuprimido,
            itemComentarios,
          },
          overrideActions: cartLineOverrideActions,
          paidPartialUnits,
        }),
      )
    },
    [
      productosByKey,
      itemDescuentoModo,
      itemDescuentoDraft,
      itemDescuentoSuprimido,
      itemComentarios,
      cartLineOverrideActions,
      agregarPromoAlCarrito,
      paidPartialUnits,
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
        const target = prev.find((i) => resolveCartLineId(i) === lineId)
        if (
          !target ||
          target.paidLocked ||
          cartLineHasPaidUnits(lineId, target, paidPartialUnits)
        ) {
          return prev
        }
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
    [cartLineOverrideActions, paidPartialUnits],
  )

  const quitarLineaPorId = useCallback(
    (lineId: string) => {
      setCarrito((prev) => {
        const target = prev.find((i) => resolveCartLineId(i) === lineId)
        if (
          target?.paidLocked ||
          (target &&
            cartLineHasPaidUnits(lineId, target, paidPartialUnits))
        ) {
          return prev
        }
        return prev.filter((i) => resolveCartLineId(i) !== lineId)
      })
      clearCartLineOverrides(lineId, cartLineOverrideActions)
    },
    [cartLineOverrideActions, paidPartialUnits],
  )

  const quitarQuantityDealApplication = useCallback(
    (applicationId: string) => {
      if (isQuantityDealApplicationPaid(applicationId, paidPartialUnits)) {
        return
      }
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
    [quantityDealApplications, cartLineOverrideActions, paidPartialUnits],
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
    setPaidPartialUnits({})
    setTotalPagadoAcumulado(0)
    setPartialPayment(false)
    setPartialSelection({})
    setCloseOnComplete(true)
    setImprimirComprobante(true)
    setDescartarConfirmOpen(false)
    setConfirmOpen(false)
    setSubmitError(null)
  }, [popId, salePaymentMethods])

  const cerrarPedido = useCallback(async () => {
    if (
      !popId ||
      !siteId ||
      !counterOrderId ||
      isPaid ||
      !puedeCerrarPedido ||
      !cerrarPedidoMode
    ) {
      return false
    }
    setSubmitError(null)
    setSubmitting(true)
    try {
      const res = await closeCounterOrderCheckout(
        popId,
        siteId,
        counterOrderId,
        cerrarPedidoMode,
      )
      if (!res.success) {
        setSubmitError(res.error)
        return false
      }
      limpiarPedido()
      onSaleComplete?.()
      return true
    } finally {
      setSubmitting(false)
    }
  }, [
    popId,
    siteId,
    counterOrderId,
    isPaid,
    puedeCerrarPedido,
    cerrarPedidoMode,
    limpiarPedido,
    onSaleComplete,
  ])

  const confirmarPedido = useCallback(
    async (options?: SaleOperationCheckoutConfirmOptions) => {
      if (!popId || !siteId || !pagoConfigurado || !counterOrderId) return false
      const isPartial = options?.partialPayment === true
      const selection = options?.partialSelection ?? {}
      const shouldClose = !isPartial && options?.closeOnComplete === true

      setSubmitError(null)
      setSubmitting(true)
      try {
        const carritoToSell = isPartial
          ? buildCarritoForPartialSelection({
              carrito,
              units: partialPaymentUnits,
              selection,
              quantityDealApplications,
            })
          : unpaidCarrito

        if (carritoToSell.length === 0) {
          setSubmitError("No hay ítems seleccionados para cobrar.")
          return false
        }

        const saleTotals = isPartial
          ? computeSelectionCheckoutTotals({
              carrito,
              itemsDetallados,
              quantityDealApplications,
              quantityDealDiscounts,
              overrides: overrideSnapshot,
              selection,
              units: partialPaymentUnits,
              fullSubtotal: subtotal,
              modoDescuento,
              valorDescuentoPorcentaje,
              valorDescuentoFijo,
            })
          : { subtotal, descuentoMonto, total }

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

        const partialPricingContext = isPartial
          ? computePartialPaymentPricingContext({
              units: partialPaymentUnits,
              selection,
              quantityDealApplications,
              quantityDealDiscounts,
            })
          : null

        const res = await completeSale(popId, {
          siteId,
          lines: buildCompleteSaleLinesFromCart({
            carrito: carritoToSell,
            quantityDealApplications:
              partialPricingContext?.quantityDealApplications ??
              quantityDealApplications,
            quantityDealDiscounts:
              partialPricingContext?.quantityDealDiscounts ??
              quantityDealDiscounts,
            regularOnlyLineKeys: partialPricingContext?.regularOnlyLineKeys,
            itemDescuentoModo,
            itemDescuentoDraft,
            itemDescuentoSuprimido,
            itemComentarios,
          }),
          clientId: catalogClientId,
          payOnClientAccount,
          paymentMethodId: payOnClientAccount ? null : metodoPagoSeleccionado?.id,
          generalDiscountMode:
            modoDescuento === "porcentaje" ? "porcentaje" : "fijo",
          valorDescuentoPorcentaje:
            modoDescuento === "porcentaje" ? valorDescuentoPorcentaje : 0,
          valorDescuentoFijo:
            modoDescuento === "fijo" ? saleTotals.descuentoMonto : 0,
          invoiceTypeLabel: comprobante,
          customerIvaCondition:
            ventaIvaCondition.trim() || clienteSeleccionado?.ivaCondition || null,
          fiscalCustomer: hasFiscalOverride
            ? { name: manualOrFiscalName, taxId: manualOrFiscalTaxId }
            : null,
          counterOrderId,
          linkCounterOrder: shouldClose,
          channelOrderTotal: totalPagadoAcumulado + total,
          channelPaidAccumulated: totalPagadoAcumulado + saleTotals.total,
          isPartialChannelPayment: isPartial,
        })
        if (!res.success) {
          setSubmitError(res.error)
          return false
        }

        setConfirmOpen(false)
        setPartialPayment(false)
        setPartialSelection({})

        if (isPartial) {
          const nextPaid = applyPartialPaymentSuccess(
            { paidPartialUnits, totalPagadoAcumulado },
            partialPaymentUnits,
            selection,
            saleTotals.total,
          )
          const materialized = applyPartialPaymentCartMaterialization({
            carrito,
            paidPartialUnits: nextPaid.paidPartialUnits,
            setters: {
              setItemDescuentoModo,
              setItemDescuentoDraft,
              setItemDescuentoSuprimido,
              setItemComentarios,
            },
          })
          setCarrito(materialized.carrito)
          setPaidPartialUnits(materialized.paidPartialUnits)
          setTotalPagadoAcumulado(nextPaid.totalPagadoAcumulado)

          const fullyPaid = isCheckoutFullyPaid({
            carrito: materialized.carrito,
            paidPartialUnits: materialized.paidPartialUnits,
            quantityDealApplications,
          })
          if (fullyPaid) {
            limpiarPedido()
            onSaleComplete?.()
          }
          return true
        }

        if (shouldClose) {
          limpiarPedido()
        } else {
          setCarrito([])
          setItemDetalleAbiertoId(null)
          setItemDescuentoModo({})
          setItemDescuentoDraft({})
          setItemDescuentoSuprimido({})
          setItemComentarios({})
          setPaidPartialUnits({})
          setTotalPagadoAcumulado(0)
          setModoDescuento("porcentaje")
          setValorDescuentoPorcentaje(0)
          setValorDescuentoFijo(0)
        }
        onSaleComplete?.()
        return true
      } finally {
        setSubmitting(false)
      }
    },
    [
      popId,
      siteId,
      counterOrderId,
      carrito,
      unpaidCarrito,
      partialPaymentUnits,
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
      quantityDealApplications,
      itemsDetallados,
      overrideSnapshot,
      subtotal,
      descuentoMonto,
      total,
      paidPartialUnits,
      totalPagadoAcumulado,
      limpiarPedido,
      onSaleComplete,
    ],
  )

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
    : counterOrderId == null
      ? "Sin pedido seleccionado"
      : (clienteSeleccionado?.name ?? "Elegir cliente")

  const sessionClientLabel = useMemo(() => {
    if (!canReadClients) return "Sin permiso"
    const manual = manualNombreCliente.trim()
    return clienteSeleccionado?.name ?? (manual || null)
  }, [canReadClients, clienteSeleccionado?.name, manualNombreCliente])

  const pedidoToolbarDisabled = counterOrderId == null

  return {
    catalogLoading,
    catalogError,
    menuCategorySections,
    productosCatalogo,
    carrito,
    itemsDetallados,
    cartDisplayRows,
    agregarAlCarrito,
    agregarPromoAlCarrito,
    aplicarEdicionLineaTicket,
    cambiarCantidadPorLinea,
    quitarLineaPorId,
    quitarQuantityDealApplication,
    subtotal,
    subtotalOriginal: catalogTotals.subtotalOriginal,
    descuentoItemsMonto,
    hayDescuentoItems,
    promocionesAplicadasMonto,
    promocionesAplicadasCount,
    descuentoCatalogoMonto: catalogTotals.descuentoCatalogoMonto,
    hayDescuentoCatalogo: catalogTotals.hayDescuentoCatalogo,
    descuentoMonto,
    total,
    totalPagadoAcumulado,
    paidPartialUnits,
    hayDescuento,
    hayItemsEnPedido,
    checkoutFullyPaid,
    puedeCerrarPedido,
    cerrarPedidoBlockReason,
    cerrarPedidoMode,
    cerrarPedido,
    puedeCancelarPedido,
    hayContenidoVenta,
    puedeRegistrar,
    submitting,
    submitError,
    sessionClientLabel,
    promoWizardOpen,
    setPromoWizardOpen,
    promoWizardTarget,
    confirmarPromoWizard: agregarPromoAlCarrito,
    cartLineOverrides,
    cartLineOverrideActions,
    // Toolbox
    toolbox: {
      clienteLabel: clienteToolbarLabel,
      clienteIvaLabel: pedidoToolbarDisabled ? null : ventaIvaLabel,
      clienteDisabled: !canReadClients || pedidoToolbarDisabled,
      clienteConfigurado: Boolean(clienteSeleccionado) && !pedidoToolbarDisabled,
      toolbarDisabled: pedidoToolbarDisabled,
      comprobanteLabel: pedidoToolbarDisabled
        ? "Sin comprobante"
        : comprobanteDisplayLabel,
      pagoLabel: pedidoToolbarDisabled ? "Elegir forma de pago" : pagoResumenLabel,
      pagoConfigurado: pagoConfigurado && !pedidoToolbarDisabled,
      descuentoLabel: pedidoToolbarDisabled ? "Sin descuento" : descuentoToolbarLabel,
      hayDescuento: hayDescuento && !pedidoToolbarDisabled,
      onClienteClick: () => {
        if (!canReadClients || pedidoToolbarDisabled) return
        setBusquedaClienteModal("")
        setClienteModalAbierto(true)
      },
      onComprobanteClick: () => {
        if (pedidoToolbarDisabled) return
        setComprobanteModalAbierto(true)
      },
      onPagoClick: () => {
        if (pedidoToolbarDisabled) return
        setPagoModalAbierto(true)
      },
      onDescuentoClick: () => {
        if (pedidoToolbarDisabled) return
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
        setPartialPayment(false)
        setPartialSelection({})
        setCloseOnComplete(true)
        setImprimirComprobante(hasConfiguredSaleComprobante(comprobante))
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
      confirmarPedido,
      confirmarMesa: confirmarPedido,
      submitError,
      total: confirmCheckoutTotals.total,
      confirmSubtotal: confirmCheckoutTotals.subtotal,
      confirmDescuentoMonto: confirmCheckoutTotals.descuentoMonto,
      confirmHayDescuento: confirmCheckoutTotals.descuentoMonto > 0,
      partialPayment,
      setPartialPayment,
      partialSelection,
      setPartialSelection,
      closeOnComplete,
      setCloseOnComplete,
      imprimirComprobante,
      setImprimirComprobante,
      partialPaymentUnits,
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

export type MostradorSaleCheckout = ReturnType<typeof useMostradorSaleCheckout>
