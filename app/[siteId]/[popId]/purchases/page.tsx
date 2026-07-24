"use client"

import withAuth from "@/hoc/withAuth"
import Image from "next/image"
import Link from "next/link"
import {
  getPurchaseCatalog,
  type PurchaseCatalogArticle,
  type PurchaseCatalogCategory,
  type PurchaseCatalogPaymentMethod,
  type PurchaseCatalogSupplier,
  type PurchaseKind,
} from "@/app/[siteId]/[popId]/purchases/actions"
import { treasuryPaymentOptionKey } from "@/lib/treasuryPaymentOptions"
import {
  CLIENT_IVA_CONDITION_OPTIONS,
} from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import { completePurchase } from "@/app/[siteId]/[popId]/purchases/completePurchase"
import { resolveSaleLineDiscount } from "@/lib/saleLineDiscount"
import { SUPPLIER_ACCOUNT_PAYMENT_LABEL } from "@/lib/operationPaymentLabels"
import {
  getPurchaseComprobanteDisplayLabel,
  getPurchaseComprobantePickerOptions,
} from "@/lib/purchaseComprobantePicker"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
import { SaleOperationTotalBar } from "@/components/sale-operation/SaleOperationTotalBar"
import { useDataWorkspaceSidebar } from "@/components/layouts/useDataWorkspaceSidebar"
import { useAuth } from "@/context/AuthContextSupabase"
import { useParams } from "next/navigation"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react"
import {
  Banknote,
  CircleCheck,
  CircleX,
  LayoutGrid,
  Loader2,
  MessageSquare,
  Minus,
  Paperclip,
  Percent,
  Plus,
  Receipt,
  Rows3,
  Search,
  Trash2,
  Truck,
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

type Producto = {
  id: string
  nombre: string
  descripcion: string
  precio: number
  iva: number
  categoria: string
  imagen: string
}

type ItemCarrito = {
  productoId: string
  cantidad: number
}

type ProveedorCompraSeleccionado = {
  id: string | null
  manual: boolean
  name: string
  taxId: string
  ivaCondition: string | null
}

const MANUAL_PARTY_LIST_ID = "__manual__"

const IVA_LABEL_BY_VALUE = Object.fromEntries(
  CLIENT_IVA_CONDITION_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>

function labelCondicionIva(value: string | null | undefined) {
  if (!value?.trim()) return null
  return IVA_LABEL_BY_VALUE[value] ?? value
}

type VistaCatalogo = { modo: "categoria"; categoria: string }

const CATEGORIA_TODOS = "Todos"

function derivePurchaseKindFromCart(
  cart: ItemCarrito[],
  articles: PurchaseCatalogArticle[],
): PurchaseKind {
  const counts = new Map<PurchaseKind, number>()
  for (const item of cart) {
    const article = articles.find((a) => a.id === item.productoId)
    if (!article) continue
    counts.set(
      article.itemKind,
      (counts.get(article.itemKind) ?? 0) + item.cantidad,
    )
  }
  if (counts.size === 0) return "merchandise"
  let best: PurchaseKind = "merchandise"
  let bestQty = -1
  for (const [kind, qty] of counts) {
    if (qty > bestQty) {
      best = kind
      bestQty = qty
    }
  }
  return best
}

function articleToProducto(a: PurchaseCatalogArticle): Producto {
  return {
    id: a.id,
    nombre: a.name,
    descripcion: a.description.trim() ? a.description : "—",
    precio: a.costPrice,
    iva: a.iva,
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
const compraImporteBaseClass = "font-mono tabular-nums tracking-tight"
const compraImporteCartClass = cn(

  compraImporteBaseClass,
  "text-sm font-semibold text-slate-900",
)
const compraImporteCartMutedClass = cn(
  compraImporteBaseClass,
  "text-[11px] text-slate-400",
)
const compraImporteCardClass = cn(
  compraImporteBaseClass,
  "block text-[clamp(1.05rem,1.65vw,1.3125rem)] leading-none font-semibold text-white/90",
)

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

function CartItemTitleMarquee({
  text,
  active,
  className,
}: {
  text: string
  active: boolean
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const ghostRef = useRef<HTMLSpanElement>(null)
  const prevActiveRef = useRef(false)
  const [truncated, setTruncated] = useState(false)
  const [marqueeKey, setMarqueeKey] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduceMotion(mq.matches)
    const fn = () => setReduceMotion(mq.matches)
    mq.addEventListener("change", fn)
    return () => mq.removeEventListener("change", fn)
  }, [])

  const syncMeasure = useCallback(() => {
    const c = containerRef.current
    const g = ghostRef.current
    if (!c || !g || !text) {
      setTruncated(false)
      return
    }
    setTruncated(g.scrollWidth > c.clientWidth + 1)
  }, [text])

  useLayoutEffect(() => {
    if (!active || !text) {
      setTruncated(false)
      prevActiveRef.current = active
      return
    }
    if (active && !prevActiveRef.current) {
      setMarqueeKey((k) => k + 1)
    }
    prevActiveRef.current = active
    syncMeasure()
    const id = requestAnimationFrame(syncMeasure)
    return () => cancelAnimationFrame(id)
  }, [active, text, syncMeasure])

  useEffect(() => {
    if (!active || !text) return
    const c = containerRef.current
    if (!c || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(syncMeasure)
    ro.observe(c)
    return () => ro.disconnect()
  }, [active, text, syncMeasure])

  if (!text) return null

  const durationSec = Math.min(28, Math.max(12, text.length * 0.42))
  const marqueeStyle: CSSProperties | undefined =
    active && truncated && !reduceMotion
      ? ({ "--marquee-duration": `${durationSec}s` } as CSSProperties)
      : undefined

  const ghost = (
    <span
      ref={ghostRef}
      aria-hidden
      className={cn("pointer-events-none invisible absolute whitespace-nowrap", className)}
    >
      {text}
    </span>
  )

  const segment = (dup: boolean) => (
    <span className={cn("inline-block whitespace-nowrap px-6", className)}>
      {text}
      {dup ? ` · ${text}` : ""}
    </span>
  )

  if (!active || !truncated || reduceMotion) {
    return (
      <div ref={containerRef} className="relative min-w-0 overflow-hidden">
        {ghost}
        <p className={cn("line-clamp-1", className)}>{text}</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative min-w-0 overflow-hidden">
      {ghost}
      <div className="rootsy-cart-item-marquee-fade overflow-hidden">
        <div
          key={marqueeKey}
          className="rootsy-cart-title-marquee-track"
          style={marqueeStyle}
        >
          {segment(false)}
          {segment(true)}
        </div>
      </div>
    </div>
  )
}

function parseUnitCost(raw: string, fallback: number): number {
  const n = Number.parseFloat(raw.trim().replace(",", "."))
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.round(n * 100) / 100
}

function PurchasesPage() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined
  const {
    open: catalogSidebarOpen,
    setOpen: setCatalogSidebarOpen,
  } = useDataWorkspaceSidebar(siteId, popId ?? "", Boolean(popId))
  const { user } = useAuth()

  const [catalogArticles, setCatalogArticles] = useState<PurchaseCatalogArticle[]>(
    [],
  )
  const [catalogCategories, setCatalogCategories] = useState<
    PurchaseCatalogCategory[]
  >([])
  const [suppliers, setSuppliers] = useState<PurchaseCatalogSupplier[]>([])
  const [popName, setPopName] = useState("")
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [canCreate, setCanCreate] = useState(false)
  const [canUpdateArticles, setCanUpdateArticles] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<
    PurchaseCatalogPaymentMethod[]
  >([])
  const [canReadPaymentMethods, setCanReadPaymentMethods] = useState(false)

  const categoriasNav = useMemo(() => {
    const names = [
      ...new Set(catalogCategories.map((c) => c.name).filter(Boolean)),
    ]
    return [CATEGORIA_TODOS, ...names]
  }, [catalogCategories])

  const productosCatalogo = useMemo(
    () => catalogArticles.map(articleToProducto),
    [catalogArticles],
  )

  const loadCatalog = useCallback(async () => {
    if (!popId || !siteId) {
      setCatalogLoading(false)
      setCatalogError("Punto de venta no encontrado")
      return
    }
    setCatalogLoading(true)
    setCatalogError(null)
    const res = await getPurchaseCatalog(popId)
    if (!res.success) {
      setCatalogArticles([])
      setCatalogCategories([])
      setSuppliers([])
      setPopName("")
      setCanCreate(false)
      setCanUpdateArticles(false)
      setPaymentMethods([])
      setCanReadPaymentMethods(false)
      setCatalogError(res.error)
      setCatalogLoading(false)
      return
    }
    setCatalogArticles(res.articles)
    setCatalogCategories(res.categories)
    setSuppliers(res.suppliers)
    setPopName(res.popName)
    setCanCreate(res.canCreate)
    setCanUpdateArticles(res.canUpdateArticles)
    setPaymentMethods(res.paymentMethods)
    setCanReadPaymentMethods(res.canReadPaymentMethods)
    setCatalogError(null)
    setCatalogLoading(false)
  }, [popId, siteId])

  useEffect(() => {
    void loadCatalog()
  }, [loadCatalog])

  useEffect(() => {
    if (!canReadPaymentMethods || paymentMethods.length === 0) return
    setMetodoPagoSeleccionado((prev) => {
      if (
        prev &&
        paymentMethods.some(
          (m) => treasuryPaymentOptionKey(m) === treasuryPaymentOptionKey(prev),
        )
      ) {
        return prev
      }
      const efectivo = paymentMethods.find((m) => m.kind === "cash")
      return efectivo ?? null
    })
  }, [canReadPaymentMethods, paymentMethods])

  const [vistaCatalogo, setVistaCatalogo] = useState<VistaCatalogo>({
    modo: "categoria",
    categoria: CATEGORIA_TODOS,
  })
  const [modoVista, setModoVista] = useState<"grid" | "lista">("grid")
  const [busqueda, setBusqueda] = useState("")
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [itemUnitCosts, setItemUnitCosts] = useState<Record<string, string>>({})
  const [itemUpdateArticleCost, setItemUpdateArticleCost] = useState<
    Record<string, boolean>
  >({})
  const [proveedorSeleccionado, setProveedorSeleccionado] =
    useState<ProveedorCompraSeleccionado | null>(null)
  const [manualNombreProveedor, setManualNombreProveedor] = useState("")
  const [proveedorTaxId, setProveedorTaxId] = useState("")
  const [compraIvaCondition, setCompraIvaCondition] = useState("")
  const compraPadron = usePadronAutofillRazonSocial(popId, proveedorTaxId, {
    enabled:
      Boolean(popId) &&
      (proveedorSeleccionado == null || proveedorSeleccionado.manual),
  })
  const [documentNumber, setDocumentNumber] = useState("")
  const [documentDate, setDocumentDate] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [comprobanteTipo, setComprobanteTipo] = useState<string | null>(null)
  const [comprobanteAdjunto, setComprobanteAdjunto] = useState<File | null>(null)
  const comprobanteAdjuntoInputRef = useRef<HTMLInputElement>(null)

  const [proveedorModalAbierto, setProveedorModalAbierto] = useState(false)
  const [busquedaProveedorModal, setBusquedaProveedorModal] = useState("")
  const [comprobanteModalAbierto, setComprobanteModalAbierto] = useState(false)
  const [pagoModalAbierto, setPagoModalAbierto] = useState(false)
  const [descuentoModalAbierto, setDescuentoModalAbierto] = useState(false)
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] =
    useState<PurchaseCatalogPaymentMethod | null>(null)
  const [payOnSupplierAccount, setPayOnSupplierAccount] = useState(false)
  const [cardInstallments, setCardInstallments] = useState("1")
  const [modoDescuento, setModoDescuento] = useState<"porcentaje" | "fijo">(
    "porcentaje",
  )
  const [valorDescuentoPorcentaje, setValorDescuentoPorcentaje] = useState(0)
  const [valorDescuentoFijo, setValorDescuentoFijo] = useState(0)
  const [descuentoDraftModo, setDescuentoDraftModo] = useState<
    "porcentaje" | "fijo"
  >("porcentaje")
  const [descuentoDraftTexto, setDescuentoDraftTexto] = useState("")

  const comprobantePickerOptions = useMemo(
    () => getPurchaseComprobantePickerOptions(),
    [],
  )

  const comprobanteDisplayLabel = useMemo(
    () => getPurchaseComprobanteDisplayLabel(comprobanteTipo),
    [comprobanteTipo],
  )

  const [itemDetalleAbiertoId, setItemDetalleAbiertoId] = useState<string | null>(
    null,
  )
  const [itemDescuentoModo, setItemDescuentoModo] = useState<
    Record<string, "porcentaje" | "fijo">
  >({})
  const [itemDescuentoDraft, setItemDescuentoDraft] = useState<
    Record<string, string>
  >({})
  const [itemComentarios, setItemComentarios] = useState<Record<string, string>>({})
  const [descartarConfirmOpen, setDescartarConfirmOpen] = useState(false)
  const [comprarConfirmOpen, setComprarConfirmOpen] = useState(false)
  const [compraSubmitting, setCompraSubmitting] = useState(false)
  const [compraError, setCompraError] = useState<string | null>(null)

  const busquedaProductosInputRef = useRef<HTMLInputElement>(null)
  const busquedaProveedorInputRef = useRef<HTMLInputElement>(null)
  const vistaAntesBusquedaRef = useRef<VistaCatalogo | null>(null)
  const busquedaTrimPrevRef = useRef("")

  useEffect(() => {
    const today = new Date()
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    setDocumentDate(iso)
  }, [])

  const productosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const hayBusqueda = q.length > 0
    return productosCatalogo.filter((p) => {
      const matchVista =
        hayBusqueda ||
        vistaCatalogo.categoria === CATEGORIA_TODOS ||
        p.categoria === vistaCatalogo.categoria
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
        if (prev.categoria === CATEGORIA_TODOS) return prev
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

  const subtotalOriginal = useMemo(() => {
    return itemsDetallados.reduce((acc, item) => {
      const fallback = item.producto?.precio ?? 0
      const unitCost = parseUnitCost(
        itemUnitCosts[item.productoId] ?? "",
        fallback,
      )
      return acc + unitCost * item.cantidad
    }, 0)
  }, [itemsDetallados, itemUnitCosts])

  const subtotal = useMemo(() => {
    return itemsDetallados.reduce((acc, item) => {
      const itemId = item.productoId
      const fallback = item.producto?.precio ?? 0
      const unitCost = parseUnitCost(
        itemUnitCosts[itemId] ?? "",
        fallback,
      )
      const draft = itemDescuentoDraft[itemId] ?? ""
      const pricing = resolveSaleLineDiscount({
        listUnitPrice: unitCost,
        quantity: item.cantidad,
        manualDiscount:
          draft.trim() !== ""
            ? {
                mode: itemDescuentoModo[itemId] ?? "porcentaje",
                draft,
              }
            : null,
      })
      return acc + pricing.lineSubtotal
    }, 0)
  }, [itemsDetallados, itemUnitCosts, itemDescuentoModo, itemDescuentoDraft])

  const descuentoItemsMonto = useMemo(
    () => Math.max(0, subtotalOriginal - subtotal),
    [subtotalOriginal, subtotal],
  )
  const hayDescuentoItems = descuentoItemsMonto > 0

  const descuentoMonto = useMemo(() => {
    if (modoDescuento === "porcentaje") {
      return subtotal * (valorDescuentoPorcentaje / 100)
    }
    return Math.min(valorDescuentoFijo, subtotal)
  }, [modoDescuento, subtotal, valorDescuentoPorcentaje, valorDescuentoFijo])

  const total = useMemo(
    () => Math.max(0, subtotal - descuentoMonto),
    [subtotal, descuentoMonto],
  )

  const hayDescuento = descuentoMonto > 0

  const hayItemsEnPedido = itemsDetallados.length > 0

  const comprobanteConfigurado =
    comprobanteTipo != null ||
    documentNumber.trim().length > 0 ||
    documentDate.trim().length > 0 ||
    comprobanteAdjunto != null

  const hayContenidoCompra = useMemo(() => {
    if (carrito.length > 0) return true
    if (proveedorSeleccionado != null) return true
    if (comprobanteConfigurado) return true
    if (hayDescuento) return true
    if (hayDescuentoItems) return true
    if (Object.values(itemComentarios).some((c) => c?.trim())) return true
    if (dueDate.trim()) return true
    if (payOnSupplierAccount || metodoPagoSeleccionado != null) return true
    return false
  }, [
    carrito.length,
    proveedorSeleccionado,
    comprobanteConfigurado,
    hayDescuento,
    hayDescuentoItems,
    itemComentarios,
    dueDate,
    payOnSupplierAccount,
    metodoPagoSeleccionado,
  ])

  const pagoConfigurado = payOnSupplierAccount || metodoPagoSeleccionado != null

  const puedeComprar = useMemo(
    () =>
      hayItemsEnPedido &&
      canCreate &&
      (payOnSupplierAccount
        ? Boolean(proveedorSeleccionado?.id)
        : canReadPaymentMethods && metodoPagoSeleccionado != null),
    [
      hayItemsEnPedido,
      canCreate,
      payOnSupplierAccount,
      proveedorSeleccionado?.id,
      canReadPaymentMethods,
      metodoPagoSeleccionado?.treasuryAccountId,
    ],
  )

  const pagoResumenLabel = useMemo(() => {
    if (payOnSupplierAccount) return SUPPLIER_ACCOUNT_PAYMENT_LABEL
    return metodoPagoSeleccionado?.label ?? "Elegir forma de pago"
  }, [payOnSupplierAccount, metodoPagoSeleccionado])

  const limpiarCompra = useCallback(() => {
    setCarrito([])
    setItemUnitCosts({})
    setItemUpdateArticleCost({})
    setItemDescuentoModo({})
    setItemDescuentoDraft({})
    setItemComentarios({})
    setProveedorSeleccionado(null)
    setManualNombreProveedor("")
    setProveedorTaxId("")
    setCompraIvaCondition("")
    setDocumentNumber("")
    setDueDate("")
    setComprobanteTipo(null)
    setComprobanteAdjunto(null)
    if (comprobanteAdjuntoInputRef.current) {
      comprobanteAdjuntoInputRef.current.value = ""
    }
    setModoDescuento("porcentaje")
    setValorDescuentoPorcentaje(0)
    setValorDescuentoFijo(0)
    setPayOnSupplierAccount(false)
    setCardInstallments("1")
    setMetodoPagoSeleccionado(() => {
      const efectivo = paymentMethods.find((m) => m.kind === "cash")
      return efectivo ?? null
    })
    setItemDetalleAbiertoId(null)
    setDescartarConfirmOpen(false)
    setComprarConfirmOpen(false)
    setCompraError(null)
    const today = new Date()
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    setDocumentDate(iso)
  }, [paymentMethods])

  const confirmarCompra = useCallback(async () => {
    if (!popId) return
    if (!payOnSupplierAccount && !metodoPagoSeleccionado) return
    setCompraError(null)
    setCompraSubmitting(true)
    try {
      const purchaseKind = derivePurchaseKindFromCart(carrito, catalogArticles)
      const res = await completePurchase(popId, {
        supplierId:
          proveedorSeleccionado && !proveedorSeleccionado.manual
            ? proveedorSeleccionado.id
            : null,
        supplierManual: proveedorSeleccionado?.manual
          ? {
              name: proveedorSeleccionado.name,
              taxId: proveedorSeleccionado.taxId || null,
            }
          : null,
        purchaseKind,
        documentNumber,
        documentDate,
        dueDate: dueDate || undefined,
        documentKind: comprobanteTipo,
        attachmentFileName: comprobanteAdjunto?.name ?? null,
        payOnSupplierAccount: payOnSupplierAccount,
        cardInstallments: Number(cardInstallments.replace(",", ".")) || 1,
        generalDiscountMode: modoDescuento === "porcentaje" ? "porcentaje" : "fijo",
        generalDiscountValue:
          modoDescuento === "porcentaje"
            ? valorDescuentoPorcentaje
            : valorDescuentoFijo,
        paymentKind: payOnSupplierAccount ? null : metodoPagoSeleccionado?.kind,
        treasuryAccountId: payOnSupplierAccount
          ? null
          : metodoPagoSeleccionado?.treasuryAccountId ?? null,
        lines: carrito.map((i) => {
          const producto = productosCatalogo.find((p) => p.id === i.productoId)
          const fallback = producto?.precio ?? 0
          return {
            articleId: i.productoId,
            quantity: i.cantidad,
            unitCost: parseUnitCost(itemUnitCosts[i.productoId] ?? "", fallback),
            updateArticleCost: itemUpdateArticleCost[i.productoId] === true,
            itemDiscountMode: itemDescuentoModo[i.productoId] ?? "porcentaje",
            itemDiscountDraft: itemDescuentoDraft[i.productoId] ?? "",
            comment: itemComentarios[i.productoId] ?? "",
          }
        }),
      })
      if (!res.success) {
        setCompraError(res.error)
        return
      }
      setComprarConfirmOpen(false)
      limpiarCompra()
      void loadCatalog()
    } finally {
      setCompraSubmitting(false)
    }
  }, [
    popId,
    payOnSupplierAccount,
    cardInstallments,
    metodoPagoSeleccionado,
    proveedorSeleccionado,
    catalogArticles,
    documentNumber,
    documentDate,
    dueDate,
    comprobanteTipo,
    comprobanteAdjunto,
    modoDescuento,
    valorDescuentoPorcentaje,
    valorDescuentoFijo,
    carrito,
    productosCatalogo,
    itemUnitCosts,
    itemUpdateArticleCost,
    itemDescuentoModo,
    itemDescuentoDraft,
    itemComentarios,
    limpiarCompra,
    loadCatalog,
  ])

  const proveedoresFiltradosModal = useMemo(() => {
    const q = normalizarBusqueda(busquedaProveedorModal.trim())

    if (proveedorSeleccionado && !q) {
      if (proveedorSeleccionado.manual) {
        return [
          {
            id: MANUAL_PARTY_LIST_ID,
            name: proveedorSeleccionado.name,
            taxId: proveedorSeleccionado.taxId,
          },
        ]
      }
      const fromCatalog = suppliers.find((s) => s.id === proveedorSeleccionado.id)
      if (fromCatalog) return [fromCatalog]
      if (proveedorSeleccionado.id) {
        return [
          {
            id: proveedorSeleccionado.id,
            name: proveedorSeleccionado.name,
            taxId: proveedorSeleccionado.taxId,
          },
        ]
      }
      return []
    }

    if (!q) return []

    return suppliers.filter(
      (s) =>
        normalizarBusqueda(s.name).includes(q) ||
        normalizarBusqueda(s.taxId).includes(q),
    )
  }, [busquedaProveedorModal, suppliers, proveedorSeleccionado])

  const proveedorCatalogoBloqueado =
    proveedorSeleccionado != null && !proveedorSeleccionado.manual

  const puedeUsarProveedorManual = useMemo(() => {
    if (proveedorSeleccionado) return false
    return Boolean(
      manualNombreProveedor.trim() ||
        proveedorTaxId.trim() ||
        compraPadron.razonSocial.trim(),
    )
  }, [
    proveedorSeleccionado,
    manualNombreProveedor,
    proveedorTaxId,
    compraPadron.razonSocial,
  ])

  const quitarProveedorCompra = useCallback(() => {
    setProveedorSeleccionado(null)
    setManualNombreProveedor("")
    setProveedorTaxId("")
    setCompraIvaCondition("")
  }, [])

  const seleccionarProveedorCatalogo = (s: PurchaseCatalogSupplier) => {
    setProveedorSeleccionado({
      id: s.id,
      manual: false,
      name: s.name,
      taxId: s.taxId,
      ivaCondition: null,
    })
    setManualNombreProveedor(s.name)
    setProveedorTaxId(s.taxId ?? "")
    setProveedorModalAbierto(false)
  }

  const seleccionarProveedorManual = () => {
    const name =
      manualNombreProveedor.trim() || compraPadron.razonSocial.trim()
    if (!name && !proveedorTaxId.trim()) return
    setProveedorSeleccionado({
      id: null,
      manual: true,
      name: name || "Proveedor sin nombre",
      taxId: proveedorTaxId.trim(),
      ivaCondition:
        compraIvaCondition.trim() || compraPadron.mappedIvaCondition || null,
    })
    setProveedorModalAbierto(false)
  }

  useEffect(() => {
    if (proveedorSeleccionado && !proveedorSeleccionado.manual) return
    if (!proveedorTaxId.trim()) return
    if (!compraPadron.mappedIvaCondition) return
    setCompraIvaCondition(compraPadron.mappedIvaCondition)
  }, [
    proveedorTaxId,
    compraPadron.mappedIvaCondition,
    proveedorSeleccionado,
  ])

  useEffect(() => {
    if (proveedorSeleccionado && !proveedorSeleccionado.manual) return
    if (!compraPadron.razonSocial.trim()) return
    if (manualNombreProveedor.trim()) return
    setManualNombreProveedor(compraPadron.razonSocial.trim())
  }, [
    compraPadron.razonSocial,
    manualNombreProveedor,
    proveedorSeleccionado,
  ])

  const compraIvaLabel = useMemo(
    () =>
      labelCondicionIva(
        proveedorSeleccionado?.ivaCondition ?? compraIvaCondition,
      ),
    [compraIvaCondition, proveedorSeleccionado?.ivaCondition],
  )

  const busquedaProveedorModalTrim = busquedaProveedorModal.trim()

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
    const buckets: Record<string, PurchaseCatalogPaymentMethod[]> = {}
    for (const k of order) buckets[k] = []
    for (const m of paymentMethods) {
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
  }, [paymentMethods])

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
        setModoDescuento("fijo")
        setValorDescuentoFijo(Math.max(0, Math.min(n, subtotal)))
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

  useEffect(() => {
    if (modoDescuento !== "fijo") return
    if (valorDescuentoFijo > subtotal) {
      setValorDescuentoFijo(Math.max(0, subtotal))
    }
  }, [modoDescuento, subtotal, valorDescuentoFijo])

  const agregarAlCarrito = (productoId: string) => {
    const producto = productosCatalogo.find((p) => p.id === productoId)
    setCarrito((prev) => {
      const existe = prev.find((i) => i.productoId === productoId)
      if (existe) {
        return prev.map((i) =>
          i.productoId === productoId ? { ...i, cantidad: i.cantidad + 1 } : i,
        )
      }
      return [...prev, { productoId, cantidad: 1 }]
    })
    if (producto && !itemUnitCosts[productoId]?.trim()) {
      setItemUnitCosts((prev) => ({
        ...prev,
        [productoId]:
          producto.precio > 0 ? String(producto.precio) : prev[productoId] ?? "",
      }))
    }
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
    setItemUnitCosts((prev) => {
      const next = { ...prev }
      delete next[productoId]
      return next
    })
    setItemUpdateArticleCost((prev) => {
      const next = { ...prev }
      delete next[productoId]
      return next
    })
    setItemDescuentoModo((prev) => {
      const next = { ...prev }
      delete next[productoId]
      return next
    })
    setItemDescuentoDraft((prev) => {
      const next = { ...prev }
      delete next[productoId]
      return next
    })
    setItemComentarios((prev) => {
      const next = { ...prev }
      delete next[productoId]
      return next
    })
    if (itemDetalleAbiertoId === productoId) {
      setItemDetalleAbiertoId(null)
    }
  }

  const toggleItemDetalle = (itemId: string) => {
    setItemDetalleAbiertoId((prev) => (prev === itemId ? null : itemId))
  }

  const toolboxBarClass =
    "box-border border-t border-white/10 bg-[#0b100e]/92 backdrop-blur-xl"
  const compraFooterBandHeightClass =
    "min-h-[calc(4.5rem+1rem)] sm:min-h-[calc(4.75rem+1.25rem)]"
  const compraFooterBarPaddingClass = "p-2 sm:p-2.5"
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

  const compraDialogOptionClass = (seleccionado: boolean, disabled = false) =>
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

  const compraDialogLight = "rootsy-app-light text-foreground"
  const compraDialogSurface =
    "gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 shadow-2xl ring-1 ring-black/[0.04]"
  const compraDialogMaxViewport =
    "max-h-[calc(100vh-100px)] flex flex-col overflow-hidden"
  const compraDialogSurfaceMd = cn(
    compraDialogSurface,
    compraDialogMaxViewport,
    "sm:max-w-md",
  )
  const compraDialogSurfaceLg = cn(
    compraDialogSurface,
    compraDialogMaxViewport,
    "sm:max-w-2xl",
  )
  const compraDialogContentMd = cn(compraDialogSurfaceMd, compraDialogLight)
  const compraDialogContentLg = cn(compraDialogSurfaceLg, compraDialogLight)
  const compraDialogHeader =
    "space-y-1.5 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left"
  const compraDialogBody = "px-6 py-4"
  const compraDialogFooter =
    "border-t border-border/50 bg-muted/15 px-6 py-3.5 sm:justify-between"
  const compraDialogPrimaryBtn =
    "h-10 bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700"
  const compraDialogGhostBtn = "h-10 text-muted-foreground hover:text-foreground"
  const compraAlertDialogContent = cn(
    compraDialogLight,
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
            {categoriasNav.map((cat) => {
              const seleccionado = vistaCatalogo.categoria === cat
              return (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() =>
                      setVistaCatalogo({
                        modo: "categoria",
                        categoria: cat,
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
                    {cat}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
    ),
    [categoriasNav, vistaCatalogo.categoria],
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
        title="Comprar"
        headerVariant="dark"
        contentFlush
        loading={catalogLoading}
        userName={headerUserName}
        userAvatarSrc={userAvatarSrc}
        userRoleLabel="Compras"
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
                    <button
                      type="button"
                      onClick={() => setModoVista("grid")}
                      className={cn(
                        "relative z-10 flex h-8 w-10 items-center justify-center rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70",
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
                        "relative z-10 flex h-8 w-10 items-center justify-center rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70",
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
                      placeholder="Buscar artículo..."
                      className={cn(
                        "h-10 border-white/10 bg-black/20 pl-9 text-white placeholder:text-white/35",
                        busqueda.length > 0 && "pr-9",
                      )}
                    />
                    {busqueda.length > 0 ? (
                      <button
                        type="button"
                        aria-label="Limpiar búsqueda"
                        className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/[0.07] hover:text-white/90"
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
                    {productosFiltrados.length} artículos
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
                      <p className="text-sm text-slate-400">Cargando artículos…</p>
                    </div>
                  ) : catalogError ? (
                    <div className="flex min-h-[200px] flex-1 flex-col items-center justify-center gap-2 text-center">
                      <p className="max-w-md text-sm text-rose-300">{catalogError}</p>
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
                      {productosFiltrados.map((p) => (
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
                              style={{ objectFit: "cover", objectPosition: "center" }}
                            />
                            <span
                              className="pointer-events-none absolute right-2 bottom-2 z-20 flex size-9 items-center justify-center rounded-full border border-emerald-300/45 bg-emerald-500 text-emerald-950 opacity-0 shadow-[0_4px_20px_rgba(16,185,129,0.5)] transition-[opacity,transform] duration-200 translate-y-1 scale-95 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100"
                              aria-hidden
                            >
                              <Plus className="size-4.5" strokeWidth={2.5} />
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
                              <span className={compraImporteCardClass}>
                                {fmt.format(p.precio)}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div
              role="toolbar"
              aria-label="Configuración de la compra"
              className={cn(
                "col-start-1 row-start-2 grid h-full min-h-0 grid-cols-2 gap-2 lg:grid-cols-4",
                toolboxBarClass,
                compraFooterBarPaddingClass,
                compraFooterBandHeightClass,
              )}
            >
              <button
                type="button"
                onClick={() => setProveedorModalAbierto(true)}
                className={toolboxSlotClass(Boolean(proveedorSeleccionado))}
                aria-label={
                  proveedorSeleccionado
                    ? `Proveedor: ${proveedorSeleccionado.name}. Abrir para cambiar.`
                    : "Proveedor sin elegir. Abrir para seleccionar."
                }
              >
                <span className={toolboxIconWrap(Boolean(proveedorSeleccionado))}>
                  <Truck className="size-4.5 sm:size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45">
                    Proveedor
                  </span>
                  <span
                    className={cn(
                      "block truncate text-sm font-semibold leading-snug",
                      proveedorSeleccionado
                        ? "text-foreground"
                        : "text-foreground/55",
                    )}
                  >
                    {proveedorSeleccionado?.name ?? "Elegir proveedor"}
                  </span>
                  {compraIvaLabel ? (
                    <span className="mt-0.5 block truncate text-[11px] font-medium text-muted-foreground">
                      {compraIvaLabel}
                    </span>
                  ) : null}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setComprobanteModalAbierto(true)}
                className={toolboxSlotClass(comprobanteConfigurado)}
                aria-label={
                  comprobanteConfigurado
                    ? "Comprobante configurado. Abrir para editar."
                    : "Comprobante sin datos. Abrir para completar."
                }
              >
                <span className={toolboxIconWrap(comprobanteConfigurado)}>
                  <Receipt className="size-4.5 sm:size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45">
                    Comprobante
                  </span>
                  <span
                    className={cn(
                      "block truncate text-sm font-semibold leading-snug",
                      comprobanteConfigurado
                        ? "text-foreground"
                        : "text-foreground/55",
                    )}
                  >
                    {comprobanteTipo != null
                      ? comprobanteTipo
                      : documentNumber.trim() ||
                        (comprobanteAdjunto
                          ? comprobanteAdjunto.name
                          : comprobanteDisplayLabel)}
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
                      pagoConfigurado ? "text-foreground" : "text-foreground/55",
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
                    ? `Descuento aplicado. Abrir para editar.`
                    : "Sin descuento. Abrir para configurar."
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
                      hayDescuento ? "text-foreground" : "text-foreground/55",
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
            aria-label="Carrito de la compra"
          >
            <div className="flex min-h-0 flex-col">
              <div
                className="game-scroll min-h-0 flex-1 space-y-2 overflow-y-auto p-3 sm:p-3.5"
                role="region"
                aria-label="Ítems agregados"
              >
                <div className="mb-1 flex items-baseline justify-between gap-2 px-0.5">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    Tu compra
                  </h2>
                  <span className="text-[11px] font-medium tabular-nums text-slate-400">
                    {itemsDetallados.length}{" "}
                    {itemsDetallados.length === 1 ? "línea" : "líneas"}
                  </span>
                </div>
                {itemsDetallados.map((item) => {
                  const itemId = item.productoId
                  const abierto = itemDetalleAbiertoId === itemId
                  const fallback = item.producto?.precio ?? 0
                  const unitCost = parseUnitCost(
                    itemUnitCosts[itemId] ?? "",
                    fallback,
                  )
                  const descuentoRaw = itemDescuentoDraft[itemId] ?? ""
                  const modoItemDescuento =
                    itemDescuentoModo[itemId] ?? "porcentaje"
                  const linePricing = resolveSaleLineDiscount({
                    listUnitPrice: unitCost,
                    quantity: item.cantidad,
                    manualDiscount:
                      descuentoRaw.trim() !== ""
                        ? {
                            mode: modoItemDescuento,
                            draft: descuentoRaw,
                          }
                        : null,
                  })
                  const lineTotal = linePricing.lineSubtotal
                  const listLineTotal = linePricing.listLineSubtotal
                  const tieneDescuentoItem = linePricing.itemDiscountAmount > 0
                  const descuentoNumero = Number.parseFloat(
                    descuentoRaw.trim().replace(",", "."),
                  )
                  const comentario = itemComentarios[itemId] ?? ""
                  const tieneComentario = comentario.trim().length > 0
                  const descripcionProducto = item.producto?.descripcion?.trim() ?? ""
                  const showDescripcion =
                    descripcionProducto.length > 0 && descripcionProducto !== "—"
                  const showSubtituloItem =
                    showDescripcion || tieneComentario || tieneDescuentoItem
                  const nombreProducto = item.producto?.nombre ?? "Artículo"
                  const descuentoLabel = tieneDescuentoItem
                    ? modoItemDescuento === "porcentaje"
                      ? `${Math.min(100, Math.max(0, Number.isFinite(descuentoNumero) ? descuentoNumero : 0))}%`
                      : fmt.format(linePricing.itemDiscountAmount)
                    : undefined

                  return (
                    <div key={itemId} className="space-y-2">
                      <div
                        role="button"
                        tabIndex={0}
                        aria-expanded={abierto}
                        aria-controls={
                          abierto ? `cart-item-${itemId}-opciones` : undefined
                        }
                        onClick={() => toggleItemDetalle(itemId)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            toggleItemDetalle(itemId)
                          }
                        }}
                        className={cn(
                          "cursor-pointer rounded-xl border bg-white px-3 py-2.5 text-left shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_4px_14px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow] duration-150",
                          abierto
                            ? "border-slate-300 ring-1 ring-slate-300/60"
                            : "border-slate-200/90 hover:border-slate-300",
                        )}
                      >
                        <div className="grid grid-cols-[56px_minmax(0,1fr)_minmax(4.5rem,auto)_2rem] items-center gap-2 sm:grid-cols-[56px_minmax(0,1fr)_5.5rem_2rem]">
                          <div
                            className="flex items-center gap-0.5 rounded-lg bg-slate-50 px-1 py-1 ring-1 ring-slate-200/90"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            role="group"
                            aria-label={`Cantidad de ${nombreProducto}`}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                cambiarCantidad(itemId, -1)
                              }}
                              className="inline-flex size-6 items-center justify-center rounded-md bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/80 hover:bg-slate-50"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="min-w-5 text-center text-sm font-bold tabular-nums text-slate-900">
                              {item.cantidad}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                cambiarCantidad(itemId, 1)
                              }}
                              className="inline-flex size-6 items-center justify-center rounded-md bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/80 hover:bg-slate-50"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                          <div className="min-w-0">
                            <CartItemTitleMarquee
                              text={nombreProducto}
                              active={abierto}
                              className="text-sm font-semibold text-slate-900"
                            />
                            {showSubtituloItem ? (
                              <div className="mt-0.5 flex min-w-0 items-center gap-1">
                                {showDescripcion ? (
                                  <div className="min-w-0 flex-1">
                                    <p className="line-clamp-1 text-xs text-slate-500">
                                      {descripcionProducto}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="min-w-0 flex-1" />
                                )}
                                {tieneComentario ? (
                                  <span
                                    className="inline-flex shrink-0 items-center rounded-full border border-sky-200 bg-sky-50 px-1.5 py-0 text-[10px] font-semibold text-sky-800"
                                    title="Tiene comentario"
                                  >
                                    <span className="sr-only">Comentario</span>
                                    <MessageSquare className="size-3 sm:hidden" aria-hidden />
                                    <span aria-hidden className="hidden sm:inline">
                                      Nota
                                    </span>
                                  </span>
                                ) : null}
                                {tieneDescuentoItem && descuentoLabel ? (
                                  <span
                                    className={cn(
                                      "inline-flex max-w-22 shrink-0 items-center justify-center truncate rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0 text-[10px] font-semibold text-emerald-800",
                                      compraImporteBaseClass,
                                    )}
                                  >
                                    {descuentoLabel}
                                  </span>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                          <div className="text-right">
                            {tieneDescuentoItem && listLineTotal > lineTotal ? (
                              <p className={cn(compraImporteCartMutedClass, "line-through")}>
                                {fmt.format(listLineTotal)}
                              </p>
                            ) : null}
                            <p className={compraImporteCartClass}>
                              {fmt.format(lineTotal)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              quitarDelCarrito(itemId)
                            }}
                            aria-label={`Quitar ${nombreProducto}`}
                            className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>

                      {abierto ? (
                        <div
                          id={`cart-item-${itemId}-opciones`}
                          role="region"
                          aria-label={`Opciones de ${nombreProducto}`}
                          onClick={(e) => e.stopPropagation()}
                          className="space-y-2"
                        >
                          <div className="rounded-xl border border-slate-200/95 bg-white px-2.5 py-2 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_4px_16px_rgba(15,23,42,0.06)]">
                            <div className="flex items-center gap-2">
                              <Label
                                htmlFor={`unit-cost-${itemId}`}
                                className="shrink-0 text-[11px] text-slate-500"
                              >
                                Costo
                              </Label>
                              <Input
                                id={`unit-cost-${itemId}`}
                                inputMode="decimal"
                                value={itemUnitCosts[itemId] ?? ""}
                                placeholder={fallback > 0 ? String(fallback) : "0"}
                                title={
                                  item.producto && item.producto.iva > 0
                                    ? `IVA ${item.producto.iva}% incluido en el costo`
                                    : undefined
                                }
                                onChange={(e) => {
                                  const raw = e.target.value
                                  if (!/^\d*[.,]?\d*$/.test(raw)) return
                                  setItemUnitCosts((prev) => ({
                                    ...prev,
                                    [itemId]: raw,
                                  }))
                                }}
                                className="h-8 w-26 shrink-0 border border-slate-300 bg-white! font-mono text-[#121417] text-xs tabular-nums shadow-none placeholder:text-slate-500"
                              />
                              {canUpdateArticles ? (
                                <label
                                  htmlFor={`update-cost-${itemId}`}
                                  className={cn(
                                    "ml-auto flex min-w-0 shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-colors",
                                    itemUpdateArticleCost[itemId] === true
                                      ? "border-emerald-300 bg-emerald-50/80"
                                      : "border-slate-200 bg-white hover:border-slate-300",
                                  )}
                                >
                                  <Checkbox
                                    id={`update-cost-${itemId}`}
                                    checked={itemUpdateArticleCost[itemId] === true}
                                    onCheckedChange={(checked) => {
                                      setItemUpdateArticleCost((prev) => ({
                                        ...prev,
                                        [itemId]: checked === true,
                                      }))
                                    }}
                                    className="border-slate-200 bg-white shadow-none data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
                                  />
                                  <span className="truncate text-xs font-medium text-slate-700">
                                    Actualizar costo
                                  </span>
                                </label>
                              ) : null}
                            </div>
                          </div>
                          <div className="rounded-xl border border-slate-200/95 bg-white px-2.5 py-2 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_4px_16px_rgba(15,23,42,0.06)]">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-400/50 bg-slate-100 text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50"
                                aria-label="Cambiar tipo de descuento"
                                onClick={() => {
                                  setItemDescuentoModo((prev) => ({
                                    ...prev,
                                    [itemId]:
                                      modoItemDescuento === "porcentaje"
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
                                value={descuentoRaw}
                                onChange={(e) => {
                                  const raw = e.target.value
                                  if (!/^\d*$/.test(raw)) return
                                  if (
                                    modoItemDescuento === "fijo" &&
                                    Number(raw) > listLineTotal
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
                                className="h-8 w-26 border border-slate-300 bg-white! text-[#121417] text-xs shadow-none placeholder:text-slate-500"
                              />
                              <div className="relative min-w-0 flex-1">
                                <MessageSquare className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-500" />
                                <Input
                                  value={comentario}
                                  onChange={(e) => {
                                    setItemComentarios((prev) => ({
                                      ...prev,
                                      [itemId]: e.target.value,
                                    }))
                                  }}
                                  placeholder="agregá un comentario..."
                                  className="h-8 border border-slate-300 bg-white! pl-8 text-[#121417] text-xs shadow-none placeholder:text-slate-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex min-h-0 flex-col">
              <div className="bg-[#f8fafc] p-3 text-[#121417]">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!hayContenidoCompra}
                    onClick={() => setDescartarConfirmOpen(true)}
                    className="h-11 gap-2 border-rose-200/90 bg-white font-medium text-rose-700 shadow-none hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800 focus-visible:ring-2 focus-visible:ring-rose-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <CircleX className="size-4 shrink-0" aria-hidden />
                    Descartar
                  </Button>
                  <Button
                    type="button"
                    disabled={!puedeComprar || compraSubmitting}
                    onClick={() => {
                      setCompraError(null)
                      setComprarConfirmOpen(true)
                    }}
                    title={
                      !hayItemsEnPedido
                        ? "Agregá artículos a la compra."
                        : !payOnSupplierAccount && !metodoPagoSeleccionado
                          ? "Elegí cómo vas a pagar o usá cuenta corriente."
                          : payOnSupplierAccount && !proveedorSeleccionado?.id
                            ? "Elegí un proveedor del catálogo para comprar a cuenta corriente."
                            : !canCreate
                              ? "No tenés permiso para registrar compras."
                              : undefined
                    }
                    className="h-11 gap-2 border-0 bg-emerald-600 font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:bg-emerald-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8fafc] active:bg-emerald-700 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <CircleCheck className="size-4 shrink-0 opacity-95" aria-hidden />
                    Comprar
                  </Button>
                </div>
              </div>

              <SaleOperationTotalBar
                total={total}
                subtotal={subtotal}
                descuentoMonto={descuentoMonto}
                hayDescuento={hayDescuento}
                subtotalOriginal={subtotalOriginal}
                descuentoItemsMonto={descuentoItemsMonto}
                hayDescuentoItems={hayDescuentoItems}
              />
            </div>
          </aside>
        </main>
        </div>
      </DataWorkspaceLayout>

      <Dialog
        open={proveedorModalAbierto}
        onOpenChange={(open) => {
          setProveedorModalAbierto(open)
          if (open) {
            setBusquedaProveedorModal("")
            if (proveedorSeleccionado?.manual) {
              setManualNombreProveedor(proveedorSeleccionado.name)
              setProveedorTaxId(proveedorSeleccionado.taxId)
              setCompraIvaCondition(proveedorSeleccionado.ivaCondition ?? "")
            }
          }
        }}
      >
        <DialogContent className={compraDialogContentMd}>
          <DialogHeader className={compraDialogHeader}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Proveedor para esta compra
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {proveedorSeleccionado
                ? proveedorSeleccionado.manual
                  ? "Proveedor cargado manualmente para esta compra (no se guarda en el catálogo). Quitá la selección para cambiar los datos."
                  : "Proveedor asignado a esta compra. Quitá la selección para cargar datos manualmente."
                : "Buscá en el catálogo o cargá los datos manualmente y usalos solo para esta compra."}
            </DialogDescription>
          </DialogHeader>
          <div className={compraDialogBody}>
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={busquedaProveedorInputRef}
                value={busquedaProveedorModal}
                onChange={(e) => setBusquedaProveedorModal(e.target.value)}
                placeholder="Nombre del proveedor…"
                disabled={proveedorCatalogoBloqueado}
                className={cn(
                  "h-11 rounded-lg pl-9",
                  busquedaProveedorModal.length > 0 && "pr-9",
                )}
                autoComplete="off"
              />
              {busquedaProveedorModal.length > 0 && !proveedorCatalogoBloqueado ? (
                <button
                  type="button"
                  aria-label="Limpiar búsqueda"
                  className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-[color,background-color] duration-150 hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:bg-muted"
                  onClick={() => {
                    setBusquedaProveedorModal("")
                    busquedaProveedorInputRef.current?.focus()
                  }}
                >
                  <IconoLimpiarBusqueda />
                </button>
              ) : null}
            </div>
            <div
              className={cn(
                "mb-3 rounded-xl border border-border/50 bg-muted/15 p-3",
                proveedorCatalogoBloqueado && "opacity-60",
              )}
            >
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Datos para esta compra
              </p>
              <Input
                value={manualNombreProveedor}
                onChange={(e) => setManualNombreProveedor(e.target.value)}
                placeholder="Nombre o razón social"
                className="mb-2 h-10 rounded-lg"
                autoComplete="off"
                disabled={proveedorSeleccionado != null}
                readOnly={proveedorSeleccionado != null}
              />
              <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                CUIT (padrón AFIP)
              </p>
              <Input
                value={proveedorTaxId}
                onChange={(e) => setProveedorTaxId(e.target.value)}
                placeholder="Ej. 30-12345678-9"
                className="h-10 rounded-lg"
                autoComplete="off"
                disabled={proveedorSeleccionado != null}
                readOnly={proveedorSeleccionado != null}
              />
              <div className="mt-2 flex min-h-6 items-center gap-2 text-sm">
                {proveedorSeleccionado ? (
                  <span className="font-medium text-foreground">
                    {proveedorSeleccionado.name}
                  </span>
                ) : compraPadron.busy ? (
                  <>
                    <Loader2
                      className="size-4 shrink-0 animate-spin text-primary"
                      aria-hidden
                    />
                    <span className="text-muted-foreground">Consultando…</span>
                  </>
                ) : compraPadron.error ? (
                  <span className="text-destructive">{compraPadron.error}</span>
                ) : compraPadron.razonSocial && !manualNombreProveedor.trim() ? (
                  <span className="text-muted-foreground">
                    Padrón:{" "}
                    <span className="font-medium text-foreground">
                      {compraPadron.razonSocial}
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    La razón social del padrón se completa al validar el CUIT.
                  </span>
                )}
              </div>
              {proveedorSeleccionado?.ivaCondition ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {labelCondicionIva(proveedorSeleccionado.ivaCondition)}
                </p>
              ) : compraPadron.condicionIvaNombre &&
                !compraPadron.busy &&
                !compraPadron.error ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  AFIP: {compraPadron.condicionIvaNombre}
                </p>
              ) : null}
            </div>
            <div
              className={cn(
                "mb-3 space-y-2",
                proveedorSeleccionado != null && "opacity-60",
              )}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Condición IVA (esta compra)
              </p>
              <Select
                value={compraIvaCondition || "__none__"}
                disabled={proveedorSeleccionado != null}
                onValueChange={(v) => {
                  setCompraIvaCondition(v === "__none__" ? "" : v)
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
            </div>
            <ul
              className={cn(
                "game-scroll max-h-[min(50vh,16rem)] space-y-2 overflow-y-auto rounded-xl border border-border/40 bg-muted/20 p-2 pr-1",
                proveedorCatalogoBloqueado && "opacity-60",
              )}
              role="listbox"
              aria-label="Proveedores"
            >
              {!proveedorSeleccionado ? (
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected={!proveedorSeleccionado}
                    onClick={() => {
                      quitarProveedorCompra()
                      setProveedorModalAbierto(false)
                    }}
                    className={compraDialogOptionClass(!proveedorSeleccionado)}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-snug text-foreground">
                        Sin proveedor
                      </span>
                    </span>
                    {!proveedorSeleccionado ? (
                      <span className="size-2 shrink-0 rounded-full bg-primary" />
                    ) : null}
                  </button>
                </li>
              ) : null}
              {proveedoresFiltradosModal.length === 0 ? (
                <li className="rounded-lg border border-dashed border-border/60 bg-background/50 px-4 py-8 text-center text-sm text-muted-foreground">
                  {proveedorSeleccionado && !busquedaProveedorModalTrim
                    ? proveedorSeleccionado.manual
                      ? "Proveedor manual asignado a esta compra."
                      : "Proveedor asignado a esta compra."
                    : !busquedaProveedorModalTrim
                      ? suppliers.length === 0
                        ? (
                            <>
                              No hay proveedores cargados.{" "}
                              <Link
                                href={`/${siteId}/${popId}/suppliers`}
                                className="underline underline-offset-2"
                              >
                                Cargar proveedores
                              </Link>
                            </>
                          )
                        : "Escribí un nombre o CUIT en el buscador para ver proveedores del catálogo."
                      : "No hay resultados para esa búsqueda."}
                </li>
              ) : (
                proveedoresFiltradosModal.map((s) => {
                  const seleccionado = proveedorSeleccionado?.manual
                    ? s.id === MANUAL_PARTY_LIST_ID
                    : proveedorSeleccionado?.id === s.id
                  const opcionDeshabilitada = proveedorSeleccionado != null
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={seleccionado}
                        aria-disabled={opcionDeshabilitada}
                        disabled={opcionDeshabilitada}
                        onClick={() => {
                          if (s.id === MANUAL_PARTY_LIST_ID) return
                          seleccionarProveedorCatalogo(s)
                        }}
                        className={compraDialogOptionClass(seleccionado, opcionDeshabilitada)}
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold leading-snug text-foreground">
                            {s.name}
                            {s.id === MANUAL_PARTY_LIST_ID ? (
                              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                (manual)
                              </span>
                            ) : null}
                          </span>
                          {s.taxId ? (
                            <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                              {s.taxId}
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
          <DialogFooter className={compraDialogFooter}>
            {proveedorSeleccionado ? (
              <Button
                type="button"
                variant="ghost"
                className={compraDialogGhostBtn}
                onClick={() => {
                  quitarProveedorCompra()
                  setProveedorModalAbierto(false)
                }}
              >
                Quitar proveedor
              </Button>
            ) : puedeUsarProveedorManual ? (
              <Button
                type="button"
                className={compraDialogPrimaryBtn}
                onClick={seleccionarProveedorManual}
              >
                Usar para esta compra
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className={compraDialogGhostBtn}
                onClick={() => setProveedorModalAbierto(false)}
              >
                Cerrar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={comprobanteModalAbierto} onOpenChange={setComprobanteModalAbierto}>
        <DialogContent className={compraDialogContentLg}>
          <DialogHeader className={cn(compraDialogHeader, "shrink-0")}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Tipo de comprobante
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Elegí el documento del proveedor o dejalo en sin comprobante para un
              registro interno. Completá número, fechas y adjunto si los tenés.
            </DialogDescription>
          </DialogHeader>
          <div
            className={cn(
              compraDialogBody,
              "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain",
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
                    ? comprobanteTipo == null
                    : comprobanteTipo === opt.label
                return (
                  <li key={opt.label} className="min-w-0">
                    <button
                      type="button"
                      role="option"
                      aria-selected={seleccionado}
                      onClick={() =>
                        setComprobanteTipo(
                          opt.kind === "none" ? null : opt.label,
                        )
                      }
                      className={compraDialogOptionClass(seleccionado)}
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold leading-snug text-foreground">
                          {opt.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                          {opt.hint}
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

            <div className="space-y-2">
              <Label htmlFor="purchase-doc-number">Nº comprobante</Label>
              <Input
                id="purchase-doc-number"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Número impreso en la factura"
                className="h-10 rounded-lg"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="purchase-doc-date">Fecha comprobante</Label>
                <Input
                  id="purchase-doc-date"
                  type="date"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                  className="h-10 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase-due-date">Vencimiento pago</Label>
                <Input
                  id="purchase-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-10 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase-doc-attachment">Adjunto</Label>
              <input
                ref={comprobanteAdjuntoInputRef}
                id="purchase-doc-attachment"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,image/*,application/pdf"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  setComprobanteAdjunto(file)
                }}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 rounded-lg"
                  onClick={() => comprobanteAdjuntoInputRef.current?.click()}
                >
                  <Paperclip className="size-4" aria-hidden />
                  {comprobanteAdjunto ? "Cambiar archivo" : "Adjuntar archivo"}
                </Button>
                {comprobanteAdjunto ? (
                  <>
                    <span className="max-w-[220px] truncate text-sm text-muted-foreground">
                      {comprobanteAdjunto.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setComprobanteAdjunto(null)
                        if (comprobanteAdjuntoInputRef.current) {
                          comprobanteAdjuntoInputRef.current.value = ""
                        }
                      }}
                    >
                      Quitar
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
          <DialogFooter className={cn(compraDialogFooter, "shrink-0")}>
            <Button
              type="button"
              variant="ghost"
              className={compraDialogGhostBtn}
              onClick={() => {
                setComprobanteTipo(null)
                setComprobanteAdjunto(null)
                if (comprobanteAdjuntoInputRef.current) {
                  comprobanteAdjuntoInputRef.current.value = ""
                }
                setComprobanteModalAbierto(false)
              }}
            >
              Quitar selección
            </Button>
            <Button
              type="button"
              className={compraDialogPrimaryBtn}
              onClick={() => setComprobanteModalAbierto(false)}
            >
              Listo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pagoModalAbierto} onOpenChange={setPagoModalAbierto}>
        <DialogContent className={compraDialogContentMd}>
          <DialogHeader className={cn(compraDialogHeader, "shrink-0")}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Formas de pago
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Elegí cómo vas a pagar esta compra: al contado o a cuenta corriente
              del proveedor.
            </DialogDescription>
          </DialogHeader>
          <div
            className={cn(
              compraDialogBody,
              "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain",
            )}
          >
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Cuenta del proveedor
              </p>
              <button
                type="button"
                className={compraDialogOptionClass(payOnSupplierAccount)}
                onClick={() => {
                  setPayOnSupplierAccount(true)
                  setMetodoPagoSeleccionado(null)
                  setCardInstallments("1")
                  setPagoModalAbierto(false)
                }}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-snug text-foreground">
                    {SUPPLIER_ACCOUNT_PAYMENT_LABEL}
                  </span>
                </span>
                {payOnSupplierAccount ? (
                  <span className="size-2 shrink-0 rounded-full bg-primary" />
                ) : null}
              </button>
              <p className="mt-2 text-xs text-muted-foreground">
                Recibís la mercadería ahora y registrás la deuda en Proveedores. Podés pagar después.
              </p>
            </div>

            {paymentMethodListItems.length > 0 ? (
              <>
                <Separator className="bg-border/60" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Pago inmediato
                </p>
              </>
            ) : null}

            {paymentMethodListItems.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                No hay medios de pago activos. Podés usar cuenta corriente del proveedor.
              </p>
            ) : (
              <ul
                className="flex flex-col gap-1.5"
                role="listbox"
                aria-label="Formas de pago"
              >
                {paymentMethodListItems.map(({ method, groupTitle }) => {
                  const seleccionado =
                    !payOnSupplierAccount &&
                    metodoPagoSeleccionado != null &&
                    treasuryPaymentOptionKey(metodoPagoSeleccionado) ===
                      treasuryPaymentOptionKey(method)
                  return (
                    <li key={treasuryPaymentOptionKey(method)} className="min-w-0">
                      <button
                        type="button"
                        role="option"
                        aria-selected={seleccionado}
                        onClick={() => {
                          setPayOnSupplierAccount(false)
                          setMetodoPagoSeleccionado(method)
                          if (method.kind !== "card_credit") {
                            setCardInstallments("1")
                            setPagoModalAbierto(false)
                          }
                        }}
                        className={compraDialogOptionClass(seleccionado)}
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold leading-snug text-foreground">
                            {method.label}
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

            {metodoPagoSeleccionado?.kind === "card_credit" &&
            !payOnSupplierAccount ? (
              <div className="space-y-2 border-t border-border/50 pt-4">
                <Label htmlFor="purchase-card-installments">Cuotas</Label>
                <Input
                  id="purchase-card-installments"
                  inputMode="numeric"
                  value={cardInstallments}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "")
                    if (!raw) {
                      setCardInstallments("")
                      return
                    }
                    setCardInstallments(String(Math.min(24, Math.max(1, Number(raw)))))
                  }}
                  placeholder="1"
                  className="h-10 rounded-lg"
                />
                <p className="text-xs text-muted-foreground">
                  El proveedor se paga por el total hoy; las cuotas son financiación con la tarjeta.
                </p>
              </div>
            ) : null}
          </div>
          <DialogFooter className={cn(compraDialogFooter, "shrink-0")}>
            <Button
              type="button"
              className={compraDialogPrimaryBtn}
              onClick={() => setPagoModalAbierto(false)}
            >
              Listo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={descuentoModalAbierto} onOpenChange={setDescuentoModalAbierto}>
        <DialogContent className={compraDialogContentMd}>
          <DialogHeader className={compraDialogHeader}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Descuento en la compra
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Alterná % o monto fijo con el botón e ingresá el valor. Se aplica
              sobre el subtotal de ítems.
            </DialogDescription>
          </DialogHeader>
          <div className={compraDialogBody}>
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
                id="purchase-desc-valor"
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
                <span className={compraImporteBaseClass}>
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
          <DialogFooter className={compraDialogFooter}>
            <Button
              type="button"
              variant="ghost"
              className={compraDialogGhostBtn}
              onClick={quitarDescuento}
            >
              Quitar descuento
            </Button>
            <Button
              type="button"
              className={compraDialogPrimaryBtn}
              onClick={aplicarDescuentoModal}
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={descartarConfirmOpen} onOpenChange={setDescartarConfirmOpen}>
        <AlertDialogContent className={compraAlertDialogContent}>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Descartar esta compra?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Se perderán los ítems y datos ingresados. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={limpiarCompra}
              className="border-0 bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
            >
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={comprarConfirmOpen}
        onOpenChange={(open) => {
          setComprarConfirmOpen(open)
          if (!open) setCompraError(null)
        }}
      >
        <AlertDialogContent className={compraAlertDialogContent}>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar compra?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  Vas a registrar una compra por{" "}
                  <span
                    className={cn(
                      compraImporteBaseClass,
                      "font-semibold text-foreground",
                    )}
                  >
                    {fmt.format(total)}
                  </span>{" "}
                  ({itemsDetallados.length}{" "}
                  {itemsDetallados.length === 1 ? "ítem" : "ítems"}): ingreso de
                  stock
                  {payOnSupplierAccount
                    ? " y deuda en cuenta corriente del proveedor"
                    : metodoPagoSeleccionado
                      ? ` y pago con ${metodoPagoSeleccionado.label}${
                          metodoPagoSeleccionado.kind === "card_credit" &&
                          Number(cardInstallments) > 1
                            ? ` (${cardInstallments} cuotas)`
                            : ""
                        }`
                      : ""}
                  .
                </p>
                {compraError ? (
                  <p className="text-sm text-rose-600">{compraError}</p>
                ) : null}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border" disabled={compraSubmitting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              disabled={compraSubmitting}
              onClick={(e) => {
                e.preventDefault()
                void confirmarCompra()
              }}
              className="border-0 bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              {compraSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Procesando…
                </>
              ) : (
                "Confirmar compra"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default withAuth(PurchasesPage)
