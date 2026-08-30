"use client"

import dynamic from "next/dynamic"
import { completeSale } from "@/app/[siteId]/[popId]/sale/completeSale"
import { getSalePriceListSession } from "@/lib/salePriceListSession"
import {
  createSaleQuote,
  fetchSaleQuoteDetail,
} from "@/lib/rootsyApi/quotesClient"
import {
  type SaleCatalogClient,
  type SaleCatalogPaymentOption,
} from "@/app/[siteId]/[popId]/sale/actions"
import { useCajasRealtime } from "@/hooks/useCajasRealtime"
import { useSaleOpenCashSessionToasts } from "@/hooks/useSaleOpenCashSessionToasts"
import { useSaleBoardPromotions } from "@/hooks/useSaleBoardPromotions"
import { useSaleCatalogLoader } from "@/hooks/useSaleCatalogLoader"
import { PopModuleLoading } from "@/app/[siteId]/[popId]/PopModuleLoading"
import { applySaleStockChanges } from "@/lib/applySaleStockChanges"
import { useQueryClient } from "@tanstack/react-query"
import {
  defaultCheckoutPaymentSelection,
  resolveSaleToolboxPaymentDisplay,
} from "@/lib/saleCheckoutPayment"
import {
  readSavedSalePayment,
  salePaymentToSaved,
  savedSalePaymentToOption,
  writeSavedSalePayment,
} from "@/lib/salePaymentPreference"
import { treasuryPaymentOptionKey } from "@/lib/treasuryPaymentOptions"
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
import {
  CLIENT_IVA_CONDITION_OPTIONS,
  type ClientIvaConditionValue,
} from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import { CLIENT_ACCOUNT_PAYMENT_LABEL } from "@/lib/operationPaymentLabels"
import { SaleCatalogBrowser } from "@/components/sale-operation/SaleCatalogBrowser"
import { SaleDevtoolsPanel } from "@/components/sale-operation/SaleDevtoolsPanel"
import { SaleOperationDiscountHeaderButton } from "@/components/sale-operation/SaleOperationDiscountHeaderButton"
import { SaleOperationToolbox } from "@/components/sale-operation/SaleOperationToolbox"
import { isDevModeEnabled } from "@/lib/devmode"
import type { SaleComprobantePreviewInput } from "@/components/checkout/SaleComprobanteTicketPreview"

