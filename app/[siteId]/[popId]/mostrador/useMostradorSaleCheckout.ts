"use client"

import {
  fetchPendingComandasForSource,
  sendComandaBatchApi,
  voidComandaBatchApi,
} from "@/lib/rootsyApi/comandasClient"
import {
  applyComandaSendToCart,
  applyComandaVoidToCart,
  healCartLinesAlreadySent,
} from "@/app/[siteId]/[popId]/comandas/comandasLogic"
import type { PendingComandaItem } from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import { applyMostradorCheckoutToOrderCache } from "@/app/[siteId]/[popId]/mostrador/mostradorQueryCache"
import { saveCounterOrderCheckoutApi, closeCounterOrderCheckoutApi } from "@/lib/rootsyApi/mostradorClient"
import { useQueryClient } from "@tanstack/react-query"
import {
  checkoutPersistFingerprint,
  emptyTableSessionCheckout,
  type MesasCartItem,
  type MesasClienteSeleccionado,
  type TableSessionCheckoutSnapshot,
} from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import { resolveDefaultSaleComprobante } from "@/lib/saleCheckoutDefaults"
import type { MenuCatalogPromotion } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type { SaleCatalogClient, SaleCatalogPaymentOption, SaleOpenCashSession } from "@/app/[siteId]/[popId]/sale/actions"
import { useMenuCatalogLoader } from "@/hooks/useMenuCatalogLoader"
import { usePopSaleComprobanteFiscalContext } from "@/hooks/usePopSaleComprobanteFiscalContext"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useSaleBoardPromotions } from "@/hooks/useSaleBoardPromotions"
import {
  clientsAccessFromKeys,
  saleCatalogAccessFromKeys,
} from "@/lib/popWorkspaceAccess"
import {
  buildOperationPartyManualSelection,
  type OperationPartyManualConfirmOptions,
  type OperationPartyManualConfirmPayload,
} from "@/lib/operationPartyPicker"
import { partyCanOperateOnCurrentAccount } from "@/lib/currentAccounts"
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
  ACTIVE_COMANDAS_CANCEL_TITLE,
  ACTIVE_COMANDAS_DISCARD_TITLE,
  ensureCartLineComandaStatuses,
  hasActiveCommandedLines,
  isComandaLocked,
  isComandaVoidable,
  pendingComandaComment,
  promotionSelectionsAreCommandable,
  resolveVoidComandaRequest,
} from "@/lib/comandaCartLine"
import {
  applyTicketLineEdit,
  addProductToTicketCart,
  addPromotionToTicketCart,
  applyPartialPaymentCartMaterialization,
  copyTicketLineOverrides,
  mapMenuCartToDetallados,
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
  collectCartCatalogEnsureIds,
  menuArticleToProduct,
  menuRecipeToProduct,
  resolveMenuCartCatalogProduct,
  snapshotFromCatalogProduct,
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
    toolboxLoadEnabled?: boolean
    onCartLineAdded?: (lineId: string) => void
    remoteTicketPending?: boolean
  },
) {
  const isPaid = options?.isPaid === true
  const onSaleComplete = options?.onSaleComplete
  const onCartLineAdded = options?.onCartLineAdded
  const remoteTicketPending = options?.remoteTicketPending === true
  const catalogEnabled =
    options?.catalogLoadEnabled ??
    (Boolean(counterOrderId) || Boolean(options?.catalogSidebarOpen))
  const toolboxEnabled = options?.toolboxLoadEnabled ?? catalogEnabled

  const {
    menuCategorySections,
    menuRecipes,
    menuArticles,
    menuPromotions: apiMenuPromotions,
    menuQuantityDeals: apiMenuQuantityDeals,
    treasuryPaymentContext,
    canReadClients: apiCanReadClients,
    canCreateSale: apiCanCreateSale,
    canReadCashRegisters: apiCanReadCashRegisters,
    openCashSession,
    invoiceTypeSiteId,
    hasValidPopFiscalCuit: apiHasValidPopFiscalCuit,
    popEmisorIvaCondition: apiPopEmisorIvaCondition,
    comprobanteEmitter,
    comprobantesLoaded,
    catalogLoading,
    catalogItemsEnsuring,
    catalogError,
    catalogLoadAttempted,
    toolboxLoading,
    mergeCatalogArticles,
    mergeCatalogRecipes,
    ensureCatalogItems,
  } = useMenuCatalogLoader(popId, {
    enabled: false,
    toolboxEnabled,
  })

  const fiscalBootstrap = usePopSaleComprobanteFiscalContext()
  const hasValidPopFiscalCuit = comprobantesLoaded
    ? apiHasValidPopFiscalCuit
    : fiscalBootstrap.hasValidPopFiscalCuit
  const popEmisorIvaCondition = comprobantesLoaded
    ? apiPopEmisorIvaCondition
    : fiscalBootstrap.popEmisorIvaCondition
  const bootstrapLoaded =
    comprobantesLoaded || fiscalBootstrap.bootstrapLoaded

  const localPromotions = useSaleBoardPromotions(popId, {
    enabled: Boolean(popId),
    scope: "menu",
  })
  const menuPromotions = catalogLoadAttempted
    ? apiMenuPromotions
    : localPromotions.combos
  const menuQuantityDeals = catalogLoadAttempted
    ? apiMenuQuantityDeals
    : localPromotions.quantityDeals

  const { bootstrap } = usePopWorkspace()
  const queryClient = useQueryClient()
  const saleAccess = useMemo(
    () => saleCatalogAccessFromKeys(bootstrap?.permissionKeys ?? []),
    [bootstrap?.permissionKeys],
  )
  const canReadClients = catalogLoadAttempted
    ? apiCanReadClients
    : saleAccess.canReadClients
  const canCreateSale = catalogLoadAttempted
    ? apiCanCreateSale
    : saleAccess.canCreateSale
  const canReadCashRegisters = catalogLoadAttempted
    ? apiCanReadCashRegisters
    : saleAccess.canReadCashRegisters
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

  useEffect(() => {
    if (
      payOnClientAccount &&
      !partyCanOperateOnCurrentAccount(clienteSeleccionado)
    ) {
      setPayOnClientAccount(false)
    }
  }, [clienteSeleccionado, payOnClientAccount])
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
  const [comandasOpen, setComandasOpen] = useState(false)
  const [pendingComandaItems, setPendingComandaItems] = useState<
    PendingComandaItem[]
  >([])
  const [comandasLoading, setComandasLoading] = useState(false)
  const [comandasSubmitting, setComandasSubmitting] = useState(false)
  const [comandasError, setComandasError] = useState<string | null>(null)
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
  const skipPersistUntilNextCommitRef = useRef(false)
  const lastPristineFingerprintRef = useRef<string | null>(null)
  const hydrateGenerationRef = useRef(0)
  const persistFlushedGenerationRef = useRef(0)
  const healPersistAfterFlushRef = useRef(false)
  const markCheckoutDefaultsHydrate = (next: TableSessionCheckoutSnapshot) => {
    lastPristineFingerprintRef.current = checkoutPersistFingerprint(next)
    hydrateGenerationRef.current += 1
    skipPersistUntilNextCommitRef.current = true
    skipNextPersistRef.current = true
  }
  const lastSavedUpdatedAtRef = useRef<string | null>(null)
  const lastAppliedRemoteUpdatedAtRef = useRef<string | null>(null)
  const checkoutDirtyRef = useRef(false)
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saleIdempotencyKeyRef = useRef(crypto.randomUUID())

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
    healPersistAfterFlushRef.current = shouldPersistHealedDiscount
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
    lastPristineFingerprintRef.current = checkoutPersistFingerprint({
      carrito: materialized.carrito,
      clienteSeleccionado: snap.clienteSeleccionado,
      manualNombreCliente: snap.manualNombreCliente,
      fiscalDocVenta: snap.fiscalDocVenta,
      ventaIvaCondition: snap.ventaIvaCondition,
      comprobante: snap.comprobante,
      metodoPagoSeleccionado: snap.metodoPagoSeleccionado,
      payOnClientAccount: snap.payOnClientAccount,
      modoDescuento: healed.modoDescuento,
      valorDescuentoPorcentaje: healed.valorDescuentoPorcentaje,
      valorDescuentoFijo: healed.valorDescuentoFijo,
      itemDescuentoModo: snap.itemDescuentoModo ?? {},
      itemDescuentoDraft: snap.itemDescuentoDraft ?? {},
      itemDescuentoSuprimido: snap.itemDescuentoSuprimido ?? {},
      itemComentarios: snap.itemComentarios ?? {},
      paidPartialUnits: materialized.paidPartialUnits,
      totalPagadoAcumulado: snap.totalPagadoAcumulado ?? 0,
      descuentoGeneralBloqueado: healed.descuentoGeneralBloqueado === true,
    })
    hydrateGenerationRef.current += 1
    skipPersistUntilNextCommitRef.current = true
  }, [])

  const flushCheckoutPersist = useCallback(
    async (sessionId: string, snap: TableSessionCheckoutSnapshot) => {
      if (!popId) return
      const res = await saveCounterOrderCheckoutApi(popId, sessionId, snap)
      if (res.success) {
        lastSavedUpdatedAtRef.current = res.updatedAt
        lastAppliedRemoteUpdatedAtRef.current = res.updatedAt
        lastPristineFingerprintRef.current = checkoutPersistFingerprint(snap)
        checkoutDirtyRef.current = false
        applyMostradorCheckoutToOrderCache(
          queryClient,
          popId,
          sessionId,
          res.updatedAt,
          snap,
        )
      }
    },
    [popId, queryClient],
  )

  useEffect(() => {
    const prevId = loadedSessionIdRef.current
    if (prevId && prevId !== counterOrderId && popId) {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current)
        persistTimerRef.current = null
      }
      if (checkoutDirtyRef.current) {
        void flushCheckoutPersist(prevId, checkoutStateRef.current)
      }
    }

    if (prevId !== counterOrderId) {
      saleIdempotencyKeyRef.current = crypto.randomUUID()
    }
    loadedSessionIdRef.current = counterOrderId
    lastSavedUpdatedAtRef.current = null
    lastAppliedRemoteUpdatedAtRef.current = null
    checkoutDirtyRef.current = false
    comprobanteInitRef.current = false

    if (!counterOrderId) {
      applySessionSnapshot(
        emptyTableSessionCheckout(
          resolveDefaultSaleComprobante(popId, {
          invoiceTypeSiteId,
          popEmisorIvaCondition,
          hasValidPopFiscalCuit,
        }),
        ),
      )
      return
    }

    if (remoteTicketPending) {
      applySessionSnapshot(
        emptyTableSessionCheckout(
          resolveDefaultSaleComprobante(popId, {
          invoiceTypeSiteId,
          popEmisorIvaCondition,
          hasValidPopFiscalCuit,
        }),
        ),
      )
      return
    }

    if (remoteOrder) {
      const snap =
        remoteOrder.checkout ??
        emptyTableSessionCheckout(
          resolveDefaultSaleComprobante(popId, {
          invoiceTypeSiteId,
          popEmisorIvaCondition,
          hasValidPopFiscalCuit,
        }),
        )
      applySessionSnapshot(snap)
      lastAppliedRemoteUpdatedAtRef.current = remoteOrder.updatedAt
      return
    }

    applySessionSnapshot(
      emptyTableSessionCheckout(
        resolveDefaultSaleComprobante(popId, {
          invoiceTypeSiteId,
          popEmisorIvaCondition,
          hasValidPopFiscalCuit,
        }),
      ),
    )
    // Solo al cambiar de pedido; el snapshot remoto se sincroniza aparte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counterOrderId, remoteTicketPending, applySessionSnapshot])

  useEffect(() => {
    if (!counterOrderId || !remoteOrder) return
    const { updatedAt, checkout } = remoteOrder
    const snap =
      checkout ??
      emptyTableSessionCheckout(resolveDefaultSaleComprobante(popId, {
          invoiceTypeSiteId,
          popEmisorIvaCondition,
          hasValidPopFiscalCuit,
        }))
    const remoteFp = checkoutPersistFingerprint(snap)
    const localFp = checkoutPersistFingerprint(checkoutStateRef.current)
    if (updatedAt === lastSavedUpdatedAtRef.current && remoteFp === localFp) {
      return
    }
    if (updatedAt === lastAppliedRemoteUpdatedAtRef.current && remoteFp === localFp) {
      return
    }

    const localPristine =
      lastPristineFingerprintRef.current != null &&
      localFp === lastPristineFingerprintRef.current

    if (checkoutDirtyRef.current && !localPristine) {
      if (checkout?.carrito?.length) {
        skipNextPersistRef.current = true
        setCarrito((prev) =>
          prev.map((item) => {
            const remote = checkout.carrito.find(
              (row) => resolveCartLineId(row) === resolveCartLineId(item),
            )
            if (!remote?.comandaStatus || remote.comandaStatus === item.comandaStatus) {
              return item
            }
            return { ...item, comandaStatus: remote.comandaStatus }
          }),
        )
      }
      return
    }

    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current)
      persistTimerRef.current = null
    }
    checkoutDirtyRef.current = false
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
    if (remoteTicketPending) return

    if (skipPersistUntilNextCommitRef.current) {
      skipPersistUntilNextCommitRef.current = false
      return
    }

    const fingerprint = checkoutPersistFingerprint(checkoutStateRef.current)
    if (hydrateGenerationRef.current !== persistFlushedGenerationRef.current) {
      lastPristineFingerprintRef.current = fingerprint
      persistFlushedGenerationRef.current = hydrateGenerationRef.current
      skipNextPersistRef.current = false
      if (!healPersistAfterFlushRef.current) return
      healPersistAfterFlushRef.current = false
    } else if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false
      lastPristineFingerprintRef.current = fingerprint
      return
    } else if (
      lastPristineFingerprintRef.current != null &&
      fingerprint === lastPristineFingerprintRef.current
    ) {
      return
    }

    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current)
    }

    checkoutDirtyRef.current = true
    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null
      void flushCheckoutPersist(counterOrderId, checkoutStateRef.current)
    }, CHECKOUT_PERSIST_MS)

    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current)
        persistTimerRef.current = null
        checkoutDirtyRef.current = false
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
    remoteTicketPending,
  ])

  useEffect(() => {
    return () => {
      const sessionId = loadedSessionIdRef.current
      if (sessionId && popId && checkoutDirtyRef.current) {
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
      const next = defaultCheckoutPaymentSelection(
        openCashSession.cashTreasuryAccountId,
      )
      if (!next) return prev
      markCheckoutDefaultsHydrate({
        ...checkoutStateRef.current,
        metodoPagoSeleccionado: next,
      })
      return next
    })
  }, [openCashSession, counterOrderId])

  useEffect(() => {
    if (!popId || !bootstrapLoaded || comprobanteInitRef.current || counterOrderId == null) return
    comprobanteInitRef.current = true
    const saved = readSavedSaleComprobante(popId)
    if (saved !== undefined) {
      const next = isAllowedSaleComprobanteLabel(
        invoiceTypeSiteId,
        saved,
        popEmisorIvaCondition,
        hasValidPopFiscalCuit,
      )
        ? saved
        : null
      if (next !== checkoutStateRef.current.comprobante) {
        markCheckoutDefaultsHydrate({
          ...checkoutStateRef.current,
          comprobante: next,
        })
      }
      setComprobante(next)
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
      const next = isAllowedSaleComprobanteLabel(
        invoiceTypeSiteId,
        current,
        popEmisorIvaCondition,
        hasValidPopFiscalCuit,
      )
        ? current
        : null
      if (next === current) return current
      markCheckoutDefaultsHydrate({
        ...checkoutStateRef.current,
        comprobante: next,
      })
      return next
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
    const { articleIds, recipeIds } = collectCartCatalogEnsureIds(carrito)
    void ensureCatalogItems(articleIds, recipeIds)
  }, [carrito, ensureCatalogItems])

  useEffect(() => {
    setCarrito((prev) => {
      let changed = false
      const next = prev.map((item) => {
        if (item.snapshot?.nombre.trim()) return item
        const kind = normalizeCartItemKind(item.kind)
        const producto = resolveMenuCartCatalogProduct(
          productosByKey,
          item.productoId,
          kind,
        )
        if (!producto) return item
        changed = true
        return { ...item, snapshot: snapshotFromCatalogProduct(producto) }
      })
      const withSnap = changed ? next : prev
      const withStatus = ensureCartLineComandaStatuses(withSnap, productosByKey)
      if (withStatus === prev) return prev
      lastPristineFingerprintRef.current = checkoutPersistFingerprint({
        ...checkoutStateRef.current,
        carrito: withStatus,
      })
      hydrateGenerationRef.current += 1
      skipNextPersistRef.current = true
      return withStatus
    })
  }, [productosByKey])

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
      mapMenuCartToDetallados(source, productosByKey),
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

  const orderPanelLoading = remoteTicketPending

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

  const hayComandasActivas = useMemo(
    () => hasActiveCommandedLines(carrito),
    [carrito],
  )

  const puedeDescartarPedido = useMemo(
    () =>
      hayItemsEnPedido &&
      !isPaid &&
      !hayComandasActivas &&
      !hasAnyPartialPayment({ paidPartialUnits, totalPagadoAcumulado }),
    [
      hayItemsEnPedido,
      isPaid,
      hayComandasActivas,
      paidPartialUnits,
      totalPagadoAcumulado,
    ],
  )

  const hayPendingComandas = useMemo(
    () => carrito.some((item) => item.comandaStatus === "pending"),
    [carrito],
  )

  const abrirComandas = useCallback(async () => {
    if (!popId || !counterOrderId) return
    setComandasError(null)
    setPendingComandaItems([])
    setComandasOpen(true)
    setComandasLoading(true)
    await flushCheckoutPersist(counterOrderId, checkoutStateRef.current)
    const res = await fetchPendingComandasForSource(
      popId,
      "counter",
      counterOrderId,
    )
    setComandasLoading(false)
    if (!res.success) {
      setComandasError(res.error)
      setPendingComandaItems([])
      return
    }
    setPendingComandaItems(
      res.items.map((item) => ({
        ...item,
        comment: pendingComandaComment(
          item.cartLineId,
          item.comment,
          checkoutStateRef.current.itemComentarios,
        ),
      })),
    )
    setCarrito((prev) =>
      healCartLinesAlreadySent(
        prev,
        res.items.map((item) => item.cartLineId),
        productosByKey,
      ),
    )
  }, [counterOrderId, flushCheckoutPersist, popId, productosByKey, siteId])

  const enviarComandas = useCallback(
    async (input: {
      quantities: Record<string, number>
      stationComments: Record<string, string>
    }) => {
      if (!popId || !counterOrderId) return
      setComandasSubmitting(true)
      setComandasError(null)
      await flushCheckoutPersist(counterOrderId, checkoutStateRef.current)
      const res = await sendComandaBatchApi(popId, {
        sourceKind: "counter",
        sourceId: counterOrderId,
        quantities: input.quantities,
        stationComments: input.stationComments,
      })
      setComandasSubmitting(false)
      if (!res.success) {
        setComandasError(res.error)
        return
      }
      for (const peel of res.peels) {
        copyTicketLineOverrides(peel.fromCartLineId, peel.sentCartLineId, {
          setItemDescuentoModo,
          setItemDescuentoDraft,
          setItemDescuentoSuprimido,
          setItemComentarios,
        })
      }
      const nextCart = applyComandaSendToCart(
        checkoutStateRef.current.carrito,
        res.sentCartLineIds,
        res.peels,
        productosByKey,
      )
      setCarrito(nextCart)
      checkoutStateRef.current = {
        ...checkoutStateRef.current,
        carrito: nextCart,
      }
      await flushCheckoutPersist(counterOrderId, checkoutStateRef.current)
      setComandasOpen(false)
    },
    [counterOrderId, flushCheckoutPersist, popId, productosByKey, siteId],
  )

  const anularLineaComanda = useCallback(
    async (input: { lineId: string; quantity: number; comment: string }) => {
      if (!popId || !counterOrderId) return
      const item = carrito.find((row) => resolveCartLineId(row) === input.lineId)
      if (
        !item ||
        item.paidLocked ||
        !isComandaVoidable(item.comandaStatus) ||
        cartLineHasPaidUnits(input.lineId, item, paidPartialUnits)
      ) {
        throw new Error("Esa línea no se puede anular.")
      }
      await flushCheckoutPersist(counterOrderId, checkoutStateRef.current)
      const payload = resolveVoidComandaRequest(
        item,
        input.quantity,
        input.comment,
      )
      const res = await voidComandaBatchApi(popId, {
        sourceKind: "counter",
        sourceId: counterOrderId,
        ...payload,
      })
      if (!res.success) throw new Error(res.error)
      for (const peel of res.peels) {
        copyTicketLineOverrides(peel.fromCartLineId, peel.voidedCartLineId, {
          setItemDescuentoModo,
          setItemDescuentoDraft,
          setItemDescuentoSuprimido,
          setItemComentarios,
        })
      }
      const nextCart = applyComandaVoidToCart(
        carrito,
        res.voidedCartLineIds,
        res.peels,
        productosByKey,
      )
      setCarrito(nextCart)
      checkoutStateRef.current = {
        ...checkoutStateRef.current,
        carrito: nextCart,
      }
      await flushCheckoutPersist(counterOrderId, checkoutStateRef.current)
    },
    [
      carrito,
      counterOrderId,
      flushCheckoutPersist,
      paidPartialUnits,
      popId,
      productosByKey,
      siteId,
    ],
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
        hasActiveComandas: hayComandasActivas,
      }),
    [
      carrito,
      paidPartialUnits,
      totalPagadoAcumulado,
      quantityDealApplications,
      isPaid,
      hayComandasActivas,
    ],
  )

  const puedeCerrarPedido = channelCloseEligibility.canClose
  const cerrarPedidoBlockReason = channelCloseEligibility.blockReason
  const cerrarPedidoMode = channelCloseEligibility.mode

  const puedeCancelarPedido = useMemo(
    () =>
      !isPaid &&
      !hayComandasActivas &&
      !hasAnyPartialPayment({ paidPartialUnits, totalPagadoAcumulado }),
    [isPaid, hayComandasActivas, paidPartialUnits, totalPagadoAcumulado],
  )

  const cancelarPedidoTitle = hayComandasActivas
    ? ACTIVE_COMANDAS_CANCEL_TITLE
    : undefined

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
        ? partyCanOperateOnCurrentAccount(clienteSeleccionado)
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
      clienteSeleccionado,
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
      setPayOnClientAccount(false)
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
          snapshot: snapshotFromCatalogProduct(product),
          commandable: promotionSelectionsAreCommandable(
            selections,
            productosByKey,
          ),
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
          isComandaLocked(target.comandaStatus) ||
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
          isComandaLocked(target?.comandaStatus) ||
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
      const res = await closeCounterOrderCheckoutApi(
        popId,
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
          idempotencyKey: saleIdempotencyKeyRef.current,
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
        saleIdempotencyKeyRef.current = crypto.randomUUID()

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
  const requiereCajaAbierta = openCashSession == null
  const cajaRequiredTitle = "Requiere caja abierta"

  return {
    catalogLoading,
    catalogItemsEnsuring,
    catalogError,
    catalogLoadAttempted,
    catalogLoadEnabled: catalogEnabled,
    toolboxLoading,
    orderPanelLoading,
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
    anularLineaComanda,
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
    cancelarPedidoTitle,
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
      clienteIvaLabel: pedidoToolbarDisabled || requiereCajaAbierta ? null : ventaIvaLabel,
      clienteDisabled: !canReadClients || pedidoToolbarDisabled || requiereCajaAbierta,
      clienteConfigurado: Boolean(clienteSeleccionado) && !pedidoToolbarDisabled && !requiereCajaAbierta,
      toolbarDisabled: pedidoToolbarDisabled || requiereCajaAbierta,
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
      hayDescuento: hayDescuento && !pedidoToolbarDisabled && !requiereCajaAbierta,
      descuentoDisabled: descuentoGeneralEditBlocked && !pedidoToolbarDisabled,
      onClienteClick: () => {
        if (!canReadClients || pedidoToolbarDisabled || requiereCajaAbierta) return
        setClienteModalAbierto(true)
      },
      onComprobanteClick: () => {
        if (pedidoToolbarDisabled || requiereCajaAbierta) return
        setComprobanteModalAbierto(true)
      },
      onPagoClick: () => {
        if (requiereCajaAbierta || pedidoToolbarDisabled) return
        setPagoModalAbierto(true)
      },
      onDescuentoClick: () => {
        if (pedidoToolbarDisabled || requiereCajaAbierta || descuentoGeneralEditBlocked) return
        abrirModalDescuento()
      },
    },
    actions: {
      discardDisabled: !puedeDescartarPedido || requiereCajaAbierta,
      discardTitle: requiereCajaAbierta
        ? cajaRequiredTitle
        : hayComandasActivas
          ? ACTIVE_COMANDAS_DISCARD_TITLE
          : undefined,
      confirmDisabled: !puedeRegistrar,
      confirmLoading: submitting,
      onDiscard: () => {
        if (requiereCajaAbierta || !puedeDescartarPedido) return
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
      onComandas: () => {
        if (requiereCajaAbierta) return
        void abrirComandas()
      },
      comandasDisabled: !hayPendingComandas || requiereCajaAbierta,
      comandasTitle: requiereCajaAbierta ? cajaRequiredTitle : undefined,
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
      comandasOpen,
      setComandasOpen: (open: boolean) => {
        setComandasOpen(open)
        if (!open) {
          setPendingComandaItems([])
          setComandasError(null)
          setComandasLoading(false)
        }
      },
      pendingComandaItems,
      comandasLoading,
      comandasSubmitting,
      comandasError,
      enviarComandas,
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
      comprobanteEmitter,
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
          currentAccountEnabled: c.currentAccountEnabled === true,
        })
        if (!c.currentAccountEnabled) setPayOnClientAccount(false)
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
        setPayOnClientAccount(false)
        setManualNombreCliente("")
        setFiscalDocVenta("")
        setVentaEmail("")
        setVentaIvaCondition("")
      },
    },
  }
}

export type MostradorSaleCheckout = ReturnType<typeof useMostradorSaleCheckout>
