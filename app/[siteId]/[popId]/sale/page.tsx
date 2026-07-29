"use client"

import withAuth from "@/hoc/withAuth"
import Image from "next/image"
import { completeSale } from "@/app/[siteId]/[popId]/sale/completeSale"
import {
  getSaleCatalog,
  type SaleCatalogArticle,
  type SaleCatalogCategory,
  type SaleCatalogClient,
  type SaleCatalogPaymentOption,
  type SaleOpenCashSession,
} from "@/app/[siteId]/[popId]/sale/actions"
import { defaultCheckoutPaymentSelection } from "@/lib/saleCheckoutPayment"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"
import { treasuryPaymentOptionKey } from "@/lib/treasuryPaymentOptions"
import type { MenuCatalogPromotion } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import {
  DEFAULT_SALE_SITE_ID,
} from "@/lib/saleInvoiceTypes"
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
import {
  readSavedSaleCatalogView,
  writeSavedSaleCatalogView,
  type SaleCatalogViewPersisted,
} from "@/lib/saleCatalogPreference"
import { CLIENT_ACCOUNT_PAYMENT_LABEL } from "@/lib/operationPaymentLabels"
import { OpenCashSessionBanner } from "@/components/sale-operation/OpenCashSessionBanner"
import { SalePaymentMethodDialog } from "@/components/sale-operation/SalePaymentMethodDialog"
import { OperationPartyPickerDialog } from "@/components/checkout/OperationPartyPickerDialog"
import { SaleComprobantePickerDialog } from "@/components/checkout/SaleComprobantePickerDialog"
import { GeneralDiscountDialog } from "@/components/checkout/GeneralDiscountDialog"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { useDataWorkspaceSidebar } from "@/components/layouts/useDataWorkspaceSidebar"
import { useAuth } from "@/context/AuthContextSupabase"
import { useParams } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  Banknote,
  CircleCheck,
  CircleX,
  LayoutGrid,
  Loader2,
  MessageSquare,
  Percent,
  Plus,
  Receipt,
  Rows3,
  Search,
  Tag,
  User,
} from "lucide-react"
import { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SaleOperationTicketOrderPanel } from "@/components/sale-operation/SaleOperationTicketOrderPanel"
import { PromotionComboWizard } from "@/components/sale-operation/PromotionComboWizard"
import { useSaleTicketCart } from "@/hooks/useSaleTicketCart"
import { buildCompleteSaleLinesFromCart } from "@/lib/saleCompleteLines"
import type { MenuCatalogProduct } from "@/lib/menuCatalogProduct"
import {
  SaleCatalogProductOfferOverlay,
  saleCatalogDiscountPercent,
} from "@/components/sale-operation/SaleCatalogProductOfferOverlay"
import { saleOpImporteBaseClass } from "@/components/sale-operation/saleOperationStyles"

type Producto = MenuCatalogProduct

type ClienteVentaSeleccionado = {
  id: string | null
  manual: boolean
  name: string
  taxId: string | null
  ivaCondition: string | null
  defaultInvoiceTypeLabel: string | null
}

type VistaCatalogo = SaleCatalogViewPersisted

const CATEGORIA_TODOS = "Todos"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

/** Tipografía numérica alineada al workspace (tablas de importes). */
const ventaImporteBaseClass = saleOpImporteBaseClass
const ventaImporteTotalClass = cn(
  ventaImporteBaseClass,
  "whitespace-nowrap text-[clamp(1.05rem,1.75vw,1.4375rem)] font-semibold text-white/90",
)
const ventaImporteCardClass = cn(
  ventaImporteBaseClass,
  "block text-[clamp(1.05rem,1.65vw,1.3125rem)] leading-none font-semibold text-white/90",
)
const ventaImporteTotalMutedClass = cn(
  ventaImporteBaseClass,
  "text-[11px] line-through decoration-white/25 text-white/38",
)
const ventaImporteTotalDiscountClass = cn(
  ventaImporteBaseClass,
  "text-[11px] font-medium text-emerald-300/95",
)

