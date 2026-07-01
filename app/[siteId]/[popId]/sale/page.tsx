"use client"

import withAuth from "@/hoc/withAuth"
import Image from "next/image"
import { completeSale } from "@/app/[siteId]/[popId]/sale/completeSale"
import {
  getSaleCatalog,
  type SaleCatalogArticle,
  type SaleCatalogCategory,
  type SaleCatalogClient,
  type SaleCatalogPaymentMethod,
  type SaleOpenCashSession,
} from "@/app/[siteId]/[popId]/sale/actions"
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
import { SaleOperationCartItem } from "@/components/sale-operation/SaleOperationCartItem"
import { SaleOperationCartList } from "@/components/sale-operation/SaleOperationCartList"
import { SaleOperationTotalBar } from "@/components/sale-operation/SaleOperationTotalBar"
import {
  SaleCatalogProductOfferOverlay,
  saleCatalogDiscountPercent,
} from "@/components/sale-operation/SaleCatalogProductOfferOverlay"
import {
  catalogCartOrderTotals,
  catalogCartLinePricing,
} from "@/components/sale-operation/saleCatalogProduct"
import { saleOpImporteBaseClass } from "@/components/sale-operation/saleOperationStyles"

type Producto = {
  id: string
  nombre: string
  descripcion: string
  precio: number
  precioOriginal?: number
  categoria: string
  imagen: string
  promo?: string
}

type ItemCarrito = {
  productoId: string
  cantidad: number
}

type ClienteVentaSeleccionado = {
  id: string | null
  manual: boolean
  name: string
  taxId: string | null
  ivaCondition: string | null
  defaultInvoiceTypeLabel: string | null
}

const MANUAL_PARTY_LIST_ID = "__manual__"

type VistaCatalogo = SaleCatalogViewPersisted

const CATEGORIA_TODOS = "Todos"