const OperationPartyPickerDialog = dynamic(
  () =>
    import("@/components/checkout/OperationPartyPickerDialog").then(
      (mod) => mod.OperationPartyPickerDialog,
    ),
  { ssr: false },
)
const SaleComprobantePickerDialog = dynamic(
  () =>
    import("@/components/checkout/SaleComprobantePickerDialog").then(
      (mod) => mod.SaleComprobantePickerDialog,
    ),
  { ssr: false },
)
const SalePaymentMethodDialog = dynamic(
  () =>
    import("@/components/sale-operation/SalePaymentMethodDialog").then(
      (mod) => mod.SalePaymentMethodDialog,
    ),
  { ssr: false },
)
const OperationSaleInvoiceDialog = dynamic(
  () =>
    import("@/app/[siteId]/[popId]/operations/OperationSaleInvoiceDialog").then(
      (mod) => mod.OperationSaleInvoiceDialog,
    ),
  { ssr: false },
)
const OperationSaleDetailDialog = dynamic(
  () =>
    import("@/app/[siteId]/[popId]/operations/OperationSaleDetailDialog").then(
      (mod) => mod.OperationSaleDetailDialog,
    ),
  { ssr: false },
)
const GeneralDiscountDialog = dynamic(
  () =>
    import("@/components/checkout/GeneralDiscountDialog").then(
      (mod) => mod.GeneralDiscountDialog,
    ),
  { ssr: false },
)
import {
  DataWorkspaceOperationsLayout,
  OperationsModuleBackdrop,
} from "@/components/layouts-module/DataWorkspaceOperationsLayout"
import { LayoutsOperarMainGrid } from "@/components/layouts-module/LayoutsOperarMainGrid"
import { LayoutsOperarSaleCheckoutFloor } from "@/components/layouts-module/LayoutsOperarSaleCheckoutFloor"
import { RootsBanner } from "@/components/rootsy-banner"
import { popScopedHref } from "@/lib/popRoutes"
import { useSaleCheckoutModel } from "@/hooks/useSaleCheckoutModel"
import { useSaleCheckoutShortcuts } from "@/hooks/useSaleCheckoutShortcuts"
import { resolveSaleCheckoutRisk } from "@/lib/saleCheckoutRisk"
import { showRootsyToast } from "@/components/rootsy-toast"
import { SaleSuccessToastActions } from "@/components/sale-operation/SaleSuccessToastActions"
import { fetchOperationSaleById } from "@/lib/rootsyApi/operationsClient"
import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"
import { useDataWorkspaceSidebar } from "@/components/layouts/useDataWorkspaceSidebar"
import { useAuth } from "@/context/AuthContextSupabase"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { clientsAccessFromKeys } from "@/lib/popWorkspaceAccess"
import type {
  OperationPartyManualConfirmOptions,
  OperationPartyManualConfirmPayload,
} from "@/lib/operationPartyPicker"
import { buildOperationPartyManualSelection } from "@/lib/operationPartyPicker"
import { usePopSaleComprobanteFiscalContext } from "@/hooks/usePopSaleComprobanteFiscalContext"
import { useParams, useRouter, useSearchParams } from "@/lib/pop-spa/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  FileText,
} from "lucide-react"
import { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import { cn } from "@/lib/utils"
import {
  RootsAlertDialogContent,
  RootsAlertDialogFooter,
  RootsAlertDialogPanel,
} from "@/components/rootsy-dialog"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { SimpleOperationCheckoutConfirmDialog } from "@/components/checkout/SimpleOperationCheckoutConfirmDialog"
import { SaleOperationTicketOrderPanel } from "@/components/sale-operation/SaleOperationTicketOrderPanel"
import {
  SaleScanInputFocusProvider,
  useSaleScanInputFocus,
} from "@/components/sale-operation/SaleScanInputFocusContext"
import { PromotionComboWizard } from "@/components/sale-operation/PromotionComboWizard"
import { useSaleTicketCart } from "@/hooks/useSaleTicketCart"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { useCartListScrollHighlight } from "@/hooks/useCartListScrollHighlight"
import { buildCompleteSaleLinesFromCart } from "@/lib/saleCompleteLines"
import {
  buildQuoteLineGroupsFromDisplayRows,
  buildQuoteLineSummariesFromDisplayRows,
  buildSaleQuoteCheckoutSnapshot,
  formatSaleQuoteDiscountLabel,
  formatSaleQuotePaymentLabel,
} from "@/lib/saleQuoteCheckout"
import { partyCanOperateOnCurrentAccount } from "@/lib/currentAccounts"
import type { MenuCatalogProduct } from "@/lib/menuCatalogProduct"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import {
  layoutsOperarSummaryPanelClass,
  layoutsOperarSummaryPanelMobileStackClass,
} from "@/app/library/layouts/layoutsOperarStyles"

type Producto = MenuCatalogProduct

type ClienteVentaSeleccionado = {
  id: string | null
  manual: boolean
  name: string
  taxId: string | null
  email?: string | null
  ivaCondition: string | null
  defaultInvoiceTypeLabel: string | null
  currentAccountEnabled?: boolean
}

const IVA_LABEL_BY_VALUE = Object.fromEntries(
  CLIENT_IVA_CONDITION_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>

function labelCondicionIva(value: string | null | undefined) {
  if (!value?.trim()) return null
  return IVA_LABEL_BY_VALUE[value] ?? value
}

function SaleScanFocusBridge({
  modalOpen,
  onFocusReady,
}: {
  modalOpen: boolean
  onFocusReady: (focus: () => void) => void
}) {
  const { focusScanInput } = useSaleScanInputFocus()!
  const modalWasOpenRef = useRef(false)

  useEffect(() => {
    onFocusReady(focusScanInput)
  }, [focusScanInput, onFocusReady])

  useEffect(() => {
    if (modalWasOpenRef.current && !modalOpen) {
      focusScanInput()
    }
    modalWasOpenRef.current = modalOpen
  }, [focusScanInput, modalOpen])

  return null
}

export function SaleWorkspaceView() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined
  const queryClient = useQueryClient()
  const quoteIdFromUrl = searchParams.get("quoteId")
  const fiscalBootstrap = usePopSaleComprobanteFiscalContext()
  const {
    open: catalogSidebarOpen,
    setOpen: setCatalogSidebarOpen,
  } = useDataWorkspaceSidebar(siteId, popId ?? "", Boolean(popId))
  const { user } = useAuth()
  const { bootstrap } = usePopWorkspace()
  const canCreateClient = useMemo(
    () => clientsAccessFromKeys(bootstrap?.permissionKeys ?? []).canCreate,
    [bootstrap?.permissionKeys],
  )

  const {
    treasuryPaymentContext,
    canReadClients,
    canReadPaymentMethods,
    canCreateSale,
    canReadCashRegisters,
    openCashSession,
    invoiceTypeSiteId,
    saleCategories,
    saleCategorySections,
    hasValidPopFiscalCuit: apiHasValidPopFiscalCuit,
    popEmisorIvaCondition: apiPopEmisorIvaCondition,
    comprobanteOptions,
    comprobanteEmitter,
    comprobantesLoaded,
    mergeCatalogArticles,
    catalogLoading: catalogQueryLoading,
    catalogPending,
    catalogError: catalogQueryError,
  } = useSaleCatalogLoader(popId, { enabled: Boolean(popId && siteId) })
  const saleBoardPromotions = useSaleBoardPromotions(popId, {
    enabled: Boolean(popId && siteId),
  })
  const catalogLoading = !popId || !siteId ? false : catalogQueryLoading
  useCajasRealtime(popId, user?.id)
  useSaleOpenCashSessionToasts(
    siteId,
    popId,
    Boolean(popId && siteId),
    Boolean(popId && siteId) && !catalogLoading,
  )
  const catalogError =
    !popId || !siteId ? "Punto de venta no encontrado" : catalogQueryError
  const hasValidPopFiscalCuit = comprobantesLoaded
    ? apiHasValidPopFiscalCuit
    : fiscalBootstrap.hasValidPopFiscalCuit
  const popEmisorIvaCondition = comprobantesLoaded
    ? apiPopEmisorIvaCondition
    : fiscalBootstrap.popEmisorIvaCondition
  const bootstrapLoaded =
    comprobantesLoaded || fiscalBootstrap.bootstrapLoaded

  const cartScrollHighlight = useCartListScrollHighlight(quoteIdFromUrl)

  const {
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
    restaurarDesdeCheckout,
    cartReady,
  } = useSaleTicketCart({
    popId,
    menuPromotions: saleBoardPromotions.combos,
    menuQuantityDeals: saleBoardPromotions.quantityDeals,
    onCartLineAdded: cartScrollHighlight.notifyLineAdded,
  })

  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<ClienteVentaSeleccionado | null>(null)
  const [ventaIvaCondition, setVentaIvaCondition] = useState("")
  const [manualNombreCliente, setManualNombreCliente] = useState("")
  const [fiscalDocVenta, setFiscalDocVenta] = useState("")
  const [ventaEmail, setVentaEmail] = useState("")
  const ventaPadron = usePadronAutofillRazonSocial(popId, fiscalDocVenta, {
    enabled:
      Boolean(popId) &&
      (clienteSeleccionado == null || clienteSeleccionado.manual),
    manual: true,
  })
  const [clienteModalAbierto, setClienteModalAbierto] = useState(false)
  const [comprobante, setComprobante] = useState<string | null>(() =>
    popId ? (readSavedSaleComprobante(popId) ?? null) : null,
  )
  const [comprobanteModalAbierto, setComprobanteModalAbierto] = useState(false)
  const comprobanteInitRef = useRef(false)
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] =
    useState<SaleCatalogPaymentOption | null>(() =>
      popId ? savedSalePaymentToOption(readSavedSalePayment(popId)) : null,
    )
  const [payOnClientAccount, setPayOnClientAccount] = useState(
    () =>
      Boolean(popId) && readSavedSalePayment(popId)?.mode === "client_account",
  )
  const [pagoModalAbierto, setPagoModalAbierto] = useState(false)
  const [modoDescuento, setModoDescuento] = useState<"porcentaje" | "fijo">(
    "porcentaje",
  )
  const [valorDescuentoPorcentaje, setValorDescuentoPorcentaje] = useState(0)
  const [valorDescuentoFijo, setValorDescuentoFijo] = useState(0)
  const [descuentoModalAbierto, setDescuentoModalAbierto] = useState(false)
  const [descartarConfirmOpen, setDescartarConfirmOpen] = useState(false)
  const [venderConfirmOpen, setVenderConfirmOpen] = useState(false)
  const [presupuestoConfirmOpen, setPresupuestoConfirmOpen] = useState(false)
  const [presupuestoSubmitting, setPresupuestoSubmitting] = useState(false)
  const [presupuestoError, setPresupuestoError] = useState<string | null>(null)
  const [ventaSubmitting, setVentaSubmitting] = useState(false)
  const [ventaError, setVentaError] = useState<string | null>(null)
  const [lastCompletedSale, setLastCompletedSale] =
    useState<OperationSaleRow | null>(null)
  const [reprintSaleOpen, setReprintSaleOpen] = useState(false)
  const [reviewSaleOpen, setReviewSaleOpen] = useState(false)
  const [descuentoDraftModo, setDescuentoDraftModo] = useState<
    "porcentaje" | "fijo"
  >("porcentaje")

  useEffect(() => {
    if (!openCashSession?.cashTreasuryAccountId || quoteIdFromUrl) return
    setMetodoPagoSeleccionado((prev) => {
      if (payOnClientAccount) return prev
      if (prev) {
        if (prev.kind !== "cash") return prev
        if (prev.treasuryAccountId === openCashSession.cashTreasuryAccountId) {
          return prev
        }
        const next = {
          ...prev,
          treasuryAccountId: openCashSession.cashTreasuryAccountId,
        }
        if (popId) writeSavedSalePayment(popId, salePaymentToSaved(next))
        return next
      }
      const next = defaultCheckoutPaymentSelection(
        openCashSession.cashTreasuryAccountId,
      )
      if (popId && next) writeSavedSalePayment(popId, salePaymentToSaved(next))
      return next
    })
  }, [openCashSession, payOnClientAccount, popId, quoteIdFromUrl])

  const [descuentoDraftTexto, setDescuentoDraftTexto] = useState("")
  const focusScanRef = useRef<(() => void) | null>(null)
  const focusScan = useCallback(() => {
    focusScanRef.current?.()
  }, [])
  const registerFocusScan = useCallback((focus: () => void) => {
    focusScanRef.current = focus
  }, [])
  const busquedaClienteInputRef = useRef<HTMLInputElement>(null)

  const handleAddProduct = useCallback(
    (productId: string, kind?: Producto["kind"], quantity?: number) => {
      agregarAlCarrito(productId, kind, quantity)
    },
    [agregarAlCarrito],
  )

  const aplicarEdicionLineaTicketConFoco = useCallback(
    (input: Parameters<typeof aplicarEdicionLineaTicket>[0]) => {
      aplicarEdicionLineaTicket(input)
      focusScan()
    },
    [aplicarEdicionLineaTicket, focusScan],
  )

  const cambiarCantidadPorLineaConFoco = useCallback(
    (lineId: string, delta: number) => {
      cambiarCantidadPorLinea(lineId, delta)
      focusScan()
    },
    [cambiarCantidadPorLinea, focusScan],
  )

  const quitarQuantityDealApplicationConFoco = useCallback(
    (applicationId: string) => {
      quitarQuantityDealApplication(applicationId)
      focusScan()
    },
    [quitarQuantityDealApplication, focusScan],
  )

  const quoteLoadRef = useRef<string | null>(null)
  const quoteLoadingRef = useRef<string | null>(null)
  const saleIdempotencyKeyRef = useRef(crypto.randomUUID())
  const [quoteRestorePending, setQuoteRestorePending] = useState(
    () => Boolean(quoteIdFromUrl),
  )

  useEffect(() => {
    if (!quoteIdFromUrl) {
      setQuoteRestorePending(false)
      return
    }
    if (quoteLoadRef.current !== quoteIdFromUrl) {
      setQuoteRestorePending(true)
    }
  }, [quoteIdFromUrl])

  const saleModalOpen =
    clienteModalAbierto ||
    comprobanteModalAbierto ||
    pagoModalAbierto ||
    descuentoModalAbierto ||
    descartarConfirmOpen ||
    venderConfirmOpen ||
    presupuestoConfirmOpen ||
    promoWizardOpen ||
    reprintSaleOpen ||
    reviewSaleOpen

  const descuentoItemsMonto = useMemo(
    () =>
      catalogTotals.descuentoCatalogoMonto + catalogTotals.descuentoManualMonto,
    [catalogTotals.descuentoCatalogoMonto, catalogTotals.descuentoManualMonto],
  )
  const hayDescuentoItems = descuentoItemsMonto > 0

  const subtotal = catalogTotals.subtotal

  const descuentoMonto = useMemo(() => {
    if (modoDescuento === "porcentaje") {
      return subtotal * (valorDescuentoPorcentaje / 100)
    }
    return Math.min(valorDescuentoFijo, subtotal)
  }, [modoDescuento, subtotal, valorDescuentoPorcentaje, valorDescuentoFijo])

  const total = subtotal - descuentoMonto

  const hayDescuento = descuentoMonto > 0

  const hayItemsEnPedido = itemsDetallados.length > 0

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

  const puedeRegistrarVenta = useMemo(
    () =>
      hayItemsEnPedido &&
      pagoConfigurado &&
      (payOnClientAccount
        ? partyCanOperateOnCurrentAccount(clienteSeleccionado)
        : metodoPagoSeleccionado != null) &&
      canCreateSale &&
      canReadCashRegisters &&
      openCashSession != null,
    [
      hayItemsEnPedido,
      pagoConfigurado,
      payOnClientAccount,
      clienteSeleccionado,
      metodoPagoSeleccionado?.treasuryAccountId,
      canCreateSale,
      canReadCashRegisters,
      openCashSession,
    ],
  )

  const limpiarVenta = useCallback(() => {
    limpiarCarrito()
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
    const savedPay = popId ? readSavedSalePayment(popId) : undefined
    setPayOnClientAccount(savedPay?.mode === "client_account")
    setMetodoPagoSeleccionado(
      savedPay?.mode === "client_account"
        ? null
        : (savedSalePaymentToOption(savedPay) ??
            defaultCheckoutPaymentSelection(
              openCashSession?.cashTreasuryAccountId ?? null,
            )),
    )
    setDescartarConfirmOpen(false)
    setVenderConfirmOpen(false)
    setVentaError(null)
    focusScan()
  }, [focusScan, openCashSession?.cashTreasuryAccountId, popId, limpiarCarrito])

  const confirmarVenta = useCallback(async () => {
    if (!popId || !siteId || !pagoConfigurado) return
    if (payOnClientAccount && !clienteSeleccionado?.id) return
    if (!payOnClientAccount && !metodoPagoSeleccionado) return
    if (
      !payOnClientAccount &&
      metodoPagoSeleccionado?.kind === "check" &&
      !metodoPagoSeleccionado.checkDetails
    ) {
      return
    }
    setVentaError(null)
    setVentaSubmitting(true)
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
      const fiscalCustomer = hasFiscalOverride
        ? {
            name: manualOrFiscalName,
            taxId: manualOrFiscalTaxId,
          }
        : null
      const res = await completeSale(popId, {
        siteId,
        priceListId: getSalePriceListSession(popId),
        idempotencyKey: saleIdempotencyKeyRef.current,
        lines: buildCompleteSaleLinesFromCart({
          carrito,
          quantityDealApplications,
          quantityDealDiscounts,
          itemDescuentoModo: cartLineOverrides.itemDescuentoModo,
          itemDescuentoDraft: cartLineOverrides.itemDescuentoDraft,
          itemDescuentoSuprimido: cartLineOverrides.itemDescuentoSuprimido,
          itemComentarios: cartLineOverrides.itemComentarios,
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
        valorDescuentoPorcentaje,
        valorDescuentoFijo,
        invoiceTypeLabel: comprobante,
        customerIvaCondition:
          ventaIvaCondition.trim() ||
          clienteSeleccionado?.ivaCondition ||
          null,
        fiscalCustomer,
      })
      if (!res.success) {
        setVentaError(res.error)
        setVenderConfirmOpen(true)
        return
      }
      saleIdempotencyKeyRef.current = crypto.randomUUID()
      setVenderConfirmOpen(false)
      const soldTotal = total
      const saleId = res.saleId
      limpiarVenta()
      if (popId) {
        void applySaleStockChanges(queryClient, popId, res.stockChanges)
      }
      showRootsyToast({
        title: `Venta · ${saleOpFmt.format(soldTotal)}`,
        description: "Cobro listo. Reimprimí o abrí la venta.",
        intent: "success",
        duration: 8000,
        action: (
          <SaleSuccessToastActions
            onReprint={() => {
              void fetchOperationSaleById(popId, saleId).then((loaded) => {
                if (!loaded.success) {
                  showRootsyToast({
                    title: loaded.error,
                    intent: "danger",
                  })
                  return
                }
                setLastCompletedSale(loaded.sale)
                setReprintSaleOpen(true)
              })
            }}
            onReview={() => {
              void fetchOperationSaleById(popId, saleId).then((loaded) => {
                if (!loaded.success) {
                  showRootsyToast({
                    title: loaded.error,
                    intent: "danger",
                  })
                  return
                }
                setLastCompletedSale(loaded.sale)
                setReviewSaleOpen(true)
              })
            }}
          />
        ),
      })
      focusScan()
    } finally {
      setVentaSubmitting(false)
    }
  }, [
    popId,
    siteId,
    carrito,
    cartLineOverrides,
    quantityDealDiscounts,
    quantityDealApplications,
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
    limpiarVenta,
    queryClient,
    total,
    focusScan,
  ])

  useEffect(() => {
    if (modoDescuento !== "fijo") return
    if (valorDescuentoFijo > subtotal) {
      setValorDescuentoFijo(Math.max(0, subtotal))
    }
  }, [modoDescuento, subtotal, valorDescuentoFijo])

  const elegirComprobante = useCallback(
    (value: string | null) => {
      setComprobante(value)
      if (popId) writeSavedSaleComprobante(popId, value)
    },
    [popId],
  )

  const aplicarComprobanteDesdeCliente = useCallback(
    (c: Pick<
      SaleCatalogClient,
      "ivaCondition" | "defaultInvoiceTypeLabel"
    >) => {
      const resolved = resolveSaleComprobanteForClient({
        clientIvaCondition: c.ivaCondition as ClientIvaConditionValue | null,
        defaultInvoiceTypeLabel: c.defaultInvoiceTypeLabel,
        emisorIva: popEmisorIvaCondition,
      })
      if (
        resolved &&
        isAllowedSaleComprobanteLabel(
          invoiceTypeSiteId,
          resolved,
          popEmisorIvaCondition,
          hasValidPopFiscalCuit,
        )
      ) {
        setComprobante(resolved)
      }
    },
    [hasValidPopFiscalCuit, invoiceTypeSiteId, popEmisorIvaCondition],
  )

  const aplicarComprobanteDesdeIva = useCallback(
    (iva: ClientIvaConditionValue | null | undefined) => {
      if (!iva || !hasValidPopFiscalCuit) return
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
        setComprobante(suggested)
      }
    },
    [
      hasValidPopFiscalCuit,
      invoiceTypeSiteId,
      popEmisorIvaCondition,
    ],
  )

  useEffect(() => {
    if (
      payOnClientAccount &&
      clienteSeleccionado &&
      !partyCanOperateOnCurrentAccount(clienteSeleccionado)
    ) {
      setPayOnClientAccount(false)
    }
  }, [clienteSeleccionado, payOnClientAccount])

  const quitarClienteVenta = useCallback(() => {
    setClienteSeleccionado(null)
    setPayOnClientAccount(false)
    setManualNombreCliente("")
    setFiscalDocVenta("")
    setVentaEmail("")
    setVentaIvaCondition("")
    if (popId) {
      const saved = readSavedSaleComprobante(popId)
      setComprobante(
        saved !== undefined &&
          isAllowedSaleComprobanteLabel(
            invoiceTypeSiteId,
            saved,
            popEmisorIvaCondition,
            hasValidPopFiscalCuit,
          )
          ? saved
          : null,
      )
    } else {
      setComprobante(null)
    }
  }, [
    popId,
    invoiceTypeSiteId,
    popEmisorIvaCondition,
    hasValidPopFiscalCuit,
  ])

  const ventaIvaLabel = useMemo(
    () =>
      labelCondicionIva(
        clienteSeleccionado?.ivaCondition ?? ventaIvaCondition,
      ),
    [ventaIvaCondition, clienteSeleccionado?.ivaCondition],
  )

  const clienteCatalogoBloqueado =
    clienteSeleccionado != null && !clienteSeleccionado.manual

  const comprobantePickerOptions = useMemo(
    () =>
      comprobanteOptions.length > 0
        ? comprobanteOptions
        : getSaleComprobantePickerOptions(
            invoiceTypeSiteId,
            popEmisorIvaCondition,
            hasValidPopFiscalCuit,
          ),
    [
      comprobanteOptions,
      invoiceTypeSiteId,
      popEmisorIvaCondition,
      hasValidPopFiscalCuit,
    ],
  )

  const comprobanteDisplayLabel = useMemo(
    () => getSaleComprobanteDisplayLabel(comprobante),
    [comprobante],
  )

  const confirmClientLabel = useMemo(
    () =>
      clienteSeleccionado?.name?.trim() ||
      manualNombreCliente.trim() ||
      ventaPadron.razonSocial.trim() ||
      "Sin cliente",
    [
      clienteSeleccionado?.name,
      manualNombreCliente,
      ventaPadron.razonSocial,
    ],
  )

  const presupuestoComprobanteLabel = comprobanteDisplayLabel || "Sin comprobante"
  const presupuestoPaymentLabel = pagoConfigurado
    ? pagoResumenLabel
    : "Sin medio de pago"
  const presupuestoDiscountLabel = formatSaleQuoteDiscountLabel({
    modoDescuento,
    valorDescuentoPorcentaje,
    valorDescuentoFijo,
    descuentoMonto,
  })

  const aplicarPresupuestoEnVenta = useCallback(
    (snapshot: ReturnType<typeof buildSaleQuoteCheckoutSnapshot>) => {
      restaurarDesdeCheckout(snapshot)
      setClienteSeleccionado(snapshot.clienteSeleccionado)
      setManualNombreCliente(snapshot.manualNombreCliente)
      setFiscalDocVenta(snapshot.fiscalDocVenta)
      setVentaIvaCondition(snapshot.ventaIvaCondition)
      setVentaEmail(snapshot.clienteSeleccionado?.email ?? "")
      setComprobante(
        snapshot.comprobante &&
          isAllowedSaleComprobanteLabel(
            invoiceTypeSiteId,
            snapshot.comprobante,
            popEmisorIvaCondition,
            hasValidPopFiscalCuit,
          )
          ? snapshot.comprobante
          : null,
      )
      setMetodoPagoSeleccionado(snapshot.metodoPagoSeleccionado)
      setPayOnClientAccount(snapshot.payOnClientAccount)
      setModoDescuento(snapshot.modoDescuento)
      setValorDescuentoPorcentaje(snapshot.valorDescuentoPorcentaje)
      setValorDescuentoFijo(snapshot.valorDescuentoFijo)
      setVentaError(null)
      setPresupuestoError(null)
      focusScan()
    },
    [
      focusScan,
      hasValidPopFiscalCuit,
      invoiceTypeSiteId,
      popEmisorIvaCondition,
      restaurarDesdeCheckout,
    ],
  )

  const confirmarPresupuesto = useCallback(async () => {
    if (!popId || !hayItemsEnPedido) return
    setPresupuestoError(null)
    setPresupuestoSubmitting(true)
    try {
      const checkoutSnapshot = buildSaleQuoteCheckoutSnapshot({
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
        cartLineOverrides,
      })
      const res = await createSaleQuote(popId, {
        checkoutSnapshot,
        subtotal,
        discountTotal: descuentoMonto,
        total,
        clientId:
          clienteSeleccionado?.id && !clienteSeleccionado.manual
            ? clienteSeleccionado.id
            : null,
        customerName: confirmClientLabel,
        customerTaxId:
          fiscalDocVenta.trim() || clienteSeleccionado?.taxId || null,
        metadata: {
          comprobanteLabel: presupuestoComprobanteLabel,
          paymentLabel: presupuestoPaymentLabel,
          discountLabel: presupuestoDiscountLabel,
          lineGroups: buildQuoteLineGroupsFromDisplayRows(
            cartDisplayRows,
            cartLineOverrides,
          ),
          lineSummaries: buildQuoteLineSummariesFromDisplayRows(
            cartDisplayRows,
            cartLineOverrides,
          ),
        },
      })
      if (!res.success) {
        setPresupuestoError(res.error)
        return
      }
      setPresupuestoConfirmOpen(false)
      limpiarVenta()
      router.push(`/${siteId}/${popId}/quotes`)
    } finally {
      setPresupuestoSubmitting(false)
    }
  }, [
    popId,
    hayItemsEnPedido,
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
    cartLineOverrides,
    subtotal,
    descuentoMonto,
    total,
    confirmClientLabel,
    presupuestoComprobanteLabel,
    presupuestoPaymentLabel,
    presupuestoDiscountLabel,
    cartDisplayRows,
    limpiarVenta,
    router,
    siteId,
  ])

  useEffect(() => {
    if (!quoteIdFromUrl || !popId || catalogLoading || !bootstrapLoaded || !cartReady) return
    if (quoteLoadRef.current === quoteIdFromUrl) return
    if (quoteLoadingRef.current === quoteIdFromUrl) return

    quoteLoadingRef.current = quoteIdFromUrl
    comprobanteInitRef.current = true

    void (async () => {
      try {
        const res = await fetchSaleQuoteDetail(popId, quoteIdFromUrl)
        if (!res.success) {
          setVentaError(res.error)
          comprobanteInitRef.current = false
          setQuoteRestorePending(false)
          return
        }
        quoteLoadRef.current = quoteIdFromUrl
        aplicarPresupuestoEnVenta(res.quote.checkoutSnapshot)
        router.replace(`/${siteId}/${popId}/sale`, { scroll: false })
      } finally {
        quoteLoadingRef.current = null
      }
    })()
  }, [
    aplicarPresupuestoEnVenta,
    bootstrapLoaded,
    cartReady,
    catalogLoading,
    popId,
    quoteIdFromUrl,
    router,
    siteId,
  ])

  const comprobantePreviewInput = useMemo((): SaleComprobantePreviewInput | null => {
    if (!popId) return null
    return {
      popId,
      siteId: invoiceTypeSiteId,
      comprobanteLabel: comprobante,
      cartDisplayRows,
      cartLineOverrides: {
        itemDescuentoModo: cartLineOverrides.itemDescuentoModo,
        itemDescuentoDraft: cartLineOverrides.itemDescuentoDraft,
        itemDescuentoSuprimido: cartLineOverrides.itemDescuentoSuprimido,
        itemComentarios: cartLineOverrides.itemComentarios,
      },
      subtotal,
      discountAmount: descuentoMonto,
      total,
      customerName: confirmClientLabel,
      customerTaxId:
        clienteSeleccionado?.taxId?.trim() ||
        fiscalDocVenta.trim() ||
        null,
      customerIvaLabel: ventaIvaLabel || null,
      paymentMethodLabel: pagoResumenLabel,
    }
  }, [
    popId,
    invoiceTypeSiteId,
    comprobante,
    cartDisplayRows,
    cartLineOverrides,
    subtotal,
    descuentoMonto,
    total,
    confirmClientLabel,
    clienteSeleccionado?.taxId,
    fiscalDocVenta,
    ventaIvaLabel,
    pagoResumenLabel,
  ])

  useEffect(() => {
    if (!popId || !bootstrapLoaded || comprobanteInitRef.current || quoteIdFromUrl) {
      return
    }
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
    bootstrapLoaded,
    popEmisorIvaCondition,
    hasValidPopFiscalCuit,
    quoteIdFromUrl,
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

  const onClienteToolbarClick = () => {
    if (!canReadClients || !openCashSession) return
    setClienteModalAbierto(true)
  }

  const seleccionarCliente = (c: SaleCatalogClient) => {
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
    aplicarComprobanteDesdeCliente(c)
    setClienteModalAbierto(false)
  }

  const confirmarClienteManual = (
    payload: OperationPartyManualConfirmPayload,
    _options: OperationPartyManualConfirmOptions,
  ) => {
    setManualNombreCliente(payload.name)
    setFiscalDocVenta(payload.taxId)
    setVentaEmail(payload.email)
    setVentaIvaCondition(payload.ivaCondition)
    setClienteSeleccionado(buildOperationPartyManualSelection(payload))
    setPayOnClientAccount(false)
    if (payload.ivaCondition) {
      aplicarComprobanteDesdeIva(payload.ivaCondition as ClientIvaConditionValue)
    }
  }

  const abrirModalDescuento = () => {
    if (hayDescuento) {
      if (modoDescuento === "porcentaje") {
        setDescuentoDraftModo("porcentaje")
        setDescuentoDraftTexto(
          valorDescuentoPorcentaje > 0
            ? String(valorDescuentoPorcentaje)
            : "",
        )
      } else {
        setDescuentoDraftModo("fijo")
        setDescuentoDraftTexto(
          valorDescuentoFijo > 0 ? String(valorDescuentoFijo) : "",
        )
      }
    } else {
      setDescuentoDraftModo("porcentaje")
      setDescuentoDraftTexto("")
    }
    setDescuentoModalAbierto(true)
  }

  const aplicarDescuentoModal = () => {
    const raw = descuentoDraftTexto.trim().replace(",", ".")
    const n = Number.parseFloat(raw)
    if (!Number.isFinite(n) || n < 0) {
      setModoDescuento("porcentaje")
      setValorDescuentoPorcentaje(0)
      setValorDescuentoFijo(0)
      setDescuentoModalAbierto(false)
      return
    }
    if (descuentoDraftModo === "porcentaje") {
      const pct = Math.min(100, Math.max(0, n))
      setModoDescuento("porcentaje")
      setValorDescuentoPorcentaje(pct)
      setValorDescuentoFijo(0)
    } else {
      if (subtotal > 0 && n > subtotal) {
        setModoDescuento("porcentaje")
        setValorDescuentoPorcentaje(100)
        setValorDescuentoFijo(0)
      } else {
        const tope = Math.min(n, subtotal)
        setModoDescuento("fijo")
        setValorDescuentoFijo(Math.max(0, tope))
        setValorDescuentoPorcentaje(0)
      }
    }
    setDescuentoModalAbierto(false)
  }

  const quitarDescuento = () => {
    setModoDescuento("porcentaje")
    setValorDescuentoPorcentaje(0)
    setValorDescuentoFijo(0)
    setDescuentoModalAbierto(false)
  }

  const headerUserName =
    bootstrap?.userFullName?.trim() ||
    user?.email?.split("@")[0] ||
    "Usuario"

  const userAvatarSrc = bootstrap?.userImageUrl ?? undefined

  const descuentoToolboxLabel = hayDescuento
    ? modoDescuento === "porcentaje"
      ? `${valorDescuentoPorcentaje}%`
      : `Fijo ${saleOpFmt.format(valorDescuentoFijo)}`
    : "Sin descuento"

  const saleCheckout = useSaleCheckoutModel({
    hasItems: hayItemsEnPedido,
    total,
    subtotal,
    discountAmount: descuentoMonto,
    paymentReady: pagoConfigurado,
    payOnClientAccount,
    paymentKind: metodoPagoSeleccionado?.kind,
    party: clienteSeleccionado,
    partyTaxId: clienteSeleccionado?.taxId ?? fiscalDocVenta,
    comprobanteLabel: comprobante,
    comprobanteDisplayLabel,
    canReadClients,
    canCreateSale,
    canReadCashRegisters,
    cashOpen: Boolean(openCashSession),
    submitting: ventaSubmitting,
    clienteLabel: !canReadClients
      ? "Sin permiso"
      : (clienteSeleccionado?.name ?? "Elegir cliente"),
    clienteIvaLabel: ventaIvaLabel,
    pagoLabel: toolboxPaymentDisplay.pagoLabel,
    pagoSubLabel: toolboxPaymentDisplay.pagoSubLabel,
    pagoIcon: toolboxPaymentDisplay.pagoIcon,
    onOpenClient: onClienteToolbarClick,
    onOpenComprobante: () => {
      if (!openCashSession) return
      setComprobanteModalAbierto(true)
    },
    onOpenPago: () => {
      if (!openCashSession) return
      setPagoModalAbierto(true)
    },
    onDiscard: () => {
      if (!openCashSession || !hayItemsEnPedido) return
      setDescartarConfirmOpen(true)
    },
    onConfirm: () => {
      if (!puedeRegistrarVenta || ventaSubmitting) return
      setVentaError(null)
      const risk = resolveSaleCheckoutRisk({
        payOnClientAccount,
        paymentKind: metodoPagoSeleccionado?.kind,
        discountAmount: descuentoMonto,
        subtotal,
        comprobanteLabel: comprobante,
        partyTaxId: clienteSeleccionado?.taxId ?? fiscalDocVenta,
      })
      if (risk) {
        setVenderConfirmOpen(true)
        return
      }
      void confirmarVenta()
    },
  })

  useSaleCheckoutShortcuts({
    enabled: Boolean(popId && siteId) && !saleModalOpen,
    onCharge: saleCheckout.actions.onConfirm,
    onClient: saleCheckout.toolbox.onClienteClick,
    onDiscount: () => {
      if (!openCashSession) return
      abrirModalDescuento()
    },
    onDiscard: saleCheckout.actions.onDiscard,
  })

  const saleCheckoutActions = saleCheckout.actions
  const saleCheckoutPills = saleCheckout.pills
  const saleCheckoutToolbox = (
    <SaleOperationToolbox registerOnly {...saleCheckout.toolbox} />
  )

  const ahorroTotal =
    descuentoMonto + descuentoItemsMonto + promocionesAplicadasMonto

  if (!popId || !siteId) {
    return (
      <div className="min-h-screen bg-[var(--rootsy-negro)] p-10 text-sm text-[var(--rootsy-sombra-300)]">
        Punto de venta no encontrado
      </div>
    )
  }

  if (catalogPending) {
    return <PopModuleLoading moduleKey="sale" />
  }

  return (
    <SaleScanInputFocusProvider>
      <SaleScanFocusBridge
        modalOpen={saleModalOpen}
        onFocusReady={registerFocusScan}
      />
      <>
      <DataWorkspaceOperationsLayout
        siteId={siteId}
        popId={popId}
        popName={bootstrap?.popName ?? ""}
        title="Vender"
        mobileInitialStage="catalog"
        loading={!bootstrap?.popName}
        userName={headerUserName}
        userAvatarSrc={userAvatarSrc}
        sidebarCollapsible
        sidebarEdgeToggle={false}
        sidebarOpen={catalogSidebarOpen}
        onSidebarOpenChange={setCatalogSidebarOpen}
        headerActions={
          <>
            {isDevModeEnabled() ? <SaleDevtoolsPanel /> : null}
            <div className="md:hidden">
              <SaleOperationDiscountHeaderButton
                disabled={!openCashSession}
                active={hayDescuento && Boolean(openCashSession)}
                title={descuentoToolboxLabel}
                onClick={() => {
                  if (!openCashSession) return
                  abrirModalDescuento()
                }}
              />
            </div>
          </>
        }
        headerMoreActions={[
          {
            label: "Crear presupuesto",
            icon: FileText,
            onClick: () => {
              if (!hayItemsEnPedido || presupuestoSubmitting) return
              setPresupuestoError(null)
              setPresupuestoConfirmOpen(true)
            },
          },
        ]}
      >
        <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
          <OperationsModuleBackdrop />

          {!openCashSession ? (
            <div className="relative z-20 shrink-0">
              <RootsBanner
                intent="warning"
                tone="dark"
                variant="strip"
                title="Necesitás una caja abierta"
                message="Abrí un turno en Cajas para poder cobrar."
                actionLabel="Ir a cajas"
                actionHref={popScopedHref(siteId, popId, "cash-registers")}
              />
            </div>
          ) : null}

          {quoteRestorePending ? (
            <div
              className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[color-mix(in_srgb,var(--rootsy-negro)_90%,transparent)] backdrop-blur-[2px]"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <RootsSpinner size="default" tone="dark" label="Cargando presupuesto" />
              <p className="text-sm font-medium text-white/90">
                Cargando presupuesto…
              </p>
              <p className="max-w-xs text-center text-xs text-white/50">
                Preparando ítems, cliente y condiciones de la venta
              </p>
            </div>
          ) : null}

          <LayoutsOperarMainGrid
            catalog={
              <SaleCatalogBrowser
                siteId={siteId}
                popId={popId}
                categories={saleCategories}
                categorySections={saleCategorySections}
                products={productosCatalogo}
                loading={catalogLoading}
                error={catalogError}
                onAddProduct={handleAddProduct}
                addDisabled={!cartReady || ventaSubmitting}
                catalogSidebarOpen={catalogSidebarOpen}
                onCatalogSidebarOpenChange={setCatalogSidebarOpen}
                catalogScope="sale"
                itemsSource="sale"
                mergeCatalogArticles={mergeCatalogArticles}
                keepScanFocused
              />
            }
            floor={
              <>
                {saleCheckoutToolbox}
                <LayoutsOperarSaleCheckoutFloor
                  proposal="pills"
                  proposalSteps={saleCheckoutPills.steps}
                  savingsAmount={ahorroTotal}
                  closingTotal={total}
                  actions={saleCheckoutActions}
                />
              </>
            }
            ticket={
              <aside
                className={cn(
                  layoutsOperarSummaryPanelClass,
                  layoutsOperarSummaryPanelMobileStackClass,
                )}
                aria-label="Carrito de la venta"
              >
                <SaleOperationTicketOrderPanel
                  cartDisplayRows={cartDisplayRows}
                  cartLineOverrides={cartLineOverrides}
                  aplicarEdicionLineaTicket={aplicarEdicionLineaTicketConFoco}
                  cambiarCantidadPorLinea={cambiarCantidadPorLineaConFoco}
                  quitarQuantityDealApplication={quitarQuantityDealApplicationConFoco}
                  listTitle="Pedido"
                  cartScrollHighlight={cartScrollHighlight}
                  showDesktopActions={false}
                  actions={saleCheckoutActions}
                  totalBar={{
                    total,
                    subtotal,
                    descuentoMonto,
                    hayDescuento,
                    subtotalOriginal: catalogTotals.subtotalOriginal,
                    descuentoItemsMonto,
                    hayDescuentoItems,
                    promocionesAplicadasMonto,
                    promocionesAplicadasCount,
                    onGeneralDiscountClick: () => {
                      if (!openCashSession) return
                      abrirModalDescuento()
                    },
                    generalDiscountDisabled: !openCashSession,
                  }}
                />
              </aside>
            }
          />
        </div>
      </DataWorkspaceOperationsLayout>

      <PromotionComboWizard
        open={promoWizardOpen}
        promotion={promoWizardTarget}
        onOpenChange={setPromoWizardOpen}
        onConfirm={(selections) => {
          if (promoWizardTarget) {
            confirmarPromoWizard(promoWizardTarget.id, selections)
          }
          setPromoWizardOpen(false)
          focusScan()
        }}
      />

      <OperationPartyPickerDialog
        popId={popId ?? ""}
        flow="sale"
        context="venta"
        open={clienteModalAbierto}
        onOpenChange={(open) => {
          setClienteModalAbierto(open)
          if (open && clienteSeleccionado?.manual) {
            setManualNombreCliente(clienteSeleccionado.name)
            setFiscalDocVenta(clienteSeleccionado.taxId ?? "")
            setVentaEmail(clienteSeleccionado.email ?? "")
            setVentaIvaCondition(clienteSeleccionado.ivaCondition ?? "")
          }
        }}
        canSearchCatalog={canReadClients}
        canCreateClient={canCreateClient}
        manualName={manualNombreCliente}
        onManualNameChange={setManualNombreCliente}
        taxId={fiscalDocVenta}
        onTaxIdChange={setFiscalDocVenta}
        email={ventaEmail}
        onEmailChange={setVentaEmail}
        ivaCondition={ventaIvaCondition}
        onIvaConditionChange={setVentaIvaCondition}
        selected={clienteSeleccionado}
        catalogBlocked={clienteCatalogoBloqueado}
        onSelectCatalogParty={(party) =>
          seleccionarCliente({
            id: party.id,
            name: party.name,
            taxId: party.taxId ?? null,
            ivaCondition: party.ivaCondition ?? null,
            defaultInvoiceTypeLabel: party.defaultInvoiceTypeLabel ?? null,
            currentAccountEnabled: party.currentAccountEnabled === true,
          })
        }
        onConfirmManual={confirmarClienteManual}
        onClearSelection={quitarClienteVenta}
        onIvaConditionApplied={aplicarComprobanteDesdeIva}
      />

      <SaleComprobantePickerDialog
        open={comprobanteModalAbierto}
        onOpenChange={setComprobanteModalAbierto}
        context="venta"
        options={comprobantePickerOptions}
        value={comprobante}
        onSelect={(value) => {
          setComprobante(value)
          if (popId) writeSavedSaleComprobante(popId, value)
        }}
        previewInput={comprobantePreviewInput}
        emitter={comprobanteEmitter}
      />

      <SalePaymentMethodDialog
        open={pagoModalAbierto}
        onOpenChange={setPagoModalAbierto}
        treasuryContext={treasuryPaymentContext}
        cashTreasuryAccountId={openCashSession?.cashTreasuryAccountId ?? null}
        cashRegisterName={openCashSession?.registerName ?? null}
        selected={metodoPagoSeleccionado}
        payOnClientAccount={payOnClientAccount}
        popId={popId}
        defaultPartyName={clienteSeleccionado?.name ?? ""}
        defaultPartyId={
          clienteSeleccionado && !clienteSeleccionado.manual
            ? clienteSeleccionado.id ?? ""
            : ""
        }
        onSelectImmediate={(option) => {
          setPayOnClientAccount(false)
          setMetodoPagoSeleccionado(option)
          if (popId && option) {
            writeSavedSalePayment(popId, salePaymentToSaved(option))
          }
        }}
        onSelectClientAccount={() => {
          setPayOnClientAccount(true)
          setMetodoPagoSeleccionado(null)
          if (popId) {
            writeSavedSalePayment(popId, { mode: "client_account" })
          }
        }}
        hideAccountOption={!partyCanOperateOnCurrentAccount(clienteSeleccionado)}
      />

      <GeneralDiscountDialog
        open={descuentoModalAbierto}
        onOpenChange={setDescuentoModalAbierto}
        context="venta"
        subtotal={subtotal}
        draftMode={descuentoDraftModo}
        onDraftModeChange={setDescuentoDraftModo}
        draftText={descuentoDraftTexto}
        onDraftTextChange={setDescuentoDraftTexto}
        onApply={aplicarDescuentoModal}
        onClear={quitarDescuento}
      />

      <AlertDialog open={descartarConfirmOpen} onOpenChange={setDescartarConfirmOpen}>
        <RootsAlertDialogContent>
          <RootsAlertDialogPanel
            title="¿Descartar la venta?"
            description="Se quitarán los productos del pedido, el cliente, el tipo de comprobante, los descuentos y los comentarios de línea. Esta acción no se puede deshacer."
          />
          <RootsAlertDialogFooter
            cancelLabel="Cancelar"
            confirmLabel="Descartar"
            destructive
            onCancel={() => setDescartarConfirmOpen(false)}
            onConfirm={limpiarVenta}
          />
        </RootsAlertDialogContent>
      </AlertDialog>

      <SimpleOperationCheckoutConfirmDialog
        open={presupuestoConfirmOpen}
        onOpenChange={(open) => {
          setPresupuestoConfirmOpen(open)
          if (!open) setPresupuestoError(null)
        }}
        title="Generar presupuesto"
        confirmLabel="Generar presupuesto"
        amountLabel="Total"
        submitting={presupuestoSubmitting}
        submitError={presupuestoError}
        total={total}
        subtotal={subtotal}
        descuentoMonto={descuentoMonto}
        hayDescuento={hayDescuento}
        partyValue={confirmClientLabel}
        comprobanteLabel={presupuestoComprobanteLabel}
        paymentLabel={presupuestoPaymentLabel}
        onConfirm={confirmarPresupuesto}
      />

      <SimpleOperationCheckoutConfirmDialog
        open={venderConfirmOpen}
        onOpenChange={(open) => {
          setVenderConfirmOpen(open)
          if (!open) setVentaError(null)
        }}
        title="Confirmar venta"
        confirmLabel="Confirmar venta"
        submitting={ventaSubmitting}
        submitError={ventaError}
        total={total}
        subtotal={subtotal}
        descuentoMonto={descuentoMonto}
        hayDescuento={hayDescuento}
        partyValue={confirmClientLabel}
        comprobanteLabel={comprobanteDisplayLabel}
        paymentLabel={pagoResumenLabel}
        onConfirm={confirmarVenta}
      />

      <OperationSaleInvoiceDialog
        sale={lastCompletedSale}
        open={reprintSaleOpen}
        onOpenChange={setReprintSaleOpen}
        siteId={siteId}
        popId={popId}
      />
      <OperationSaleDetailDialog
        sale={lastCompletedSale}
        open={reviewSaleOpen}
        onOpenChange={setReviewSaleOpen}
        siteId={siteId}
        popId={popId}
      />
      </>
    </SaleScanInputFocusProvider>
  )
}