const IVA_LABEL_BY_VALUE = Object.fromEntries(
  CLIENT_IVA_CONDITION_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>

function labelCondicionIva(value: string | null | undefined) {
  if (!value?.trim()) return null
  return IVA_LABEL_BY_VALUE[value] ?? value
}

function normalizarBusqueda(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
}

function IconoLimpiarBusqueda({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-[14px] shrink-0", className)}
      aria-hidden
    >
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  )
}

function SalePage() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined
  const {
    open: catalogSidebarOpen,
    setOpen: setCatalogSidebarOpen,
  } = useDataWorkspaceSidebar(siteId, popId ?? "", Boolean(popId))
  const { user } = useAuth()

  const [catalogArticles, setCatalogArticles] = useState<SaleCatalogArticle[]>(
    [],
  )
  const [catalogPromotions, setCatalogPromotions] = useState<
    MenuCatalogPromotion[]
  >([])
  const [catalogQuantityDeals, setCatalogQuantityDeals] = useState<
    MenuCatalogPromotion[]
  >([])
  const [treasuryPaymentContext, setTreasuryPaymentContext] =
    useState<TreasuryPaymentContext | null>(null)
  const [canReadClients, setCanReadClients] = useState(false)
  const [canReadPaymentMethods, setCanReadPaymentMethods] = useState(false)
  const [invoiceTypeSiteId, setInvoiceTypeSiteId] = useState<string>(
    DEFAULT_SALE_SITE_ID,
  )
  const [saleCategories, setSaleCategories] = useState<SaleCatalogCategory[]>(
    [],
  )
  const [popName, setPopName] = useState("")
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)

  const categoriasNav = useMemo(
    () => [CATEGORIA_TODOS, ...saleCategories.map((c) => c.name)],
    [saleCategories],
  )

  const loadCatalog = useCallback(async () => {
    if (!popId || !siteId) {
      setCatalogLoading(false)
      setCatalogError("Punto de venta no encontrado")
      return
    }
    setCatalogLoading(true)
    setCatalogError(null)
    const res = await getSaleCatalog(popId)
    if (!res.success) {
      setCatalogArticles([])
      setCatalogPromotions([])
      setCatalogQuantityDeals([])
      setTreasuryPaymentContext(null)
      setCanReadClients(false)
      setCanReadPaymentMethods(false)
      setCanCreateSale(false)
      setCanReadCashRegisters(false)
      setOpenCashSession(null)
      setSaleCategories([])
      setPopName("")
      setCatalogError(res.error)
      setCatalogLoading(false)
      return
    }
    setCatalogArticles(res.articles)
    setCatalogPromotions(res.promotions)
    setCatalogQuantityDeals(res.quantityDeals)
    setTreasuryPaymentContext(res.treasuryPaymentContext)
    setCanReadClients(res.canReadClients)
    setCanReadPaymentMethods(res.canReadPaymentMethods)
    setCanCreateSale(res.canCreateSale)
    setCanReadCashRegisters(res.canReadCashRegisters)
    setOpenCashSession(res.openCashSession)
    setInvoiceTypeSiteId(res.invoiceTypeSiteId)
    setSaleCategories(res.categories)
    setPopName(res.popName)
    setCatalogError(null)
    setCatalogLoading(false)
  }, [popId, siteId])

  useEffect(() => {
    void loadCatalog()
  }, [loadCatalog])

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
  } = useSaleTicketCart({
    menuArticles: catalogArticles,
    menuPromotions: catalogPromotions,
    menuQuantityDeals: catalogQuantityDeals,
  })

  const [vistaCatalogo, setVistaCatalogo] = useState<VistaCatalogo>(() => {
    if (!popId) {
      return { modo: "categoria", categoria: CATEGORIA_TODOS }
    }
    return (
      readSavedSaleCatalogView(popId) ?? {
        modo: "categoria",
        categoria: CATEGORIA_TODOS,
      }
    )
  })
  const [modoVista, setModoVista] = useState<"grid" | "lista">("grid")
  const [busqueda, setBusqueda] = useState("")
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<ClienteVentaSeleccionado | null>(null)
  const [ventaIvaCondition, setVentaIvaCondition] = useState("")
  const [manualNombreCliente, setManualNombreCliente] = useState("")
  const [fiscalDocVenta, setFiscalDocVenta] = useState("")
  const ventaPadron = usePadronAutofillRazonSocial(popId, fiscalDocVenta, {
    enabled:
      Boolean(popId) &&
      (clienteSeleccionado == null || clienteSeleccionado.manual),
  })
  const [clienteModalAbierto, setClienteModalAbierto] = useState(false)
  const [comprobante, setComprobante] = useState<string | null>(null)
  const [comprobanteModalAbierto, setComprobanteModalAbierto] = useState(false)
  const comprobanteInitRef = useRef(false)
  const catalogViewInitRef = useRef(false)
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] =
    useState<SaleCatalogPaymentOption | null>(null)
  const [payOnClientAccount, setPayOnClientAccount] = useState(false)
  const [pagoModalAbierto, setPagoModalAbierto] = useState(false)
  const [modoDescuento, setModoDescuento] = useState<"porcentaje" | "fijo">(
    "porcentaje",
  )
  const [valorDescuentoPorcentaje, setValorDescuentoPorcentaje] = useState(0)
  const [valorDescuentoFijo, setValorDescuentoFijo] = useState(0)
  const [descuentoModalAbierto, setDescuentoModalAbierto] = useState(false)
  const [descartarConfirmOpen, setDescartarConfirmOpen] = useState(false)
  const [venderConfirmOpen, setVenderConfirmOpen] = useState(false)
  const [ventaSubmitting, setVentaSubmitting] = useState(false)
  const [ventaError, setVentaError] = useState<string | null>(null)
  const [canCreateSale, setCanCreateSale] = useState(false)
  const [canReadCashRegisters, setCanReadCashRegisters] = useState(false)
  const [openCashSession, setOpenCashSession] =
    useState<SaleOpenCashSession | null>(null)
  const [descuentoDraftModo, setDescuentoDraftModo] = useState<
    "porcentaje" | "fijo"
  >("porcentaje")

  useEffect(() => {
    if (!openCashSession?.cashTreasuryAccountId) return
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
  }, [openCashSession])

  const [descuentoDraftTexto, setDescuentoDraftTexto] = useState("")
  const busquedaProductosInputRef = useRef<HTMLInputElement>(null)
  const busquedaClienteInputRef = useRef<HTMLInputElement>(null)
  const vistaAntesBusquedaRef = useRef<VistaCatalogo | null>(null)
  const busquedaTrimPrevRef = useRef("")

  const productosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const hayBusqueda = q.length > 0
    return productosCatalogo.filter((p) => {
      const matchVista = hayBusqueda
        ? true
        : vistaCatalogo.modo === "categoria"
          ? p.kind === "article" &&
            (vistaCatalogo.categoria === CATEGORIA_TODOS ||
              p.categoria === vistaCatalogo.categoria)
          : vistaCatalogo.modo === "promociones"
            ? p.kind === "promotion" || Boolean(p.promo?.trim())
            : p.precioOriginal != null && p.precioOriginal > p.precio
      const matchQ =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q)
      return matchVista && matchQ
    })
  }, [busqueda, vistaCatalogo, productosCatalogo])

  useEffect(() => {
    const trimmed = busqueda.trim()
    const prevTrimmed = busquedaTrimPrevRef.current
    const wasEmpty = prevTrimmed.length === 0
    const isEmpty = trimmed.length === 0

    if (!isEmpty && wasEmpty) {
      vistaAntesBusquedaRef.current = vistaCatalogo
    }

    if (isEmpty && !wasEmpty) {
      const saved = vistaAntesBusquedaRef.current
      if (saved != null) {
        setVistaCatalogo(saved)
        vistaAntesBusquedaRef.current = null
      }
    }

    if (!isEmpty) {
      setVistaCatalogo((prev) => {
        if (prev.modo === "categoria" && prev.categoria === CATEGORIA_TODOS) {
          return prev
        }
        return { modo: "categoria", categoria: CATEGORIA_TODOS }
      })
    }

    busquedaTrimPrevRef.current = trimmed
  }, [busqueda, vistaCatalogo])

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

  const puedeRegistrarVenta = useMemo(
    () =>
      hayItemsEnPedido &&
      pagoConfigurado &&
      (payOnClientAccount
        ? Boolean(clienteSeleccionado?.id)
        : metodoPagoSeleccionado != null) &&
      canCreateSale &&
      canReadCashRegisters &&
      openCashSession != null,
    [
      hayItemsEnPedido,
      pagoConfigurado,
      payOnClientAccount,
      clienteSeleccionado?.id,
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
    setMetodoPagoSeleccionado(() =>
      defaultCheckoutPaymentSelection(openCashSession?.cashTreasuryAccountId ?? null),
    )
    setPayOnClientAccount(false)
    setDescartarConfirmOpen(false)
    setVenderConfirmOpen(false)
    setVentaError(null)
  }, [openCashSession?.cashTreasuryAccountId, popId, limpiarCarrito])

  const confirmarVenta = useCallback(async () => {
    if (!popId || !siteId || !pagoConfigurado) return
    if (payOnClientAccount && !clienteSeleccionado?.id) return
    if (!payOnClientAccount && !metodoPagoSeleccionado) return
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
        generalDiscountMode: modoDescuento === "porcentaje" ? "porcentaje" : "fijo",
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
        return
      }
      setVenderConfirmOpen(false)
      limpiarVenta()
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
  ])

  useEffect(() => {
    if (modoDescuento !== "fijo") return
    if (valorDescuentoFijo > subtotal) {
      setValorDescuentoFijo(Math.max(0, subtotal))
    }
  }, [modoDescuento, subtotal, valorDescuentoFijo])

  const persistVistaCatalogo = useCallback(
    (view: VistaCatalogo) => {
      setVistaCatalogo(view)
      if (popId) writeSavedSaleCatalogView(popId, view)
    },
    [popId],
  )

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
      })
      setComprobante(resolved)
    },
    [],
  )

  const aplicarComprobanteDesdeIva = useCallback(
    (iva: ClientIvaConditionValue | null | undefined) => {
      if (!iva) return
      const suggested = suggestSaleComprobanteForClientIva(iva)
      if (suggested) setComprobante(suggested)
    },
    [],
  )

  const quitarClienteVenta = useCallback(() => {
    setClienteSeleccionado(null)
    setManualNombreCliente("")
    setFiscalDocVenta("")
    setVentaIvaCondition("")
    if (popId) {
      const saved = readSavedSaleComprobante(popId)
      setComprobante(
        saved !== undefined && isAllowedSaleComprobanteLabel(invoiceTypeSiteId, saved)
          ? saved
          : null,
      )
    } else {
      setComprobante(null)
    }
  }, [popId, invoiceTypeSiteId])

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
    () => getSaleComprobantePickerOptions(invoiceTypeSiteId),
    [invoiceTypeSiteId],
  )

  const comprobanteDisplayLabel = useMemo(
    () => getSaleComprobanteDisplayLabel(comprobante),
    [comprobante],
  )

  useEffect(() => {
    if (!popId || comprobanteInitRef.current) return
    comprobanteInitRef.current = true
    const saved = readSavedSaleComprobante(popId)
    if (saved !== undefined) {
      setComprobante(
        isAllowedSaleComprobanteLabel(invoiceTypeSiteId, saved) ? saved : null,
      )
    }
  }, [popId, invoiceTypeSiteId])

  useEffect(() => {
    if (!popId || catalogLoading || catalogViewInitRef.current) return
    catalogViewInitRef.current = true
    const saved = readSavedSaleCatalogView(popId)
    if (!saved) return
    if (saved.modo === "categoria" && !categoriasNav.includes(saved.categoria)) {
      return
    }
    setVistaCatalogo(saved)
  }, [popId, catalogLoading, categoriasNav])

  const onClienteToolbarClick = () => {
    if (!canReadClients) return
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
    })
    setManualNombreCliente(c.name)
    setFiscalDocVenta(c.taxId ?? "")
    setVentaIvaCondition(c.ivaCondition ?? "")
    aplicarComprobanteDesdeCliente(c)
    setClienteModalAbierto(false)
  }

  const seleccionarClienteManual = () => {
    const name =
      manualNombreCliente.trim() || ventaPadron.razonSocial.trim()
    if (!name && !fiscalDocVenta.trim()) return
    const iva =
      ventaIvaCondition.trim() || ventaPadron.mappedIvaCondition || null
    setClienteSeleccionado({
      id: null,
      manual: true,
      name: name || "Cliente sin nombre",
      taxId: fiscalDocVenta.trim() || null,
      ivaCondition: iva,
      defaultInvoiceTypeLabel: null,
    })
    if (iva) {
      aplicarComprobanteDesdeIva(iva as ClientIvaConditionValue)
    }
    setClienteModalAbierto(false)
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

  const toolboxBarClass =
    "box-border border-t border-white/10 bg-[#0b100e]/92 backdrop-blur-xl"
  /** Altura mínima compartida en toolbox (izq.) y total (der.); el total crece si hay más líneas. */
  const ventaFooterBandHeightClass =
    "min-h-[calc(4.5rem+1rem)] sm:min-h-[calc(4.75rem+1.25rem)]"
  const ventaFooterBarPaddingClass = "p-2 sm:p-2.5"
  const toolboxSlotClass = (configurado: boolean) =>
    cn(
      "group flex h-full min-h-[4.5rem] w-full items-center gap-2.5 rounded-xl border-0 px-2.5 py-2 text-left transition-[background-color,box-shadow] duration-150 sm:min-h-[4.75rem] sm:gap-3 sm:px-3",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b100e]",
      configurado
        ? "bg-emerald-500/[0.09] shadow-[inset_0_1px_0_rgba(167,243,208,0.08)] hover:bg-emerald-500/12"
        : "bg-white/[0.02] hover:bg-white/[0.05]",
    )
  const toolboxIconWrap = (configurado: boolean) =>
    cn(
      "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 sm:size-10",
      configurado
        ? "bg-emerald-500/20 text-emerald-200"
        : "bg-white/[0.06] text-foreground/45 group-hover:bg-white/10 group-hover:text-foreground/75",
    )

  const ventaDialogOptionClass = (seleccionado: boolean, disabled = false) =>
    cn(
      "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
      disabled &&
        (seleccionado
          ? "cursor-default"
          : "pointer-events-none opacity-45"),
      seleccionado
        ? "border-primary/40 bg-primary/10 ring-1 ring-primary/15"
        : "border-border/70 bg-muted/20 hover:bg-muted/35",
    )

  const ventaDialogLight = "rootsy-app-light text-foreground"
  const ventaDialogSurface =
    "gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 shadow-2xl ring-1 ring-black/[0.04]"
  const ventaDialogMaxViewport =
    "max-h-[calc(100vh-100px)] flex flex-col overflow-hidden"
  const ventaDialogSurfaceMd = cn(
    ventaDialogSurface,
    ventaDialogMaxViewport,
    "sm:max-w-md",
  )
  const ventaDialogContentMd = cn(ventaDialogSurfaceMd, ventaDialogLight)
  const ventaDialogHeader =
    "space-y-1.5 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left"
  const ventaDialogBody = "px-6 py-4"
  const ventaDialogFooter =
    "border-t border-border/50 bg-muted/15 px-6 py-3.5 sm:justify-between"
  const ventaDialogPrimaryBtn =
    "h-10 bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700"
  const ventaDialogGhostBtn = "h-10 text-muted-foreground hover:text-foreground"
  const ventaAlertDialogContent = cn(
    ventaDialogLight,
    "rounded-2xl border border-border/60 bg-card shadow-2xl sm:max-w-md",
  )

  const headerUserName = useMemo(() => {
    const meta = user?.user_metadata?.full_name
    if (typeof meta === "string" && meta.trim()) return meta.trim()
    return user?.email?.split("@")[0] || "Usuario"
  }, [user?.email, user?.user_metadata?.full_name])

  const userAvatarSrc =
    user?.user_metadata?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.email || "u")}`

  const catalogSidebar = useMemo(
    () => (
      <nav
        className="game-scroll flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-3 py-4"
        aria-label="Filtros del catálogo"
      >
          <div>
            <p className="mb-2.5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Categorías
            </p>
            <ul className="flex flex-col gap-0.5 p-0" role="list">
              <li>
                <button
                  type="button"
                  onClick={() =>
                    persistVistaCatalogo({
                      modo: "categoria",
                      categoria: CATEGORIA_TODOS,
                    })
                  }
                  className={cn(
                    "relative flex min-h-11 w-full items-center rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2027]",
                    vistaCatalogo.modo === "categoria" &&
                      vistaCatalogo.categoria === CATEGORIA_TODOS
                      ? "bg-white/10 text-white before:absolute before:top-1/2 before:left-0 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-emerald-400 before:content-['']"
                      : "text-slate-400 hover:bg-white/6 hover:text-slate-100",
                  )}
                >
                  {CATEGORIA_TODOS}
                </button>
              </li>
              {saleCategories.map((cat) => {
                const seleccionado =
                  vistaCatalogo.modo === "categoria" &&
                  vistaCatalogo.categoria === cat.name
                return (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() =>
                        persistVistaCatalogo({
                          modo: "categoria",
                          categoria: cat.name,
                        })
                      }
                      className={cn(
                        "relative flex min-h-11 w-full items-center rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2027]",
                        seleccionado
                          ? "bg-white/10 text-white before:absolute before:top-1/2 before:left-0 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-emerald-400 before:content-['']"
                          : "text-slate-400 hover:bg-white/6 hover:text-slate-100",
                      )}
                    >
                      {cat.name}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <p className="mb-2.5 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Listados rápidos
            </p>
            <ul className="flex flex-col gap-0.5 p-0" role="list">
              <li>
                <button
                  type="button"
                  aria-pressed={vistaCatalogo.modo === "promociones"}
                  onClick={() => persistVistaCatalogo({ modo: "promociones" })}
                  className={cn(
                    "relative flex min-h-11 w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2027]",
                    vistaCatalogo.modo === "promociones"
                      ? "bg-emerald-500/12 text-emerald-100 before:absolute before:top-1/2 before:left-0 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-emerald-400 before:content-['']"
                      : "text-slate-400 hover:bg-white/6 hover:text-slate-100",
                  )}
                >
                  <Tag className="size-4 shrink-0 opacity-80" aria-hidden />
                  Promociones
                </button>
              </li>
              <li>
                <button
                  type="button"
                  aria-pressed={vistaCatalogo.modo === "con_descuento"}
                  onClick={() => persistVistaCatalogo({ modo: "con_descuento" })}
                  className={cn(
                    "relative flex min-h-11 w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2027]",
                    vistaCatalogo.modo === "con_descuento"
                      ? "bg-amber-500/12 text-amber-100 before:absolute before:top-1/2 before:left-0 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-amber-400 before:content-['']"
                      : "text-slate-400 hover:bg-white/6 hover:text-slate-100",
                  )}
                >
                  <Percent className="size-4 shrink-0 opacity-80" aria-hidden />
                  Con descuento
                </button>
              </li>
            </ul>
          </div>
      </nav>
    ),
    [saleCategories, vistaCatalogo, persistVistaCatalogo],
  )

  if (!popId || !siteId) {
    return (
      <div className="min-h-screen bg-[#070a09] p-10 text-sm text-slate-300">
        Punto de venta no encontrado
      </div>
    )
  }

  return (
    <>
      <DataWorkspaceLayout
        siteId={siteId}
        popId={popId}
        popName={popName}
        title="Vender"
        headerVariant="dark"
        contentFlush
        loading={catalogLoading}
        userName={headerUserName}
        userAvatarSrc={userAvatarSrc}
        sidebarCollapsible
        sidebarEdgeToggle={false}
        sidebarOpen={catalogSidebarOpen}
        onSidebarOpenChange={setCatalogSidebarOpen}
        mainClassName="bg-[#070a09] text-white"
      >
        <div className="dark relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#070a09] text-white">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.14),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.1),transparent_36%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[38px_38px] opacity-20" />
          </div>

          {!catalogLoading && !openCashSession ? (
            <OpenCashSessionBanner siteId={siteId} popId={popId} variant="dark" />
          ) : null}

          <main className="relative z-10 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_380px] grid-rows-[minmax(0,1fr)_calc(4.5rem+1rem)] sm:grid-rows-[minmax(0,1fr)_calc(4.75rem+1.25rem)]">
            <div className="col-start-1 row-start-1 flex min-h-0 min-w-0 overflow-hidden">
              <aside
                id="data-workspace-sidebar"
                className={cn(
                  "relative shrink-0 overflow-hidden border-r border-white/10 bg-[#1a2027] transition-[width,border-color] duration-300 ease-in-out motion-reduce:transition-none",
                  catalogSidebarOpen ? "w-[280px]" : "w-0 border-r-0",
                )}
                aria-hidden={!catalogSidebarOpen}
                {...(!catalogSidebarOpen ? { inert: true } : {})}
                aria-label="Filtros del catálogo"
              >
                <div className="flex h-full w-[280px] min-w-[280px] flex-col">
                  {catalogSidebar}
                </div>
              </aside>

              <section className="grid min-h-0 min-w-0 flex-1 grid-rows-[auto_minmax(0,1fr)] bg-[#20262e]">
                <div className="flex min-w-0 items-center gap-3 border-b border-white/10 px-4 py-3">
                  <div className="relative flex h-10 shrink-0 items-center rounded-lg border border-white/12 bg-black/25 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(16,185,129,0.06)]">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-1 left-1 w-10 rounded-md border border-emerald-300/35 bg-linear-to-b from-emerald-300/22 via-emerald-400/16 to-emerald-500/12 shadow-[0_0_18px_rgba(16,185,129,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform duration-300 ease-out"
                      style={{
                        transform:
                          modoVista === "lista"
                            ? "translateX(2.5rem)"
                            : "translateX(0)",
                      }}
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-1 bottom-0 h-px bg-linear-to-r from-transparent via-emerald-300/55 to-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setModoVista("grid")}
                      className={cn(
                        "relative z-10 flex h-8 w-10 items-center justify-center rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-0",
                        modoVista === "grid"
                          ? "text-white drop-shadow-[0_0_10px_rgba(110,231,183,0.6)]"
                          : "text-slate-300/80 hover:text-white/95",
                      )}
                      aria-label="Vista en grilla"
                      aria-pressed={modoVista === "grid"}
                    >
                      <LayoutGrid className="size-4.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoVista("lista")}
                      className={cn(
                        "relative z-10 flex h-8 w-10 items-center justify-center rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-0",
                        modoVista === "lista"
                          ? "text-white drop-shadow-[0_0_10px_rgba(110,231,183,0.6)]"
                          : "text-slate-300/80 hover:text-white/95",
                      )}
                      aria-label="Vista en columna"
                      aria-pressed={modoVista === "lista"}
                    >
                      <Rows3 className="size-4.5" />
                    </button>
                  </div>
                  <div className="relative min-w-0 flex-1 max-w-md">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                    <Input
                      ref={busquedaProductosInputRef}
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Buscar o escanear producto..."
                      className={cn(
                        "h-10 border-white/10 bg-black/20 pl-9 text-white placeholder:text-white/35",
                        busqueda.length > 0 && "pr-9",
                      )}
                    />
                    {busqueda.length > 0 ? (
                      <button
                        type="button"
                        aria-label="Limpiar búsqueda"
                        className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-white/50 transition-[color,background-color] duration-150 hover:bg-white/[0.07] hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-0 active:bg-white/11"
                        onClick={() => {
                          setBusqueda("")
                          busquedaProductosInputRef.current?.focus()
                        }}
                      >
                        <IconoLimpiarBusqueda />
                      </button>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-sm font-medium text-white/60">
                    {productosFiltrados.length} productos mostrados
                  </span>
                </div>

                <div
                  className={cn(
                    "min-h-0",
                    catalogLoading && !catalogError
                      ? "flex flex-1 flex-col p-6"
                      : catalogError
                        ? "flex flex-1 flex-col p-6"
                        : productosFiltrados.length === 0
                          ? "relative overflow-hidden p-0"
                          : "game-scroll overflow-y-auto p-3",
                  )}
                >
                  {catalogLoading && !catalogError ? (
                    <div className="flex min-h-[200px] flex-1 items-center justify-center">
                      <p className="text-sm text-slate-400">
                        Cargando productos…
                      </p>
                    </div>
                  ) : catalogError ? (
                    <div className="flex min-h-[200px] flex-1 flex-col items-center justify-center gap-2 text-center">
                      <p className="max-w-md text-sm text-rose-300">
                        {catalogError}
                      </p>
                    </div>
                  ) : productosFiltrados.length === 0 ? (
                    <div
                      aria-live="polite"
                      className="rootsy-hero-slide-in-right pointer-events-none absolute right-[-50px] bottom-[-25px] z-10"
                    >
                      <Image
                        src="/empty-products-mascot.png"
                        alt=""
                        width={260}
                        height={260}
                        className="h-auto w-full max-w-[260px] object-contain opacity-95"
                      />
                    </div>
                  ) : (
                    <div
                      className={
                        modoVista === "grid"
                          ? "grid grid-cols-3 gap-3"
                          : "flex flex-col gap-2"
                      }
                    >
                      {productosFiltrados.map((p) => {
                        const descuentoPct = saleCatalogDiscountPercent(
                          p.precioOriginal,
                          p.precio,
                        )
                        const promoTrim = p.promo?.trim() ?? ""
                        const mostrarBadgeOferta =
                          descuentoPct != null || promoTrim.length > 0

                        return (
                        <button
                          key={`${p.kind}:${p.id}`}
                          type="button"
                          onClick={() => agregarAlCarrito(p.id, p.kind)}
                          className={cn(
                            "group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#252b34] text-left",
                            "shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_0_1px_rgba(0,0,0,0.45),0_1px_2px_rgba(0,0,0,0.22),0_6px_16px_rgba(0,0,0,0.28),0_16px_40px_rgba(0,0,0,0.38)]",
                            "before:pointer-events-none before:absolute before:inset-y-4 before:left-0 before:z-10 before:w-0.5 before:rounded-full before:bg-emerald-400 before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-90",
                            modoVista === "lista"
                              ? "flex min-h-[152px] items-stretch"
                              : "grid h-[318px] grid-rows-[152px_1fr]",
                          )}
                        >
                          <div
                            className={cn(
                              "relative overflow-hidden bg-[#0f1416]",
                              modoVista === "grid"
                                ? "h-full w-full"
                                : "h-[152px] w-48 shrink-0",
                            )}
                          >
                            <Image
                              src={p.imagen}
                              alt={p.nombre}
                              fill
                              className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                              unoptimized
                              sizes={modoVista === "grid" ? "33vw" : "280px"}
                              style={{
                                objectFit: "cover",
                                objectPosition: "center",
                              }}
                            />
                            {mostrarBadgeOferta ? (
                              <SaleCatalogProductOfferOverlay
                                precioOriginal={p.precioOriginal}
                                precio={p.precio}
                                promo={p.promo}
                              />
                            ) : null}
                            <span
                              className="pointer-events-none absolute right-2 bottom-2 z-20 flex size-9 items-center justify-center rounded-full border border-emerald-300/45 bg-emerald-500 text-emerald-950 opacity-0 shadow-[0_4px_20px_rgba(16,185,129,0.5)] transition-[opacity,transform] duration-200 translate-y-1 scale-95 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100"
                              aria-hidden
                            >
                              <Plus className="size-4.5" strokeWidth={2.5} aria-hidden />
                            </span>
                          </div>
                          <div
                            className={
                              modoVista === "grid"
                                ? "grid h-full min-h-0 gap-2 p-5 grid-rows-[minmax(0,1fr)_auto]"
                                : "flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-2 p-5"
                            }
                          >
                            <div className="min-h-0 self-start">
                              <h3 className="line-clamp-2 text-lg font-bold leading-tight text-foreground">
                                {p.nombre}
                              </h3>
                              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                                {p.descripcion}
                              </p>
                            </div>

                            <div
                              className={
                                modoVista === "grid" ? "self-end" : "shrink-0"
                              }
                            >
                              <span className={ventaImporteCardClass}>
                                {fmt.format(p.precio)}
                              </span>
                            </div>
                          </div>
                        </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div
              role="toolbar"
              aria-label="Configuración de la venta"
              className={cn(
                "col-start-1 row-start-2 grid h-full min-h-0 grid-cols-2 gap-2 lg:grid-cols-4",
                toolboxBarClass,
                ventaFooterBarPaddingClass,
                ventaFooterBandHeightClass,
              )}
            >
              <button
                type="button"
                disabled={!canReadClients}
                onClick={onClienteToolbarClick}
                className={cn(
                  toolboxSlotClass(Boolean(clienteSeleccionado)),
                  !canReadClients && "opacity-45",
                )}
                aria-label={
                  !canReadClients
                    ? "No tenés permiso para ver clientes. Pedí acceso de lectura en tu rol."
                    : clienteSeleccionado
                      ? `Cliente: ${clienteSeleccionado.name}. Abrir para cambiar.`
                      : "Cliente sin elegir. Abrir para seleccionar."
                }
              >
                <span className={toolboxIconWrap(Boolean(clienteSeleccionado))}>
                  <User className="size-4.5 sm:size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45">
                    Cliente
                  </span>
                  <span
                    className={cn(
                      "block truncate text-sm font-semibold leading-snug",
                      clienteSeleccionado
                        ? "text-foreground"
                        : "text-foreground/55",
                    )}
                  >
                    {!canReadClients
                      ? "Sin permiso"
                      : (clienteSeleccionado?.name ?? "Elegir cliente")}
                  </span>
                  {ventaIvaLabel ? (
                    <span className="mt-0.5 block truncate text-[11px] font-medium text-muted-foreground">
                      {ventaIvaLabel}
                    </span>
                  ) : null}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setComprobanteModalAbierto(true)}
                className={toolboxSlotClass(comprobante !== null)}
                aria-label={`Comprobante: ${comprobanteDisplayLabel}. Abrir para cambiar.`}
              >
                <span className={toolboxIconWrap(comprobante !== null)}>
                  <Receipt className="size-4.5 sm:size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45">
                    Comprobante
                  </span>
                  <span
                    className={cn(
                      "block truncate text-sm font-semibold leading-snug",
                      comprobante !== null
                        ? "text-foreground"
                        : "text-foreground/70",
                    )}
                  >
                    {comprobanteDisplayLabel}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!openCashSession) return
                  setPagoModalAbierto(true)
                }}
                disabled={!openCashSession}
                className={toolboxSlotClass(pagoConfigurado)}
                aria-label={
                  pagoConfigurado
                    ? `Pago: ${pagoResumenLabel}. Abrir para cambiar.`
                    : "Forma de pago sin elegir. Abrir para seleccionar."
                }
              >
                <span className={toolboxIconWrap(pagoConfigurado)}>
                  <Banknote className="size-4.5 sm:size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45">
                    Pago
                  </span>
                  <span
                    className={cn(
                      "block truncate text-sm font-semibold leading-snug",
                      pagoConfigurado
                        ? "text-foreground"
                        : "text-foreground/55",
                    )}
                  >
                    {openCashSession
                      ? pagoResumenLabel
                      : "Requiere caja abierta"}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={abrirModalDescuento}
                className={toolboxSlotClass(hayDescuento)}
                aria-label={
                  hayDescuento
                    ? `Descuento aplicado: ${
                        modoDescuento === "porcentaje"
                          ? `${valorDescuentoPorcentaje} por ciento`
                          : `${fmt.format(valorDescuentoFijo)} fijo`
                      }. Abrir para editar.`
                    : "Sin descuento en la venta. Abrir para configurar."
                }
              >
                <span className={toolboxIconWrap(hayDescuento)}>
                  <Percent className="size-4.5 sm:size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45">
                    Descuento
                  </span>
                  <span
                    className={cn(
                      "block truncate text-sm font-semibold leading-snug",
                      hayDescuento
                        ? cn("text-foreground", ventaImporteBaseClass)
                        : "text-foreground/55",
                    )}
                  >
                    {hayDescuento
                      ? modoDescuento === "porcentaje"
                        ? `${valorDescuentoPorcentaje}%`
                        : `Fijo ${fmt.format(valorDescuentoFijo)}`
                      : "Sin descuento"}
                  </span>
                </span>
              </button>
            </div>

          <aside
            className="rootsy-app-light col-start-2 row-span-2 grid min-h-0 overflow-hidden grid-rows-[minmax(0,1fr)] bg-[#eef1f5] text-[#121417]"
            aria-label="Carrito de la venta"
          >
            <SaleOperationTicketOrderPanel
              cartDisplayRows={cartDisplayRows}
              cartLineOverrides={cartLineOverrides}
              aplicarEdicionLineaTicket={aplicarEdicionLineaTicket}
              cambiarCantidadPorLinea={cambiarCantidadPorLinea}
              quitarQuantityDealApplication={quitarQuantityDealApplication}
              listTitle="Tu pedido"
              emptyTitle="Pedido vacío"
              emptyDescription="Agregá productos desde el catálogo."
              actions={{
                discardDisabled: !hayContenidoVenta,
                confirmDisabled: !puedeRegistrarVenta || ventaSubmitting,
                confirmLoading: ventaSubmitting,
                onDiscard: () => setDescartarConfirmOpen(true),
                onConfirm: () => {
                  setVentaError(null)
                  setVenderConfirmOpen(true)
                },
                confirmLabel: "Vender",
                confirmTitle: !hayItemsEnPedido
                  ? "Agregá productos al pedido."
                  : !pagoConfigurado
                    ? "Elegí una forma de pago o usá cuenta corriente del cliente."
                    : payOnClientAccount && !clienteSeleccionado?.id
                      ? "Elegí un cliente del catálogo para vender a cuenta corriente."
                      : !canCreateSale
                        ? "No tenés permiso para registrar ventas."
                        : !canReadCashRegisters
                          ? "Se requiere permiso para ver cajas y asociar la venta a una sesión."
                          : !openCashSession
                            ? "Abrí una sesión de caja en Cajas antes de vender."
                            : undefined,
              }}
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
              }}
            />
          </aside>
        </main>
        </div>
      </DataWorkspaceLayout>

      <PromotionComboWizard
        open={promoWizardOpen}
        promotion={promoWizardTarget}
        onOpenChange={setPromoWizardOpen}
        onConfirm={(selections) => {
          if (promoWizardTarget) {
            confirmarPromoWizard(promoWizardTarget.id, selections)
          }
          setPromoWizardOpen(false)
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
            setVentaIvaCondition(clienteSeleccionado.ivaCondition ?? "")
          }
        }}
        canSearchCatalog={canReadClients}
        manualName={manualNombreCliente}
        onManualNameChange={setManualNombreCliente}
        taxId={fiscalDocVenta}
        onTaxIdChange={setFiscalDocVenta}
        ivaCondition={ventaIvaCondition}
        onIvaConditionChange={setVentaIvaCondition}
        selected={clienteSeleccionado}
        padron={ventaPadron}
        catalogBlocked={clienteCatalogoBloqueado}
        onSelectCatalogParty={(party) =>
          seleccionarCliente({
            id: party.id,
            name: party.name,
            taxId: party.taxId ?? null,
            ivaCondition: party.ivaCondition ?? null,
            defaultInvoiceTypeLabel: party.defaultInvoiceTypeLabel ?? null,
          })
        }
        onSelectManual={seleccionarClienteManual}
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
      />

      <SalePaymentMethodDialog
        open={pagoModalAbierto}
        onOpenChange={setPagoModalAbierto}
        treasuryContext={treasuryPaymentContext}
        cashTreasuryAccountId={openCashSession?.cashTreasuryAccountId ?? null}
        cashRegisterName={openCashSession?.registerName ?? null}
        selected={metodoPagoSeleccionado}
        payOnClientAccount={payOnClientAccount}
        onSelectImmediate={(option) => {
          setPayOnClientAccount(false)
          setMetodoPagoSeleccionado(option)
        }}
        onSelectClientAccount={() => {
          setPayOnClientAccount(true)
          setMetodoPagoSeleccionado(null)
        }}
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
        <AlertDialogContent className={ventaAlertDialogContent}>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Descartar la venta?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Se quitarán los productos del pedido, el cliente, el tipo de comprobante, los
              descuentos y los comentarios de línea. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={limpiarVenta}
              className="border-0 bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
            >
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={venderConfirmOpen}
        onOpenChange={(open) => {
          setVenderConfirmOpen(open)
          if (!open) setVentaError(null)
        }}
      >
        <AlertDialogContent className={ventaAlertDialogContent}>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar venta?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  {payOnClientAccount ? "Total a cuenta:" : "Total a cobrar:"}{" "}
                  <span
                    className={cn(
                      ventaImporteBaseClass,
                      "font-semibold text-foreground",
                    )}
                  >
                    {fmt.format(total)}
                  </span>
                  . Forma de pago:{" "}
                  <span className="font-medium text-foreground">
                    {pagoResumenLabel}
                  </span>
                  . Se guardará la venta, el movimiento de stock (FIFO) y el
                  asiento contable
                  {payOnClientAccount
                    ? " (cuentas por cobrar, ventas, IVA si aplica y costo de mercaderías)."
                    : " (cobro, ventas, IVA si aplica y costo de mercaderías)."}
                </p>
                {ventaError ? (
                  <p className="text-sm text-rose-600">{ventaError}</p>
                ) : null}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border" disabled={ventaSubmitting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              disabled={ventaSubmitting}
              onClick={(e) => {
                e.preventDefault()
                void confirmarVenta()
              }}
              className="border-0 bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              {ventaSubmitting ? "Guardando…" : "Confirmar venta"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default withAuth(SalePage)
