"use client"

import { saveCounterOrderCheckout, closeCounterOrderCheckout } from "@/app/[siteId]/[popId]/mostrador/actions"
import {
  emptyTableSessionCheckout,
  type MesasCartItem,
  type MesasClienteSeleccionado,
  type TableSessionCheckoutSnapshot,
} from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import type { MenuCatalogPromotion } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type { SaleCatalogClient, SaleCatalogPaymentOption, SaleOpenCashSession } from "@/app/[siteId]/[popId]/sale/actions"
import { useMenuCatalogLoader } from "@/hooks/useMenuCatalogLoader"
import { usePopSaleComprobanteFiscalContext } from "@/hooks/usePopSaleComprobanteFiscalContext"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { clientsAccessFromKeys } from "@/lib/popWorkspaceAccess"
import {
  buildOperationPartyManualSelection,
  type OperationPartyManualConfirmOptions,
  type OperationPartyManualConfirmPayload,
} from "@/lib/operationPartyPicker"
import {
  generalDiscountToolbarLabel,
  healLegacyLockedGeneralDiscount,
  isGeneralDiscountEditBlocked,
} from "@/lib/generalDiscountLock"
import {
  defaultCheckoutPaymentSelection,
  resolveSaleToolboxPaymentDisplay,
} from "@/lib/saleCheckoutPayment"
import { treasuryPaymentOptionKey } from "@/lib/treasuryPaymentOptions"
import { completeSale } from "@/app/[siteId]/[popId]/sale/completeSale"
import { getSalePriceListSession } from "@/lib/salePriceListSession"
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
import { computeOrderTotalBreakdown } from "@/lib/orderTotalBreakdown"
import type { PromotionCartSelection } from "@/lib/promotionPricing"
import {
  buildMostradorCartDisplayRows,
  cartDetailItemsFromCarrito,
  clearComboCommentsForCartLine,
  countAppliedPromotions,
  groupMostradorCartDisplayRows,
} from "@/lib/mostradorCartDisplay"
import {
  applyTicketLineEdit,
  addProductToTicketCart,
  addPromotionToTicketCart,
  applyPartialPaymentCartMaterialization,
  copyTicketLineOverrides,
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
  buildFullUnpaidSelection,
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
import type { SaleChannelCheckoutConfirmOptions } from "@/components/checkout/saleChannelCheckoutTypes"
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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
  popEmisorIvaCondition: ReturnType<
    typeof usePopSaleComprobanteFiscalContext
  >["popEmisorIvaCondition"],
  hasValidPopFiscalCuit: boolean,
): string | null {
  if (!popId) return null
  const persisted = readSavedSaleComprobante(popId)
  if (
    persisted !== undefined &&
    isAllowedSaleComprobanteLabel(
      invoiceTypeSiteId,
      persisted,
      popEmisorIvaCondition,
      hasValidPopFiscalCuit,
    )
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
  options?: {
    isPaid?: boolean
    onSaleComplete?: () => void
    catalogSidebarOpen?: boolean
    catalogLoadEnabled?: boolean
    onCartLineAdded?: (lineId: string) => void
  },
) {
  const isPaid = options?.isPaid === true
  const onSaleComplete = options?.onSaleComplete
  const onCartLineAdded = options?.onCartLineAdded
  const catalogEnabled =
    options?.catalogLoadEnabled ??
    (Boolean(counterOrderId) || Boolean(options?.catalogSidebarOpen))

  const {
    menuCategorySections,
    menuRecipes,
    menuArticles,
    menuPromotions,
    menuQuantityDeals,
    treasuryPaymentContext,
    canReadClients,
    canCreateSale,
    canReadCashRegisters,
    openCashSession,
    invoiceTypeSiteId,
    catalogLoading,
    catalogError,
    catalogLoadAttempted,
    mergeCatalogArticles,
    mergeCatalogRecipes,
    ensureCatalogItems,
  } = useMenuCatalogLoader(popId, { enabled: catalogEnabled })

  const {
    hasValidPopFiscalCuit,
    popEmisorIvaCondition,
    bootstrapLoaded,
  } = usePopSaleComprobanteFiscalContext()

  const { bootstrap } = usePopWorkspace()
  const canCreateClient = useMemo(
    () => clientsAccessFromKeys(bootstrap?.permissionKeys ?? []).canCreate,
    [bootstrap?.permissionKeys],
  )

  const [carrito, setCarrito] = useState<MesasCartItem[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<MesasClienteSeleccionado | null>(null)
  const [manualNombreCliente, setManualNombreCliente] = useState("")
  const [fiscalDocVenta, setFiscalDocVenta] = useState("")
  const [ventaEmail, setVentaEmail] = useState("")
  const [ventaIvaCondition, setVentaIvaCondition] = useState("")
  const [comprobante, setComprobante] = useState<string | null>(null)
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] =
    useState<SaleCatalogPaymentOption | null>(null)
  const [payOnClientAccount, setPayOnClientAccount] = useState(false)
  const [modoDescuento, setModoDescuento] = useState<"porcentaje" | "fijo">("porcentaje")
  const [valorDescuentoPorcentaje, setValorDescuentoPorcentaje] = useState(0)
  const [valorDescuentoFijo, setValorDescuentoFijo] = useState(0)
  const [descuentoGeneralBloqueado, setDescuentoGeneralBloqueado] = useState(false)

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
    descuentoGeneralBloqueado,
  }

  const applySessionSnapshot = useCallback((snap: TableSessionCheckoutSnapshot) => {
    const healed = healLegacyLockedGeneralDiscount(snap)
    const shouldPersistHealedDiscount =
      healed.descuentoGeneralBloqueado === true &&
      (healed.modoDescuento !== snap.modoDescuento ||
        healed.valorDescuentoPorcentaje !== snap.valorDescuentoPorcentaje ||
        healed.valorDescuentoFijo !== snap.valorDescuentoFijo)
    skipNextPersistRef.current = !shouldPersistHealedDiscount
    if (healed.comprobante != null) {
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
    setModoDescuento(healed.modoDescuento)
    setValorDescuentoPorcentaje(healed.valorDescuentoPorcentaje)
    setValorDescuentoFijo(healed.valorDescuentoFijo)
    setDescuentoGeneralBloqueado(healed.descuentoGeneralBloqueado === true)
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
        lastAppliedRemoteUpdatedAtRef.current = res.updatedAt
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
          defaultComprobanteForPop(popId, invoiceTypeSiteId, popEmisorIvaCondition, hasValidPopFiscalCuit),
        )
      applySessionSnapshot(snap)
      lastAppliedRemoteUpdatedAtRef.current = remoteOrder.updatedAt
    } else if (counterOrderId) {
      applySessionSnapshot(
        emptyTableSessionCheckout(
          defaultComprobanteForPop(popId, invoiceTypeSiteId, popEmisorIvaCondition, hasValidPopFiscalCuit),
        ),
      )
    } else {
      applySessionSnapshot(
        emptyTableSessionCheckout(
          defaultComprobanteForPop(popId, invoiceTypeSiteId, popEmisorIvaCondition, hasValidPopFiscalCuit),
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
      emptyTableSessionCheckout(defaultComprobanteForPop(popId, invoiceTypeSiteId, popEmisorIvaCondition, hasValidPopFiscalCuit))
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
    descuentoGeneralBloqueado,
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
    manual: true,
  })

  useEffect(() => {
    setCarrito((prev) => ensureCartLineIds(prev))
  }, [])

  useEffect(() => {
    if (!openCashSession?.cashTreasuryAccountId || counterOrderId == null) return
    setMetodoPagoSeleccionado((prev) => {
      if (
        prev &&
        (prev.kind !== "cash" ||
          prev.treasuryAccountId === openCashSession.cashTreasuryAccountId)
      ) {
        return prev
      }
      return defaultCheckoutPaymentSelection(openCashSession.cashTreasuryAccountId)
    })
  }, [openCashSession, counterOrderId])

  useEffect(() => {
    if (!popId || !bootstrapLoaded || comprobanteInitRef.current || counterOrderId == null) return
    comprobanteInitRef.current = true
    const saved = readSavedSaleComprobante(popId)
    if (saved !== undefined) {
      setComprobante(
        isAllowedSaleComprobanteLabel(
          invoiceTypeSiteId,
          saved,
          popEmisorIvaCondition,
          hasValidPopFiscalCuit,
        )
          ? saved
          : null,
      )
    }
  }, [
    popId,
    invoiceTypeSiteId,
    counterOrderId,
    bootstrapLoaded,
    popEmisorIvaCondition,
    hasValidPopFiscalCuit,
  ])

  useEffect(() => {
    if (!bootstrapLoaded) return
    setComprobante((current) => {
      if (current == null) return current
      return isAllowedSaleComprobanteLabel(
        invoiceTypeSiteId,
        current,
        popEmisorIvaCondition,
        hasValidPopFiscalCuit,
      )
        ? current
        : null
    })
  }, [
    bootstrapLoaded,
    invoiceTypeSiteId,
    popEmisorIvaCondition,
    hasValidPopFiscalCuit,
  ])

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

  useEffect(() => {
    const articleIds: string[] = []
    const recipeIds: string[] = []
    for (const item of carrito) {
      const kind = normalizeCartItemKind(item.kind)
      if (kind === "recipe") recipeIds.push(item.productoId)
      else if (kind === "article") articleIds.push(item.productoId)
    }
    void ensureCatalogItems(articleIds, recipeIds)
  }, [carrito, ensureCatalogItems])

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
        paidPartialUnits,
      }),
    [carrito, productosByKey, menuQuantityDeals, overrideSnapshot, paidPartialUnits],
  )

  const quantityDealDiscounts = useMemo(
    () =>
      computeMenuQuantityDealDiscounts({
        carrito,
        productosByKey,
        quantityDeals: menuQuantityDeals,
        overrides: overrideSnapshot,
        paidPartialUnits,
      }),
    [carrito, productosByKey, menuQuantityDeals, overrideSnapshot, paidPartialUnits],
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

  const fullCartTotalsInput = useMemo(
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

  const fullCatalogTotals = useMemo(
    () => menuCartOrderTotals(fullCartTotalsInput),
    [fullCartTotalsInput],
  )

  const footerTotals = useMemo(
    () =>
      computeOrderTotalBreakdown({
        catalogTotals: fullCatalogTotals,
        modoDescuento,
        valorDescuentoPorcentaje,
        valorDescuentoFijo,
        totalPagado: totalPagadoAcumulado,
      }),
    [
      fullCatalogTotals,
      modoDescuento,
      valorDescuentoPorcentaje,
      valorDescuentoFijo,
      totalPagadoAcumulado,
    ],
  )

  const descuentoItemsMonto = footerTotals.descuentoItemsMonto
  const promocionesAplicadasMonto = footerTotals.promocionesAplicadasMonto
  const hayDescuentoItems = footerTotals.hayDescuentoItems

  const subtotal = footerTotals.subtotalBeforeGeneral
  const descuentoMonto = footerTotals.descuentoMonto
  const total = footerTotals.total
  const hayDescuento = footerTotals.hayDescuento
  const hayItemsEnPedido = itemsDetalladosUnpaid.length > 0

  const puedeDescartarPedido = useMemo(
    () =>
      hayItemsEnPedido &&
      !isPaid &&
      !hasAnyPartialPayment({ paidPartialUnits, totalPagadoAcumulado }),
    [hayItemsEnPedido, isPaid, paidPartialUnits, totalPagadoAcumulado],
  )

  const descuentoGeneralEditBlocked = useMemo(
    () => isGeneralDiscountEditBlocked({ descuentoGeneralBloqueado }),
    [descuentoGeneralBloqueado],
  )

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
        groups: groupMostradorCartDisplayRows(cartDisplayRows, overrideSnapshot),
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
      fullSubtotal: footerTotals.subtotalBeforeGeneral,
      modoDescuento,
      valorDescuentoPorcentaje,
      valorDescuentoFijo,
    })
  }, [
    partialPayment,
    footerTotals.subtotalBeforeGeneral,
    footerTotals.descuentoMonto,
    footerTotals.total,
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

  const toolboxPaymentDisplay = useMemo(
    () =>
      resolveSaleToolboxPaymentDisplay({
        payOnClientAccount,
        metodoPagoSeleccionado,
        treasuryPaymentContext,
      }),
    [payOnClientAccount, metodoPagoSeleccionado, treasuryPaymentContext],
  )

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
    () =>
      getSaleComprobantePickerOptions(
        invoiceTypeSiteId,
        popEmisorIvaCondition,
        hasValidPopFiscalCuit,
      ),
    [invoiceTypeSiteId, popEmisorIvaCondition, hasValidPopFiscalCuit],
  )

  const clienteCatalogoBloqueado =
    clienteSeleccionado != null && !clienteSeleccionado.manual

  const elegirComprobante = useCallback(
    (value: string | null) => {
      setComprobante(value)
      if (popId) writeSavedSaleComprobante(popId, value)
    },
    [popId],
  )

  const confirmarClienteManual = useCallback(
    (
      payload: OperationPartyManualConfirmPayload,
      _options: OperationPartyManualConfirmOptions,
    ) => {
      setManualNombreCliente(payload.name)
      setFiscalDocVenta(payload.taxId)
      setVentaEmail(payload.email)
      setVentaIvaCondition(payload.ivaCondition)
      setClienteSeleccionado(buildOperationPartyManualSelection(payload))
      if (payload.ivaCondition && hasValidPopFiscalCuit) {
        const suggested = suggestSaleComprobanteForClientIva(
          payload.ivaCondition as ClientIvaConditionValue,
          popEmisorIvaCondition,
        )
        if (
          suggested &&
          isAllowedSaleComprobanteLabel(
            invoiceTypeSiteId,
            suggested,
            popEmisorIvaCondition,
            hasValidPopFiscalCuit,
          )
        ) {
          elegirComprobante(suggested)
        }
      }
    },
    [
      elegirComprobante,
      hasValidPopFiscalCuit,
      invoiceTypeSiteId,
      popEmisorIvaCondition,
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

  const cartLineOverrideSetters = useMemo(
    () => ({
      setItemDescuentoModo,
      setItemDescuentoDraft,
      setItemDescuentoSuprimido,
      setItemComentarios,
    }),
    [
      setItemDescuentoModo,
      setItemDescuentoDraft,
      setItemDescuentoSuprimido,
      setItemComentarios,
    ],
  )

  const agregarPromoAlCarrito = useCallback(
    (promotionId: string, selections: PromotionCartSelection[]) => {
      const product = productosByKey.get(`promotion:${promotionId}`)
      if (!product?.promotionMeta) return
      let affectedLineId: string | null = null
      setCarrito((prev) => {
        const result = addPromotionToTicketCart({
          carrito: prev,
          promotionId,
          selections,
          paidPartialUnits: checkoutStateRef.current.paidPartialUnits ?? {},
        })
        affectedLineId = result.affectedLineId
        for (const copy of result.overrideCopies) {
          copyTicketLineOverrides(
            copy.fromLineId,
            copy.toLineId,
            cartLineOverrideSetters,
          )
        }
        setPaidPartialUnits(result.paidPartialUnits)
        return result.carrito
      })
      if (affectedLineId) onCartLineAdded?.(affectedLineId)
    },
    [productosByKey, cartLineOverrideSetters, onCartLineAdded],
  )

  const agregarAlCarrito = useCallback(
    (productoId: string, kindHint?: MenuCartItemKind, quantity = 1) => {
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

      let affectedLineId: string | null = null
      setCarrito((prev) => {
        const result = addProductToTicketCart({
          carrito: prev,
          productoId,
          kindHint: kind,
          productosByKey,
          quantity,
          overrides: {
            itemDescuentoModo,
            itemDescuentoDraft,
            itemDescuentoSuprimido,
            itemComentarios,
          },
          overrideActions: cartLineOverrideActions,
          paidPartialUnits: checkoutStateRef.current.paidPartialUnits ?? {},
        })
        for (const copy of result.overrideCopies) {
          copyTicketLineOverrides(
            copy.fromLineId,
            copy.toLineId,
            cartLineOverrideSetters,
          )
        }
        setPaidPartialUnits(result.paidPartialUnits)
        affectedLineId = result.affectedLineId
        return result.carrito
      })
      if (affectedLineId) onCartLineAdded?.(affectedLineId)
    },
    [
      productosByKey,
      itemDescuentoModo,
      itemDescuentoDraft,
      itemDescuentoSuprimido,
      itemComentarios,
      cartLineOverrideActions,
      agregarPromoAlCarrito,
      cartLineOverrideSetters,
      onCartLineAdded,
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
          setItemComentarios((comments) =>
            clearComboCommentsForCartLine(comments, lineId),
          )
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
    setMetodoPagoSeleccionado(() =>
      defaultCheckoutPaymentSelection(openCashSession?.cashTreasuryAccountId ?? null),
    )
    setPayOnClientAccount(false)
    setPaidPartialUnits({})
    setTotalPagadoAcumulado(0)
    setDescuentoGeneralBloqueado(false)
    setPartialPayment(false)
    setPartialSelection({})
    setCloseOnComplete(true)
    setImprimirComprobante(true)
    setDescartarConfirmOpen(false)
    setConfirmOpen(false)
    setSubmitError(null)
  }, [popId, openCashSession?.cashTreasuryAccountId])

  const descartarPedido = useCallback(() => {
    if (!puedeDescartarPedido) return
    limpiarPedido()
  }, [puedeDescartarPedido, limpiarPedido])

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
    async (options?: SaleChannelCheckoutConfirmOptions) => {
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
              fullSubtotal: footerTotals.subtotalBeforeGeneral,
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
          priceListId: getSalePriceListSession(popId),
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
          paymentKind: payOnClientAccount ? null : metodoPagoSeleccionado?.kind,
          treasuryAccountId: payOnClientAccount
            ? null
            : metodoPagoSeleccionado?.treasuryAccountId,
          checkDetails:
            !payOnClientAccount && metodoPagoSeleccionado?.kind === "check"
              ? metodoPagoSeleccionado.checkDetails ?? null
              : null,
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
          const shouldLockGeneralDiscount =
            totalPagadoAcumulado <= 0 &&
            descuentoMonto > 0 &&
            !descuentoGeneralBloqueado

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

          if (shouldLockGeneralDiscount) {
            setDescuentoGeneralBloqueado(true)
          }

          checkoutStateRef.current = {
            ...checkoutStateRef.current,
            carrito: materialized.carrito,
            paidPartialUnits: materialized.paidPartialUnits,
            totalPagadoAcumulado: nextPaid.totalPagadoAcumulado,
            ...(shouldLockGeneralDiscount
              ? { descuentoGeneralBloqueado: true }
              : {}),
          }
          if (persistTimerRef.current) {
            clearTimeout(persistTimerRef.current)
            persistTimerRef.current = null
          }
          skipNextPersistRef.current = true
          await flushCheckoutPersist(counterOrderId, checkoutStateRef.current)

          const fullyPaid = isCheckoutFullyPaid({
            carrito: materialized.carrito,
            paidPartialUnits: materialized.paidPartialUnits,
            quantityDealApplications,
          })
          if (fullyPaid && shouldClose) {
            limpiarPedido()
            onSaleComplete?.()
          }
          return true
        }

        if (shouldClose) {
          limpiarPedido()
        } else {
          const shouldLockGeneralDiscount =
            totalPagadoAcumulado <= 0 &&
            descuentoMonto > 0 &&
            !descuentoGeneralBloqueado

          const fullSelection = buildFullUnpaidSelection(partialPaymentUnits)
          const nextPaid = applyPartialPaymentSuccess(
            { paidPartialUnits, totalPagadoAcumulado },
            partialPaymentUnits,
            fullSelection,
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

          if (shouldLockGeneralDiscount) {
            setDescuentoGeneralBloqueado(true)
          }

          checkoutStateRef.current = {
            ...checkoutStateRef.current,
            carrito: materialized.carrito,
            paidPartialUnits: materialized.paidPartialUnits,
            totalPagadoAcumulado: nextPaid.totalPagadoAcumulado,
            ...(shouldLockGeneralDiscount
              ? { descuentoGeneralBloqueado: true }
              : {}),
          }
          if (persistTimerRef.current) {
            clearTimeout(persistTimerRef.current)
            persistTimerRef.current = null
          }
          skipNextPersistRef.current = true
          await flushCheckoutPersist(counterOrderId, checkoutStateRef.current)
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
      descuentoGeneralEditBlocked,
      descuentoGeneralBloqueado,
      onSaleComplete,
      flushCheckoutPersist,
    ],
  )

  const abrirModalDescuento = useCallback(() => {
    if (descuentoGeneralEditBlocked) return
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
  }, [
    descuentoGeneralEditBlocked,
    hayDescuento,
    modoDescuento,
    valorDescuentoPorcentaje,
    valorDescuentoFijo,
  ])

  const aplicarDescuentoModal = useCallback(() => {
    if (descuentoGeneralEditBlocked) return
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
  }, [descuentoDraftModo, descuentoDraftTexto, subtotal, descuentoGeneralEditBlocked])

  const descuentoToolbarLabel = useMemo(
    () =>
      generalDiscountToolbarLabel({
        hayDescuento,
        modoDescuento,
        valorDescuentoPorcentaje,
        valorDescuentoFijo,
        formatFijo: (value) => saleOpFmt.format(value),
      }),
    [hayDescuento, modoDescuento, valorDescuentoPorcentaje, valorDescuentoFijo],
  )

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
    catalogLoadAttempted,
    mergeCatalogArticles,
    mergeCatalogRecipes,
    openCashSession,
    treasuryPaymentContext,
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
    subtotalOriginal: footerTotals.subtotalOriginal,
    descuentoItemsMonto,
    hayDescuentoItems,
    promocionesAplicadasMonto,
    promocionesAplicadasCount,
    descuentoCatalogoMonto: fullCatalogTotals.descuentoCatalogoMonto,
    hayDescuentoCatalogo: fullCatalogTotals.hayDescuentoCatalogo,
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
      pagoLabel: pedidoToolbarDisabled
        ? "Elegir forma de pago"
        : !openCashSession
          ? "Requiere caja abierta"
          : toolboxPaymentDisplay.pagoLabel,
      pagoSubLabel:
        pedidoToolbarDisabled || !openCashSession
          ? null
          : toolboxPaymentDisplay.pagoSubLabel,
      pagoIcon:
        pedidoToolbarDisabled || !openCashSession
          ? undefined
          : toolboxPaymentDisplay.pagoIcon,
      pagoConfigurado: pagoConfigurado && !pedidoToolbarDisabled && openCashSession != null,
      descuentoLabel: pedidoToolbarDisabled ? "Sin descuento" : descuentoToolbarLabel,
      hayDescuento: hayDescuento && !pedidoToolbarDisabled,
      descuentoDisabled: descuentoGeneralEditBlocked && !pedidoToolbarDisabled,
      onClienteClick: () => {
        if (!canReadClients || pedidoToolbarDisabled) return
        setClienteModalAbierto(true)
      },
      onComprobanteClick: () => {
        if (pedidoToolbarDisabled) return
        setComprobanteModalAbierto(true)
      },
      onPagoClick: () => {
        if (!openCashSession || pedidoToolbarDisabled) return
        setPagoModalAbierto(true)
      },
      onDescuentoClick: () => {
        if (pedidoToolbarDisabled || descuentoGeneralEditBlocked) return
        abrirModalDescuento()
      },
    },
    actions: {
      discardDisabled: !puedeDescartarPedido,
      confirmDisabled: !puedeRegistrar,
      confirmLoading: submitting,
      onDiscard: () => {
        if (!puedeDescartarPedido) return
        setDescartarConfirmOpen(true)
      },
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
      popId: popId ?? "",
      canReadClients,
      canCreateClient,
      clienteModalAbierto,
      setClienteModalAbierto: (open: boolean) => {
        setClienteModalAbierto(open)
        if (open && clienteSeleccionado?.manual) {
          setManualNombreCliente(clienteSeleccionado.name)
          setFiscalDocVenta(clienteSeleccionado.taxId ?? "")
          setVentaEmail(clienteSeleccionado.email ?? "")
          setVentaIvaCondition(clienteSeleccionado.ivaCondition ?? "")
        }
      },
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
      manualNombreCliente,
      setManualNombreCliente,
      fiscalDocVenta,
      setFiscalDocVenta,
      ventaEmail,
      setVentaEmail,
      ventaIvaCondition,
      setVentaIvaCondition,
      clienteSeleccionado,
      setClienteSeleccionado,
      ventaPadron,
      clienteCatalogoBloqueado,
      confirmarClienteManual,
      descuentoGeneralEditBlocked,
      labelCondicionIva,
      comprobante,
      comprobantePickerOptions,
      invoiceTypeSiteId,
      cartDisplayRows,
      cartLineOverrides,
      descuentoMonto,
      checkoutTotal: total,
      elegirComprobante,
      treasuryPaymentContext,
      openCashSession,
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
        if (descuentoGeneralEditBlocked) return
        setModoDescuento("porcentaje")
        setValorDescuentoPorcentaje(0)
        setValorDescuentoFijo(0)
        setDescuentoModalAbierto(false)
      },
      limpiarPedido,
      descartarPedido,
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
          emisorIva: popEmisorIvaCondition,
        })
        if (
          resolved == null ||
          isAllowedSaleComprobanteLabel(
            invoiceTypeSiteId,
            resolved,
            popEmisorIvaCondition,
            hasValidPopFiscalCuit,
          )
        ) {
          elegirComprobante(resolved)
        }
        setClienteModalAbierto(false)
      },
      aplicarComprobanteDesdeIva: (iva: ClientIvaConditionValue) => {
        if (!hasValidPopFiscalCuit) return
        const suggested = suggestSaleComprobanteForClientIva(
          iva,
          popEmisorIvaCondition,
        )
        if (
          suggested &&
          isAllowedSaleComprobanteLabel(
            invoiceTypeSiteId,
            suggested,
            popEmisorIvaCondition,
            hasValidPopFiscalCuit,
          )
        ) {
          elegirComprobante(suggested)
        }
      },
      quitarCliente: () => {
        setClienteSeleccionado(null)
        setManualNombreCliente("")
        setFiscalDocVenta("")
        setVentaEmail("")
        setVentaIvaCondition("")
      },
    },
  }
}

export type MostradorSaleCheckout = ReturnType<typeof useMostradorSaleCheckout>