function articleToProducto(a: SaleCatalogArticle): Producto {
  return {
    id: a.id,
    nombre: a.name,
    descripcion: a.description.trim() ? a.description : "—",
    precio: a.salePrice,
    precioOriginal: a.originalSalePrice,
    categoria: a.categoryName.trim() ? a.categoryName : "—",
    imagen: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(a.id)}&backgroundColor=1a1f1d`,
  }
}

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
  const [saleClients, setSaleClients] = useState<SaleCatalogClient[]>([])
  const [salePaymentMethods, setSalePaymentMethods] = useState<
    SaleCatalogPaymentMethod[]
  >([])
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
      setSaleClients([])
      setSalePaymentMethods([])
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
    setSaleClients(res.clients)
    setSalePaymentMethods(res.paymentMethods)
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

  useEffect(() => {
    if (!canReadPaymentMethods || salePaymentMethods.length === 0) return
    setMetodoPagoSeleccionado((prev) => {
      if (prev && salePaymentMethods.some((m) => m.id === prev.id)) {
        return prev
      }
      const efectivo = salePaymentMethods.find((m) => m.kind === "cash")
      return efectivo ? { id: efectivo.id, label: efectivo.name } : null
    })
  }, [canReadPaymentMethods, salePaymentMethods])

  const productosCatalogo = useMemo(
    () => catalogArticles.map(articleToProducto),
    [catalogArticles],
  )

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
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
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
  const [busquedaClienteModal, setBusquedaClienteModal] = useState("")
  const [comprobante, setComprobante] = useState<string | null>(null)
  const [comprobanteModalAbierto, setComprobanteModalAbierto] = useState(false)
  const comprobanteInitRef = useRef(false)
  const catalogViewInitRef = useRef(false)
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<{
    id: string
    label: string
  } | null>(null)
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
  const [descuentoDraftTexto, setDescuentoDraftTexto] = useState("")
  const [itemDetalleAbiertoId, setItemDetalleAbiertoId] = useState<string | null>(
    null,
  )
  const [itemComentarios, setItemComentarios] = useState<Record<string, string>>({})
  const [itemDescuentoModo, setItemDescuentoModo] = useState<
    Record<string, "porcentaje" | "fijo">
  >({})
  const [itemDescuentoDraft, setItemDescuentoDraft] = useState<
    Record<string, string>
  >({})
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
          ? vistaCatalogo.categoria === CATEGORIA_TODOS ||
            p.categoria === vistaCatalogo.categoria
          : vistaCatalogo.modo === "promociones"
            ? Boolean(p.promo?.trim())
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

  const itemsDetallados = useMemo(() => {
    return carrito
      .map((i) => ({
        ...i,
        producto: productosCatalogo.find((p) => p.id === i.productoId),
      }))
      .filter((i) => i.producto)
  }, [carrito, productosCatalogo])

  const subtotalBruto = useMemo(
    () =>
      itemsDetallados.reduce(
        (acc, i) => acc + (i.producto?.precio ?? 0) * i.cantidad,
        0,
      ),
    [itemsDetallados],
  )

  const catalogTotals = useMemo(
    () => catalogCartOrderTotals(itemsDetallados),
    [itemsDetallados],
  )

  const itemDescuentoMontos = useMemo(() => {
    const descuentos: Record<string, number> = {}
    itemsDetallados.forEach((item) => {
      const itemId = item.productoId
      const precioBase = (item.producto?.precio ?? 0) * item.cantidad
      const raw = (itemDescuentoDraft[itemId] ?? "").trim().replace(",", ".")
      const n = Number.parseFloat(raw)
      if (!Number.isFinite(n) || n <= 0) {
        descuentos[itemId] = 0
        return
      }
      const modo = itemDescuentoModo[itemId] ?? "porcentaje"
      descuentos[itemId] =
        modo === "porcentaje"
          ? precioBase * (Math.min(100, Math.max(0, n)) / 100)
          : Math.min(Math.max(0, n), precioBase)
    })
    return descuentos
  }, [itemsDetallados, itemDescuentoDraft, itemDescuentoModo])

  const descuentoItemsMonto = useMemo(
    () => Object.values(itemDescuentoMontos).reduce((acc, n) => acc + n, 0),
    [itemDescuentoMontos],
  )

  const subtotal = subtotalBruto - descuentoItemsMonto

  const descuentoMonto = useMemo(() => {
    if (modoDescuento === "porcentaje") {
      return subtotal * (valorDescuentoPorcentaje / 100)
    }
    return Math.min(valorDescuentoFijo, subtotal)
  }, [modoDescuento, subtotal, valorDescuentoPorcentaje, valorDescuentoFijo])

  const total = subtotal - descuentoMonto

  const hayDescuento = descuentoMonto > 0
  const hayDescuentoCatalogo = catalogTotals.hayDescuentoCatalogo

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
      metodoPagoSeleccionado?.id,
      canCreateSale,
      canReadCashRegisters,
      openCashSession,
    ],
  )

  const limpiarVenta = useCallback(() => {
    setCarrito([])
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
    setItemDetalleAbiertoId(null)
    setItemComentarios({})
    setItemDescuentoModo({})
    setItemDescuentoDraft({})
    setMetodoPagoSeleccionado(() => {
      const efectivo = salePaymentMethods.find((m) => m.kind === "cash")
      return efectivo ? { id: efectivo.id, label: efectivo.name } : null
    })
    setPayOnClientAccount(false)
    setDescartarConfirmOpen(false)
    setVenderConfirmOpen(false)
    setVentaError(null)
  }, [salePaymentMethods, popId])

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
        lines: carrito.map((i) => ({
          articleId: i.productoId,
          quantity: i.cantidad,
          itemDiscountMode: itemDescuentoModo[i.productoId] ?? "porcentaje",
          itemDiscountDraft: itemDescuentoDraft[i.productoId] ?? "",
          comment: itemComentarios[i.productoId],
        })),
        clientId: catalogClientId,
        payOnClientAccount,
        paymentMethodId: payOnClientAccount
          ? null
          : metodoPagoSeleccionado?.id,
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
    itemDescuentoModo,
    itemDescuentoDraft,
    itemComentarios,
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

  useEffect(() => {
    if (clienteSeleccionado && !clienteSeleccionado.manual) return
    if (!fiscalDocVenta.trim()) return
    if (!ventaPadron.mappedIvaCondition) return
    setVentaIvaCondition(ventaPadron.mappedIvaCondition)
    aplicarComprobanteDesdeIva(ventaPadron.mappedIvaCondition)
  }, [
    fiscalDocVenta,
    ventaPadron.mappedIvaCondition,
    aplicarComprobanteDesdeIva,
    clienteSeleccionado,
  ])

  useEffect(() => {
    if (clienteSeleccionado && !clienteSeleccionado.manual) return
    if (!ventaPadron.razonSocial.trim()) return
    if (manualNombreCliente.trim()) return
    setManualNombreCliente(ventaPadron.razonSocial.trim())
  }, [
    ventaPadron.razonSocial,
    manualNombreCliente,
    clienteSeleccionado,
  ])

  const ventaIvaLabel = useMemo(
    () =>
      labelCondicionIva(
        clienteSeleccionado?.ivaCondition ?? ventaIvaCondition,
      ),
    [ventaIvaCondition, clienteSeleccionado?.ivaCondition],
  )

  const clientesFiltradosModal = useMemo(() => {
    const q = normalizarBusqueda(busquedaClienteModal.trim())

    if (clienteSeleccionado && !q) {
      if (clienteSeleccionado.manual) {
        return [
          {
            id: MANUAL_PARTY_LIST_ID,
            name: clienteSeleccionado.name,
            taxId: clienteSeleccionado.taxId,
            ivaCondition: clienteSeleccionado.ivaCondition,
            defaultInvoiceTypeLabel: null,
          },
        ]
      }
      const fromCatalog = saleClients.find((c) => c.id === clienteSeleccionado.id)
      if (fromCatalog) return [fromCatalog]
      if (clienteSeleccionado.id) {
        return [
          {
            id: clienteSeleccionado.id,
            name: clienteSeleccionado.name,
            taxId: clienteSeleccionado.taxId,
            ivaCondition: clienteSeleccionado.ivaCondition,
            defaultInvoiceTypeLabel: clienteSeleccionado.defaultInvoiceTypeLabel,
          },
        ]
      }
      return []
    }

    if (!q) return []

    return saleClients.filter((c) => normalizarBusqueda(c.name).includes(q))
  }, [busquedaClienteModal, saleClients, clienteSeleccionado])

  const clienteCatalogoBloqueado =
    clienteSeleccionado != null && !clienteSeleccionado.manual

  const puedeUsarClienteManual = useMemo(() => {
    if (clienteSeleccionado) return false
    return Boolean(
      manualNombreCliente.trim() ||
        fiscalDocVenta.trim() ||
        ventaPadron.razonSocial.trim(),
    )
  }, [
    clienteSeleccionado,
    manualNombreCliente,
    fiscalDocVenta,
    ventaPadron.razonSocial,
  ])

  const busquedaClienteModalTrim = busquedaClienteModal.trim()

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

  const paymentMethodGroups = useMemo(() => {
    const order = [
      "cash",
      "card_debit",
      "card_credit",
      "transfer",
      "other",
    ] as const
    const sectionLabel: Record<(typeof order)[number], string> = {
      cash: "Efectivo",
      card_debit: "Débito",
      card_credit: "Crédito",
      transfer: "Transferencia",
      other: "Otros",
    }
    const buckets: Record<string, SaleCatalogPaymentMethod[]> = {}
    for (const k of order) buckets[k] = []
    for (const m of salePaymentMethods) {
      const k = order.includes(m.kind as (typeof order)[number])
        ? (m.kind as (typeof order)[number])
        : "other"
      buckets[k].push(m)
    }
    return order
      .filter((k) => buckets[k].length > 0)
      .map((kind) => ({
        kind,
        title: sectionLabel[kind],
        items: buckets[kind],
      }))
  }, [salePaymentMethods])

  const paymentMethodListItems = useMemo(
    () =>
      paymentMethodGroups.flatMap((g) =>
        g.items.map((method) => ({
          method,
          groupTitle: g.title,
        })),
      ),
    [paymentMethodGroups],
  )

  const agregarAlCarrito = (productoId: string) => {
    setCarrito((prev) => {
      const existe = prev.find((i) => i.productoId === productoId)
      if (existe) {
        return prev.map((i) =>
          i.productoId === productoId ? { ...i, cantidad: i.cantidad + 1 } : i,
        )
      }
      return [...prev, { productoId, cantidad: 1 }]
    })
  }

  const cambiarCantidad = (productoId: string, delta: number) => {
    setCarrito((prev) =>
      prev
        .map((i) =>
          i.productoId === productoId
            ? { ...i, cantidad: Math.max(1, i.cantidad + delta) }
            : i,
        )
        .filter((i) => i.cantidad > 0),
    )
  }

  const quitarDelCarrito = (productoId: string) => {
    setCarrito((prev) => prev.filter((i) => i.productoId !== productoId))
  }

  const onClienteToolbarClick = () => {
    if (!canReadClients) return
    setBusquedaClienteModal("")
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

  const toggleItemDetalle = (itemId: string) => {
    setItemDetalleAbiertoId((prev) => (prev === itemId ? null : itemId))
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
        userRoleLabel="Ventas"
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
                          key={p.id}
                          type="button"
                          onClick={() => agregarAlCarrito(p.id)}
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
                onClick={() => setPagoModalAbierto(true)}
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
                    {pagoResumenLabel}
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
            className="col-start-2 row-span-2 grid min-h-0 grid-rows-[minmax(0,1fr)_auto] bg-[#eef1f5] text-[#121417]"
            aria-label="Carrito de la venta"
          >
            <div className="flex min-h-0 flex-col">
              <SaleOperationCartList
                title="Tu pedido"
                lineCount={itemsDetallados.length}
              >
                {itemsDetallados.map((item) => {
                  const itemId = item.productoId
                  const abierto = itemDetalleAbiertoId === itemId
                  const comentario = itemComentarios[itemId] ?? ""
                  const descuento = itemDescuentoMontos[itemId] ?? 0
                  const modoItemDescuento = itemDescuentoModo[itemId] ?? "porcentaje"
                  const descuentoRaw = itemDescuentoDraft[itemId] ?? ""
                  const descuentoNumero = Number.parseFloat(
                    descuentoRaw.trim().replace(",", "."),
                  )
                  const catalogPricing = catalogCartLinePricing(
                    item.producto,
                    item.cantidad,
                  )
                  const descuentoManual = descuento
                  const precioVentaTotal = catalogPricing.precioFinal
                  const tieneDescuentoManual = descuentoManual > 0
                  const tieneDescuento =
                    catalogPricing.tieneDescuentoCatalogo || tieneDescuentoManual
                  const precioBaseItem = catalogPricing.tieneDescuentoCatalogo
                    ? catalogPricing.precioBase
                    : precioVentaTotal
                  const precioFinalItem = precioVentaTotal - descuentoManual
                  const tieneComentario = comentario.trim().length > 0
                  const nombreProducto = item.producto?.nombre ?? "Producto"

                  return (
                    <SaleOperationCartItem
                      key={itemId}
                      itemId={itemId}
                      nombre={nombreProducto}
                      descripcion={item.producto?.descripcion}
                      cantidad={item.cantidad}
                      precioUnitario={catalogPricing.precioUnitario}
                      precioBase={precioBaseItem}
                      precioFinal={precioFinalItem}
                      expandable
                      expanded={abierto}
                      onToggleExpand={() => toggleItemDetalle(itemId)}
                      onQuantityDecrease={() => cambiarCantidad(itemId, -1)}
                      onQuantityIncrease={() => cambiarCantidad(itemId, 1)}
                      onRemove={() => quitarDelCarrito(itemId)}
                      tieneComentario={tieneComentario}
                      tieneDescuento={tieneDescuento}
                      descuentoLabel={
                        tieneDescuentoManual
                          ? modoItemDescuento === "porcentaje"
                            ? `${Math.min(100, Math.max(0, Number.isFinite(descuentoNumero) ? descuentoNumero : 0))}%`
                            : fmt.format(descuentoManual)
                          : catalogPricing.descuentoCatalogoLabel
                      }
                      expandedContent={
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-400/50 bg-slate-100 text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50"
                            aria-label="Cambiar tipo de descuento"
                            onClick={(e) => {
                              e.stopPropagation()
                              setItemDescuentoModo((prev) => ({
                                ...prev,
                                [itemId]:
                                  (prev[itemId] ?? "porcentaje") === "porcentaje"
                                    ? "fijo"
                                    : "porcentaje",
                              }))
                            }}
                          >
                            {modoItemDescuento === "porcentaje" ? (
                              <Percent className="size-3.5" aria-hidden />
                            ) : (
                              <Banknote className="size-3.5" aria-hidden />
                            )}
                          </button>
                          <Input
                            value={itemDescuentoDraft[itemId] ?? ""}
                            onChange={(e) => {
                              const raw = e.target.value
                              if (!/^\d*$/.test(raw)) return
                              if (raw === "") {
                                setItemDescuentoDraft((prev) => ({
                                  ...prev,
                                  [itemId]: "",
                                }))
                                return
                              }
                              if (
                                modoItemDescuento === "fijo" &&
                                Number(raw) > precioBaseItem
                              ) {
                                setItemDescuentoModo((prev) => ({
                                  ...prev,
                                  [itemId]: "porcentaje",
                                }))
                                setItemDescuentoDraft((prev) => ({
                                  ...prev,
                                  [itemId]: "100",
                                }))
                                return
                              }
                              const nextValue =
                                modoItemDescuento === "porcentaje"
                                  ? String(Math.min(100, Number(raw)))
                                  : raw
                              setItemDescuentoDraft((prev) => ({
                                ...prev,
                                [itemId]: nextValue,
                              }))
                            }}
                            placeholder="descuento"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="h-8 w-26 border border-slate-300 bg-white! text-[#121417] shadow-none text-xs placeholder:text-slate-500"
                          />
                          <div className="relative min-w-0 flex-1">
                            <MessageSquare className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-500" />
                            <Input
                              value={comentario}
                              onChange={(e) =>
                                setItemComentarios((prev) => ({
                                  ...prev,
                                  [itemId]: e.target.value,
                                }))
                              }
                              placeholder="agregá un comentario..."
                              className="h-8 border border-slate-300 bg-white! pl-8 text-[#121417] text-xs shadow-none placeholder:text-slate-500"
                            />
                          </div>
                        </div>
                      }
                    />
                  )
                })}
              </SaleOperationCartList>
            </div>

            <div className="flex min-h-0 flex-col">
              <div className="bg-[#f8fafc] p-3 text-[#121417]">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!hayContenidoVenta}
                    onClick={() => setDescartarConfirmOpen(true)}
                    className="h-11 gap-2 border-rose-200/90 bg-white font-medium text-rose-700 shadow-none hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800 focus-visible:ring-2 focus-visible:ring-rose-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <CircleX className="size-4 shrink-0" aria-hidden />
                    Descartar
                  </Button>
                  <Button
                    type="button"
                    disabled={!puedeRegistrarVenta || ventaSubmitting}
                    onClick={() => {
                      setVentaError(null)
                      setVenderConfirmOpen(true)
                    }}
                    title={
                      !hayItemsEnPedido
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
                                  : undefined
                    }
                    className="h-11 gap-2 border-0 bg-emerald-600 font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:bg-emerald-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] active:bg-emerald-700 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <CircleCheck className="size-4 shrink-0 opacity-95" aria-hidden />
                    Vender
                  </Button>
                </div>
              </div>

              <SaleOperationTotalBar
                total={total}
                subtotal={subtotal}
                descuentoMonto={descuentoMonto}
                hayDescuento={hayDescuento}
                subtotalOriginal={catalogTotals.subtotalOriginal}
                descuentoCatalogoMonto={catalogTotals.descuentoCatalogoMonto}
                hayDescuentoCatalogo={hayDescuentoCatalogo}
              />
            </div>
          </aside>
        </main>
        </div>
      </DataWorkspaceLayout>

      <Dialog
        open={clienteModalAbierto}
        onOpenChange={(open) => {
          setClienteModalAbierto(open)
          if (open) {
            setBusquedaClienteModal("")
            if (clienteSeleccionado?.manual) {
              setManualNombreCliente(clienteSeleccionado.name)
              setFiscalDocVenta(clienteSeleccionado.taxId ?? "")
              setVentaIvaCondition(clienteSeleccionado.ivaCondition ?? "")
            }
          }
        }}
      >
        <DialogContent className={ventaDialogContentMd}>
          <DialogHeader className={ventaDialogHeader}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Cliente para esta venta
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {clienteSeleccionado
                ? clienteSeleccionado.manual
                  ? "Cliente cargado manualmente para esta venta (no se guarda en el catálogo). Quitá la selección para cambiar los datos."
                  : "Cliente asignado a esta venta. Los datos fiscales vienen del cliente; quitá la selección para cargar CUIT/DNI manualmente."
                : "Buscá en el catálogo o cargá los datos manualmente y usalos solo para esta venta."}
            </DialogDescription>
          </DialogHeader>
          <div className={ventaDialogBody}>
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={busquedaClienteInputRef}
                value={busquedaClienteModal}
                onChange={(e) => setBusquedaClienteModal(e.target.value)}
                placeholder="Nombre del cliente…"
                disabled={clienteCatalogoBloqueado}
                className={cn(
                  "h-11 rounded-lg pl-9",
                  busquedaClienteModal.length > 0 && "pr-9",
                )}
                autoComplete="off"
              />
              {busquedaClienteModal.length > 0 && !clienteCatalogoBloqueado ? (
                <button
                  type="button"
                  aria-label="Limpiar búsqueda"
                  className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-[color,background-color] duration-150 hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:bg-muted"
                  onClick={() => {
                    setBusquedaClienteModal("")
                    busquedaClienteInputRef.current?.focus()
                  }}
                >
                  <IconoLimpiarBusqueda />
                </button>
              ) : null}
            </div>
            <div
              className={cn(
                "mb-3 rounded-xl border border-border/50 bg-muted/15 p-3",
                clienteCatalogoBloqueado && "opacity-60",
              )}
            >
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Datos para esta venta
              </p>
              <Input
                value={manualNombreCliente}
                onChange={(e) => setManualNombreCliente(e.target.value)}
                placeholder="Nombre o razón social"
                className="mb-2 h-10 rounded-lg"
                autoComplete="off"
                disabled={clienteSeleccionado != null}
                readOnly={clienteSeleccionado != null}
              />
              <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                CUIT / DNI (padrón AFIP)
              </p>
              <Input
                value={fiscalDocVenta}
                onChange={(e) => setFiscalDocVenta(e.target.value)}
                placeholder="Ej. 20-12345678-9 o DNI"
                className="h-10 rounded-lg"
                autoComplete="off"
                disabled={clienteSeleccionado != null}
                readOnly={clienteSeleccionado != null}
              />
              <div className="mt-2 flex min-h-6 items-center gap-2 text-sm">
                {clienteSeleccionado ? (
                  <span className="font-medium text-foreground">
                    {clienteSeleccionado.name}
                  </span>
                ) : ventaPadron.busy ? (
                  <>
                    <Loader2
                      className="size-4 shrink-0 animate-spin text-primary"
                      aria-hidden
                    />
                    <span className="text-muted-foreground">Consultando…</span>
                  </>
                ) : ventaPadron.error ? (
                  <span className="text-destructive">{ventaPadron.error}</span>
                ) : ventaPadron.razonSocial && !manualNombreCliente.trim() ? (
                  <span className="text-muted-foreground">
                    Padrón:{" "}
                    <span className="font-medium text-foreground">
                      {ventaPadron.razonSocial}
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    La razón social del padrón se completa al validar el CUIT.
                  </span>
                )}
              </div>
              {clienteSeleccionado?.ivaCondition ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {labelCondicionIva(clienteSeleccionado.ivaCondition)}
                </p>
              ) : ventaPadron.condicionIvaNombre &&
                !ventaPadron.busy &&
                !ventaPadron.error ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  AFIP: {ventaPadron.condicionIvaNombre}
                </p>
              ) : null}
            </div>
            <div
              className={cn(
                "mb-3 space-y-2",
                clienteSeleccionado != null && "opacity-60",
              )}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Condición IVA (esta venta)
              </p>
              <Select
                value={ventaIvaCondition || "__none__"}
                disabled={clienteSeleccionado != null}
                onValueChange={(v) => {
                  const next = v === "__none__" ? "" : v
                  setVentaIvaCondition(next)
                  if (next) {
                    aplicarComprobanteDesdeIva(next as ClientIvaConditionValue)
                  }
                }}
              >
                <SelectTrigger className="h-10 rounded-lg bg-background">
                  <SelectValue placeholder="Sin definir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin definir</SelectItem>
                  {CLIENT_IVA_CONDITION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Cambiar la condición IVA actualiza el comprobante sugerido. Podés
                modificarlo después en Comprobante.
              </p>
            </div>
            <ul
              className={cn(
                "game-scroll max-h-[min(50vh,16rem)] space-y-2 overflow-y-auto rounded-xl border border-border/40 bg-muted/20 p-2 pr-1",
                clienteCatalogoBloqueado && "opacity-60",
              )}
              role="listbox"
              aria-label="Clientes"
            >
              {clientesFiltradosModal.length === 0 ? (
                <li className="rounded-lg border border-dashed border-border/60 bg-background/50 px-4 py-8 text-center text-sm text-muted-foreground">
                  {clienteSeleccionado && !busquedaClienteModalTrim
                    ? clienteSeleccionado.manual
                      ? "Cliente manual asignado a esta venta."
                      : "Cliente asignado a esta venta."
                    : !busquedaClienteModalTrim
                      ? "Escribí un nombre en el buscador para ver clientes del catálogo."
                      : "No hay resultados para esa búsqueda."}
                </li>
              ) : (
                clientesFiltradosModal.map((c) => {
                  const seleccionado = clienteSeleccionado?.manual
                    ? c.id === MANUAL_PARTY_LIST_ID
                    : clienteSeleccionado?.id === c.id
                  const opcionDeshabilitada = clienteSeleccionado != null
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={seleccionado}
                        aria-disabled={opcionDeshabilitada}
                        disabled={opcionDeshabilitada}
                        onClick={() => {
                          if (c.id === MANUAL_PARTY_LIST_ID) return
                          seleccionarCliente(c)
                        }}
                        className={ventaDialogOptionClass(
                          seleccionado,
                          opcionDeshabilitada,
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold leading-snug text-foreground">
                            {c.name}
                            {c.id === MANUAL_PARTY_LIST_ID ? (
                              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                (manual)
                              </span>
                            ) : null}
                          </span>
                          {c.taxId ? (
                            <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                              {c.taxId}
                            </span>
                          ) : null}
                          {c.ivaCondition ? (
                            <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                              {labelCondicionIva(c.ivaCondition)}
                            </span>
                          ) : null}
                        </span>
                        {seleccionado ? (
                          <span className="size-2 shrink-0 rounded-full bg-primary" />
                        ) : null}
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
          <DialogFooter className={ventaDialogFooter}>
            {clienteSeleccionado ? (
              <Button
                type="button"
                variant="ghost"
                className={ventaDialogGhostBtn}
                onClick={() => {
                  quitarClienteVenta()
                  setClienteModalAbierto(false)
                }}
              >
                Quitar cliente
              </Button>
            ) : puedeUsarClienteManual ? (
              <Button
                type="button"
                className={ventaDialogPrimaryBtn}
                onClick={seleccionarClienteManual}
              >
                Usar para esta venta
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={comprobanteModalAbierto}
        onOpenChange={setComprobanteModalAbierto}
      >
        <DialogContent className={ventaDialogContentMd}>
          <DialogHeader className={cn(ventaDialogHeader, "shrink-0")}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Comprobante
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Elegí el tipo para esta venta. Facturas A/B/C registran IVA débito
              fiscal en el asiento; sin comprobante y Recibo X no.
            </DialogDescription>
          </DialogHeader>
          <div
            className={cn(
              ventaDialogBody,
              "min-h-0 flex-1 overflow-y-auto overscroll-contain",
            )}
          >
            <ul
              className="flex flex-col gap-1.5"
              role="listbox"
              aria-label="Tipos de comprobante"
            >
              {comprobantePickerOptions.map((opt) => {
                const seleccionado =
                  opt.kind === "none"
                    ? comprobante == null
                    : comprobante === opt.label
                const hint =
                  opt.kind === "none"
                    ? "No se registra tipo fiscal en la venta"
                    : opt.kind === "internal"
                      ? "Comprobante interno · no pasa por ARCA"
                      : "Autorizable en ARCA / AFIP"

                return (
                  <li key={opt.label} className="min-w-0">
                    <button
                      type="button"
                      role="option"
                      aria-selected={seleccionado}
                      onClick={() =>
                        elegirComprobante(
                          opt.kind === "none" ? null : opt.label,
                        )
                      }
                      className={ventaDialogOptionClass(seleccionado)}
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold leading-snug text-foreground">
                          {opt.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                          {hint}
                        </span>
                      </span>
                      {seleccionado ? (
                        <span className="size-2 shrink-0 rounded-full bg-primary" />
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
          <DialogFooter className={cn(ventaDialogFooter, "shrink-0")}>
            <Button
              type="button"
              className={ventaDialogPrimaryBtn}
              onClick={() => setComprobanteModalAbierto(false)}
            >
              Listo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pagoModalAbierto} onOpenChange={setPagoModalAbierto}>
        <DialogContent className={ventaDialogContentMd}>
          <DialogHeader className={cn(ventaDialogHeader, "shrink-0")}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Formas de pago
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Elegí cómo vas a cobrar esta venta: al contado o a cuenta corriente
              del cliente.
            </DialogDescription>
          </DialogHeader>
          <div
            className={cn(
              ventaDialogBody,
              "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain",
            )}
          >
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Cuenta del cliente
              </p>
              <button
                type="button"
                className={ventaDialogOptionClass(payOnClientAccount)}
                onClick={() => {
                  setPayOnClientAccount(true)
                  setMetodoPagoSeleccionado(null)
                  setPagoModalAbierto(false)
                }}
              >
                {CLIENT_ACCOUNT_PAYMENT_LABEL}
              </button>
              <p className="mt-2 text-xs text-muted-foreground">
                Entregás la mercadería ahora y registrás la deuda en Cuentas por
                cobrar. Podés cobrar después.
              </p>
            </div>

            {paymentMethodListItems.length > 0 ? (
              <>
                <Separator className="bg-border/60" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Cobro inmediato
                </p>
              </>
            ) : null}

            {paymentMethodListItems.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                No hay medios de pago activos. Podés usar cuenta corriente del
                cliente.
              </p>
            ) : (
              <ul
                className="flex flex-col gap-1.5"
                role="listbox"
                aria-label="Formas de pago"
              >
                {paymentMethodListItems.map(({ method, groupTitle }) => {
                  const seleccionado =
                    !payOnClientAccount &&
                    metodoPagoSeleccionado?.id === method.id
                  return (
                    <li key={method.id} className="min-w-0">
                      <button
                        type="button"
                        role="option"
                        aria-selected={seleccionado}
                        onClick={() => {
                          setPayOnClientAccount(false)
                          setMetodoPagoSeleccionado({
                            id: method.id,
                            label: method.name,
                          })
                          setPagoModalAbierto(false)
                        }}
                        className={ventaDialogOptionClass(seleccionado)}
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold leading-snug text-foreground">
                            {method.name}
                          </span>
                          <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                            {groupTitle}
                          </span>
                        </span>
                        {seleccionado ? (
                          <span className="size-2 shrink-0 rounded-full bg-primary" />
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          <DialogFooter className={cn(ventaDialogFooter, "shrink-0")}>
            <Button
              type="button"
              className={ventaDialogPrimaryBtn}
              onClick={() => setPagoModalAbierto(false)}
            >
              Listo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={descuentoModalAbierto}
        onOpenChange={setDescuentoModalAbierto}
      >
        <DialogContent className={ventaDialogContentMd}>
          <DialogHeader className={ventaDialogHeader}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Descuento en la venta
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Alterná % o monto fijo con el botón e ingresá el valor. Se aplica
              sobre el subtotal (después de descuentos por ítem).
            </DialogDescription>
          </DialogHeader>
          <div className={ventaDialogBody}>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Valor
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={cn(
                  "inline-flex size-11 shrink-0 items-center justify-center rounded-xl border text-foreground/80 transition",
                  "border-foreground/10 bg-muted/50 hover:bg-muted hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
                aria-label="Cambiar tipo de descuento"
                onClick={() =>
                  setDescuentoDraftModo((m) =>
                    m === "porcentaje" ? "fijo" : "porcentaje",
                  )
                }
              >
                {descuentoDraftModo === "porcentaje" ? (
                  <Percent className="size-4 text-primary" aria-hidden />
                ) : (
                  <Banknote className="size-4 text-primary" aria-hidden />
                )}
              </button>
              <Input
                id="desc-valor"
                value={descuentoDraftTexto}
                onChange={(e) => {
                  const raw = e.target.value
                  if (!/^\d*$/.test(raw)) return
                  if (raw === "") {
                    setDescuentoDraftTexto("")
                    return
                  }
                  if (
                    descuentoDraftModo === "fijo" &&
                    subtotal > 0 &&
                    Number(raw) > subtotal
                  ) {
                    setDescuentoDraftModo("porcentaje")
                    setDescuentoDraftTexto("100")
                    return
                  }
                  const nextValue =
                    descuentoDraftModo === "porcentaje"
                      ? String(Math.min(100, Number(raw)))
                      : raw
                  setDescuentoDraftTexto(nextValue)
                }}
                placeholder="descuento"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                className="h-11 min-w-0 flex-1 rounded-lg"
              />
            </div>
            {descuentoDraftModo === "fijo" && subtotal > 0 ? (
              <p className="mt-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                Máximo aplicable:{" "}
                <span className={ventaImporteBaseClass}>
                  {fmt.format(subtotal)}
                </span>
                . Si superás ese monto, pasa a 100 %.
              </p>
            ) : null}
            {descuentoDraftModo === "fijo" && subtotal === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                No hay subtotal: agregá productos para aplicar un monto fijo.
              </p>
            ) : null}
          </div>
          <DialogFooter className={ventaDialogFooter}>
            <Button
              type="button"
              variant="ghost"
              className={ventaDialogGhostBtn}
              onClick={quitarDescuento}
            >
              Quitar descuento
            </Button>
            <Button
              type="button"
              className={ventaDialogPrimaryBtn}
              onClick={aplicarDescuentoModal}
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
