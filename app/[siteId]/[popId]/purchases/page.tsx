"use client"

import withAuth from "@/hoc/withAuth"
import Image from "next/image"
import Link from "next/link"
import {
  getPurchaseCatalog,
  type PurchaseCatalogArticle,
  type PurchaseCatalogPaymentMethod,
  type PurchaseCatalogSupplier,
  type PurchaseKind,
} from "@/app/[siteId]/[popId]/purchases/actions"
import { completePurchase } from "@/app/[siteId]/[popId]/purchases/completePurchase"
import { SUPPLIER_ACCOUNT_PAYMENT_LABEL } from "@/lib/operationPaymentLabels"
import { popMenuHref } from "@/lib/popRoutes"
import { getPurchaseDocumentTypeOptions } from "@/lib/purchaseDocumentTypes"
import { DataWorkspaceSectionMenu } from "@/components/layouts/DataWorkspaceSectionMenu"
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
  ArrowLeft,
  Banknote,
  CircleCheck,
  CircleX,
  LayoutGrid,
  Loader2,
  Maximize2,
  Minimize2,
  Minus,
  Package,
  Layers,
  Box,
  Paperclip,
  Percent,
  Plus,
  Receipt,
  Rows3,
  Search,
  Trash2,
  Truck,
  Wifi,
  WifiOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

type VistaCatalogo = { modo: "categoria"; categoria: string }

const CATEGORIA_TODOS = "Todos"

const KIND_LABEL: Record<PurchaseKind, string> = {
  merchandise: "Mercadería",
  raw_material: "Materia prima",
  supply: "Insumo",
}

const PURCHASE_KINDS: PurchaseKind[] = [
  "merchandise",
  "raw_material",
  "supply",
]

const PURCHASE_KIND_MENU_ITEMS = [
  { id: "merchandise", label: "Mercadería", icon: Package },
  { id: "raw_material", label: "Materia prima", icon: Layers },
  { id: "supply", label: "Insumo", icon: Box },
] as const

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
  const { user } = useAuth()

  const [catalogArticles, setCatalogArticles] = useState<PurchaseCatalogArticle[]>(
    [],
  )
  const [suppliers, setSuppliers] = useState<PurchaseCatalogSupplier[]>([])
  const [categoryNames, setCategoryNames] = useState<string[]>([])
  const [popName, setPopName] = useState("")
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [canCreate, setCanCreate] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<
    PurchaseCatalogPaymentMethod[]
  >([])
  const [canReadPaymentMethods, setCanReadPaymentMethods] = useState(false)

  const categoriasNav = useMemo(
    () => [CATEGORIA_TODOS, ...categoryNames],
    [categoryNames],
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
      setSuppliers([])
      setCategoryNames([])
      setPopName("")
      setCanCreate(false)
      setPaymentMethods([])
      setCanReadPaymentMethods(false)
      setCatalogError(res.error)
      setCatalogLoading(false)
      return
    }
    setCatalogArticles(res.articles)
    setSuppliers(res.suppliers)
    setCategoryNames(
      [...new Set(res.categories.map((c) => c.name).filter(Boolean))],
    )
    setPopName(res.popName)
    setCanCreate(res.canCreate)
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
      if (prev && paymentMethods.some((m) => m.id === prev.id)) return prev
      const efectivo = paymentMethods.find((m) => m.kind === "cash")
      return efectivo
        ? { id: efectivo.id, label: efectivo.name, kind: efectivo.kind }
        : null
    })
  }, [canReadPaymentMethods, paymentMethods])

  const productosCatalogo = useMemo(
    () => catalogArticles.map(articleToProducto),
    [catalogArticles],
  )

  const [vistaCatalogo, setVistaCatalogo] = useState<VistaCatalogo>({
    modo: "categoria",
    categoria: CATEGORIA_TODOS,
  })
  const [modoVista, setModoVista] = useState<"grid" | "lista">("grid")
  const [busqueda, setBusqueda] = useState("")
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [itemUnitCosts, setItemUnitCosts] = useState<Record<string, string>>({})
  const [purchaseKind, setPurchaseKind] = useState<PurchaseKind>("merchandise")
  const [proveedorSeleccionado, setProveedorSeleccionado] =
    useState<PurchaseCatalogSupplier | null>(null)
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
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<{
    id: string
    label: string
    kind: string
  } | null>(null)
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

  const documentTypeOptions = useMemo(
    () => getPurchaseDocumentTypeOptions(),
    [],
  )

  const [itemDetalleAbiertoId, setItemDetalleAbiertoId] = useState<string | null>(
    null,
  )
  const [descartarConfirmOpen, setDescartarConfirmOpen] = useState(false)
  const [comprarConfirmOpen, setComprarConfirmOpen] = useState(false)
  const [compraSubmitting, setCompraSubmitting] = useState(false)
  const [compraError, setCompraError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

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

  const subtotal = useMemo(() => {
    return itemsDetallados.reduce((acc, item) => {
      const fallback = item.producto?.precio ?? 0
      const unitCost = parseUnitCost(
        itemUnitCosts[item.productoId] ?? "",
        fallback,
      )
      return acc + unitCost * item.cantidad
    }, 0)
  }, [itemsDetallados, itemUnitCosts])

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
    if (dueDate.trim()) return true
    if (payOnSupplierAccount || metodoPagoSeleccionado != null) return true
    return false
  }, [
    carrito.length,
    proveedorSeleccionado,
    comprobanteConfigurado,
    hayDescuento,
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
        ? proveedorSeleccionado != null
        : canReadPaymentMethods && metodoPagoSeleccionado != null),
    [
      hayItemsEnPedido,
      canCreate,
      payOnSupplierAccount,
      proveedorSeleccionado?.id,
      canReadPaymentMethods,
      metodoPagoSeleccionado?.id,
    ],
  )

  const pagoResumenLabel = useMemo(() => {
    if (payOnSupplierAccount) return SUPPLIER_ACCOUNT_PAYMENT_LABEL
    return metodoPagoSeleccionado?.label ?? "Elegir forma de pago"
  }, [payOnSupplierAccount, metodoPagoSeleccionado])

  const limpiarCompra = useCallback(() => {
    setCarrito([])
    setItemUnitCosts({})
    setProveedorSeleccionado(null)
    setPurchaseKind("merchandise")
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
      return efectivo
        ? { id: efectivo.id, label: efectivo.name, kind: efectivo.kind }
        : null
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
      const res = await completePurchase(popId, {
        supplierId: proveedorSeleccionado?.id ?? null,
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
        paymentMethodId: payOnSupplierAccount
          ? null
          : metodoPagoSeleccionado?.id ?? null,
        lines: carrito.map((i) => {
          const producto = productosCatalogo.find((p) => p.id === i.productoId)
          const fallback = producto?.precio ?? 0
          return {
            articleId: i.productoId,
            quantity: i.cantidad,
            unitCost: parseUnitCost(itemUnitCosts[i.productoId] ?? "", fallback),
          }
        }),
      })
      if (!res.success) {
        setCompraError(res.error)
        return
      }
      setComprarConfirmOpen(false)
      limpiarCompra()
    } finally {
      setCompraSubmitting(false)
    }
  }, [
    popId,
    payOnSupplierAccount,
    cardInstallments,
    metodoPagoSeleccionado,
    proveedorSeleccionado,
    purchaseKind,
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
    limpiarCompra,
  ])

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    const syncFullscreen = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    syncFullscreen()
    document.addEventListener("fullscreenchange", syncFullscreen)
    return () => document.removeEventListener("fullscreenchange", syncFullscreen)
  }, [])

  const proveedoresFiltradosModal = useMemo(() => {
    const q = normalizarBusqueda(busquedaProveedorModal.trim())
    if (!q) return suppliers
    return suppliers.filter(
      (s) =>
        normalizarBusqueda(s.name).includes(q) ||
        normalizarBusqueda(s.taxId).includes(q),
    )
  }, [busquedaProveedorModal, suppliers])

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
    if (itemDetalleAbiertoId === productoId) {
      setItemDetalleAbiertoId(null)
    }
  }

  const toggleItemDetalle = (itemId: string) => {
    setItemDetalleAbiertoId((prev) => (prev === itemId ? null : itemId))
  }

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }
    await document.documentElement.requestFullscreen()
  }

  const toolboxBarClass =
    "border-t border-white/10 bg-[#0b100e]/92 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl sm:p-2.5"
  const toolboxSlotClass = (configurado: boolean) =>
    cn(
      "group flex h-full min-h-[4.5rem] w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-[background-color,border-color,box-shadow] duration-150 sm:min-h-[4.75rem] sm:gap-3 sm:px-3",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b100e]",
      configurado
        ? "border-emerald-500/30 bg-emerald-500/[0.09] shadow-[inset_0_1px_0_rgba(167,243,208,0.08)] hover:border-emerald-400/35 hover:bg-emerald-500/12"
        : "border-white/[0.06] bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.05]",
    )
  const toolboxIconWrap = (configurado: boolean) =>
    cn(
      "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 sm:size-10",
      configurado
        ? "bg-emerald-500/20 text-emerald-200"
        : "bg-white/[0.06] text-foreground/45 group-hover:bg-white/10 group-hover:text-foreground/75",
    )

  const modalOpcionBase =
    "rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
  const modalOpcionSeleccionada =
    "border-primary/55 bg-primary/12 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.25)]"
  const modalOpcionIdle =
    "border-foreground/10 bg-secondary hover:bg-muted"

  const dialogSurface =
    "gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 shadow-2xl ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
  const dialogMaxViewport =
    "max-h-[calc(100vh-100px)] flex flex-col overflow-hidden"
  const dialogSurfaceMd = cn(dialogSurface, dialogMaxViewport, "sm:max-w-md")
  const dialogSurfaceLg = cn(dialogSurface, dialogMaxViewport, "sm:max-w-2xl")
  const dialogHeader =
    "space-y-1.5 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left"
  const dialogBody = "px-6 py-4"
  const dialogFooter =
    "border-t border-border/50 bg-muted/15 px-6 py-3.5 sm:justify-between"
  const dialogPrimaryBtn =
    "h-10 bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700"
  const dialogGhostBtn = "h-10 text-muted-foreground hover:text-foreground"

  const headerUserName = useMemo(() => {
    const meta = user?.user_metadata?.full_name
    if (typeof meta === "string" && meta.trim()) return meta.trim()
    return user?.email?.split("@")[0] || "Usuario"
  }, [user?.email, user?.user_metadata?.full_name])

  const userAvatarSrc =
    user?.user_metadata?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.email || "u")}`

  if (!popId || !siteId) {
    return (
      <div className="min-h-screen bg-[#070a09] p-10 text-sm text-slate-300">
        Punto de venta no encontrado
      </div>
    )
  }

  return (
    <div className="relative h-screen overflow-hidden bg-[#070a09] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.14),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.1),transparent_36%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[38px_38px] opacity-20" />
      </div>

      <div className="relative z-10 grid h-full grid-rows-[4.5rem_minmax(0,1fr)]">
        <header className="shrink-0 border-b border-zinc-800/90 bg-zinc-950/95 text-zinc-100 shadow-sm backdrop-blur-xl">
          <div className="grid h-18 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-4">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href={siteId && popId ? popMenuHref(siteId, popId) : "/home"}
                className="group inline-flex size-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-300 transition-all hover:border-white/15 hover:bg-zinc-800 hover:text-white"
                aria-label="Volver"
              >
                <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-0.5" />
              </Link>
              <div className="h-6 w-px bg-zinc-700" />
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="size-8 overflow-hidden rounded-lg ring-1 ring-zinc-600">
                  <img
                    src={`https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(popId)}&backgroundColor=1a1f1d`}
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
                <span className="truncate text-sm font-semibold text-zinc-100">
                  {popName || (catalogLoading ? "…" : "—")}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <h1 className="text-[1.65rem] font-black tracking-tight text-white">
                Comprar
              </h1>
              <span
                className={cn(
                  "inline-flex size-7 items-center justify-center rounded-full border",
                  isOnline
                    ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/35 bg-red-500/10 text-red-300",
                )}
                role="status"
                aria-label={isOnline ? "En línea" : "Sin conexión"}
                title={isOnline ? "En línea" : "Sin conexión"}
              >
                {isOnline ? (
                  <Wifi className="size-3.5" aria-hidden />
                ) : (
                  <WifiOff className="size-3.5" aria-hidden />
                )}
              </span>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                className="group inline-flex size-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label={
                  isFullscreen
                    ? "Salir de pantalla completa"
                    : "Pantalla completa"
                }
              >
                {isFullscreen ? (
                  <Minimize2 className="size-4.5" />
                ) : (
                  <Maximize2 className="size-4.5" />
                )}
              </button>
              <DataWorkspaceSectionMenu
                headerVariant="dark"
                viewItems={PURCHASE_KIND_MENU_ITEMS}
                activeId={purchaseKind}
                onSelect={(id) => {
                  if (PURCHASE_KINDS.includes(id as PurchaseKind)) {
                    setPurchaseKind(id as PurchaseKind)
                  }
                }}
                viewsSectionLabel="Tipo de compra"
              />
              <div className="h-6 w-px bg-zinc-700" />
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="size-10 ring-1 ring-zinc-600">
                    <AvatarImage src={userAvatarSrc} alt="" />
                    <AvatarFallback className="bg-zinc-800 text-xs text-emerald-300">
                      {headerUserName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border border-card bg-primary" />
                </div>
                <div className="hidden min-w-0 flex-col leading-tight sm:flex">
                  <span className="truncate text-sm font-semibold text-zinc-100">
                    {headerUserName}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90">
                    Compras
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="grid min-h-0 grid-cols-[minmax(0,1fr)_380px]">
          <section className="grid min-h-0 grid-rows-[minmax(0,1fr)_minmax(4.75rem,auto)]">
            <div className="grid min-h-0 grid-cols-[280px_minmax(0,1fr)]">
              <aside className="flex min-h-0 min-w-0 flex-col border-r border-white/10 bg-[#1a2027]">
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
              </aside>

              <section className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] bg-[#20262e]">
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
                              <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                {p.descripcion}
                              </p>
                            </div>
                            <div className={modoVista === "grid" ? "self-end" : "shrink-0"}>
                              <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                Costo unit.
                              </span>
                              <span className="block text-[clamp(1.16rem,1.9vw,1.5rem)] leading-none font-extrabold tracking-tight text-white">
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
                "grid h-full min-h-0 grid-cols-2 gap-2 lg:grid-cols-4",
                toolboxBarClass,
              )}
            >
              <button
                type="button"
                onClick={() => {
                  setBusquedaProveedorModal("")
                  setProveedorModalAbierto(true)
                }}
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
                    {comprobanteTipo ??
                      (documentNumber.trim() ||
                        (comprobanteAdjunto
                          ? comprobanteAdjunto.name
                          : "Tipo y adjunto"))}
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
          </section>

          <aside
            className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] bg-[#eef1f5] text-[#121417]"
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
                  const lineTotal = unitCost * item.cantidad
                  const nombreProducto = item.producto?.nombre ?? "Artículo"

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
                            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                              {fmt.format(unitCost)} c/u
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold tabular-nums text-slate-900">
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
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-xl border border-slate-200/95 bg-white px-3 py-2.5 shadow-sm"
                        >
                          <Label
                            htmlFor={`unit-cost-${itemId}`}
                            className="text-xs text-slate-500"
                          >
                            Costo unitario
                          </Label>
                          <Input
                            id={`unit-cost-${itemId}`}
                            inputMode="decimal"
                            value={itemUnitCosts[itemId] ?? ""}
                            placeholder={fallback > 0 ? String(fallback) : "0"}
                            onChange={(e) => {
                              const raw = e.target.value
                              if (!/^\d*[.,]?\d*$/.test(raw)) return
                              setItemUnitCosts((prev) => ({
                                ...prev,
                                [itemId]: raw,
                              }))
                            }}
                            className="mt-1 h-9"
                          />
                          {item.producto && item.producto.iva > 0 ? (
                            <p className="mt-1.5 text-[11px] text-slate-400">
                              IVA {item.producto.iva}% incluido en el costo
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex min-h-0 flex-col">
              <div className="border-t border-[#d9dee4] bg-[#f8fafc] p-3 text-[#121417]">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!hayContenidoCompra}
                    onClick={() => setDescartarConfirmOpen(true)}
                    className="h-11 gap-2 border-rose-200/90 bg-white font-medium text-rose-700 hover:border-rose-300 hover:bg-rose-50 disabled:opacity-45"
                  >
                    <CircleX className="size-4 shrink-0" />
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
                          : payOnSupplierAccount && !proveedorSeleccionado
                            ? "Elegí un proveedor para comprar a cuenta corriente."
                            : !canCreate
                              ? "No tenés permiso para registrar compras."
                              : undefined
                    }
                    className="h-11 gap-2 border-0 bg-emerald-600 font-semibold uppercase tracking-wide text-white hover:bg-emerald-500 disabled:opacity-45"
                  >
                    <CircleCheck className="size-4 shrink-0" />
                    Comprar
                  </Button>
                </div>
              </div>

              <div
                role="region"
                aria-label="Total de esta compra"
                className="relative flex min-h-19 w-full shrink-0 flex-col justify-center overflow-hidden border-t border-emerald-500/35 px-4 py-3.5 backdrop-blur-xl sm:min-h-20 sm:px-5 sm:py-4"
              >
                <div
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,#07120e_0%,#0c1f17_42%,#061009_100%)]"
                  aria-hidden
                />
                <div className="relative z-10 flex w-full items-end justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/80">
                      Total compra
                    </p>
                    {hayDescuento ? (
                      <p className="mt-1 max-w-44 text-[10px] leading-snug text-white/40">
                        Incluye descuento sobre el subtotal.
                      </p>
                    ) : (
                      <p className="mt-1 text-[10px] leading-snug text-white/40">
                        {KIND_LABEL[purchaseKind]}
                        {proveedorSeleccionado
                          ? ` · ${proveedorSeleccionado.name}`
                          : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex min-w-0 shrink-0 flex-col items-end text-right">
                    {hayDescuento ? (
                      <>
                        <p className="text-[11px] tabular-nums text-white/38 line-through">
                          {fmt.format(subtotal)}
                        </p>
                        <p className="mt-0.5 text-[11px] font-medium tabular-nums text-emerald-300/95">
                          −{fmt.format(descuentoMonto)}
                        </p>
                      </>
                    ) : null}
                    <p className="whitespace-nowrap text-[clamp(1.25rem,2.1vw,1.85rem)] font-black tabular-nums tracking-tight text-white">
                      {fmt.format(total)}
                    </p>
                    <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/32">
                      Pesos argentinos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>

      <Dialog open={proveedorModalAbierto} onOpenChange={setProveedorModalAbierto}>
        <DialogContent className={dialogSurfaceLg}>
          <DialogHeader className={dialogHeader}>
            <DialogTitle>Proveedor</DialogTitle>
            <DialogDescription>
              Elegí el proveedor de esta compra (opcional).
            </DialogDescription>
          </DialogHeader>
          <div className={dialogBody}>
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={busquedaProveedorInputRef}
                value={busquedaProveedorModal}
                onChange={(e) => setBusquedaProveedorModal(e.target.value)}
                placeholder="Buscar por nombre o CUIT…"
                className="pl-9"
              />
            </div>
            <div className="game-scroll max-h-[min(50vh,360px)] space-y-1.5 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  setProveedorSeleccionado(null)
                  setProveedorModalAbierto(false)
                }}
                className={cn(
                  modalOpcionBase,
                  "w-full text-left",
                  !proveedorSeleccionado ? modalOpcionSeleccionada : modalOpcionIdle,
                )}
              >
                Sin proveedor
              </button>
              {proveedoresFiltradosModal.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setProveedorSeleccionado(s)
                    setProveedorModalAbierto(false)
                  }}
                  className={cn(
                    modalOpcionBase,
                    "w-full text-left",
                    proveedorSeleccionado?.id === s.id
                      ? modalOpcionSeleccionada
                      : modalOpcionIdle,
                  )}
                >
                  <span className="block font-semibold">{s.name}</span>
                  {s.taxId ? (
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                      CUIT {s.taxId}
                    </span>
                  ) : null}
                </button>
              ))}
              {suppliers.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No hay proveedores cargados.{" "}
                  <Link
                    href={`/${siteId}/${popId}/suppliers`}
                    className="underline underline-offset-2"
                  >
                    Cargar proveedores
                  </Link>
                </p>
              ) : null}
            </div>
          </div>
          <DialogFooter className={dialogFooter}>
            <Button
              type="button"
              variant="ghost"
              className={dialogGhostBtn}
              onClick={() => setProveedorModalAbierto(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={comprobanteModalAbierto} onOpenChange={setComprobanteModalAbierto}>
        <DialogContent className={cn(dialogSurfaceLg, "text-foreground")}>
          <DialogHeader className={cn(dialogHeader, "shrink-0")}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Tipo de comprobante
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Seleccioná el comprobante del proveedor, completá los datos y adjuntá
              el archivo si lo tenés.
            </DialogDescription>
          </DialogHeader>
          <div
            className={cn(
              dialogBody,
              "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain",
            )}
          >
            <ul
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              role="listbox"
              aria-label="Tipos de comprobante"
            >
              {documentTypeOptions.map((label) => {
                const seleccionado = comprobanteTipo === label
                return (
                  <li key={label} className="min-w-0">
                    <button
                      type="button"
                      role="option"
                      aria-selected={seleccionado}
                      onClick={() => setComprobanteTipo(label)}
                      className={cn(
                        "flex min-h-14 w-full items-center text-left",
                        modalOpcionBase,
                        seleccionado ? modalOpcionSeleccionada : modalOpcionIdle,
                      )}
                    >
                      <span className="text-sm font-semibold leading-snug">
                        {label}
                      </span>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase-due-date">Vencimiento pago</Label>
                <Input
                  id="purchase-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
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
                  className="gap-2"
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
          <DialogFooter className={cn(dialogFooter, "shrink-0")}>
            <Button
              type="button"
              variant="ghost"
              className={dialogGhostBtn}
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
              className={dialogPrimaryBtn}
              onClick={() => setComprobanteModalAbierto(false)}
            >
              Listo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pagoModalAbierto} onOpenChange={setPagoModalAbierto}>
        <DialogContent className={cn(dialogSurfaceLg, "text-foreground")}>
          <DialogHeader className={cn(dialogHeader, "shrink-0")}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Método de pago
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Elegí cómo vas a pagar esta compra al proveedor.
            </DialogDescription>
          </DialogHeader>
          <div
            className={cn(
              dialogBody,
              "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain",
            )}
          >
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Cuenta del proveedor
              </p>
              <button
                type="button"
                className={cn(
                  modalOpcionBase,
                  "w-full text-left",
                  payOnSupplierAccount ? modalOpcionSeleccionada : modalOpcionIdle,
                )}
                onClick={() => {
                  setPayOnSupplierAccount(true)
                  setMetodoPagoSeleccionado(null)
                  setCardInstallments("1")
                  setPagoModalAbierto(false)
                }}
              >
                {SUPPLIER_ACCOUNT_PAYMENT_LABEL}
              </button>
              <p className="mt-2 text-xs text-muted-foreground">
                Recibís la mercadería ahora y registrás la deuda en Proveedores. Podés pagar después.
              </p>
            </div>

            {paymentMethodGroups.length > 0 ? (
              <>
                <Separator className="bg-border/60" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Pago inmediato
                </p>
              </>
            ) : null}

            {paymentMethodGroups.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                No hay medios de pago activos. Podés usar cuenta corriente del proveedor.
              </p>
            ) : (
              paymentMethodGroups.map((g, gi) => (
                <div key={g.kind}>
                  {gi > 0 ? <Separator className="mb-4 bg-border/60" /> : null}
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {g.title}
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {g.items.map((m) => {
                      const seleccionado =
                        !payOnSupplierAccount && metodoPagoSeleccionado?.id === m.id
                      return (
                        <button
                          key={m.id}
                          type="button"
                          className={cn(
                            "flex min-h-12 min-w-0 items-center justify-center px-2 py-2 text-center text-sm font-medium leading-snug",
                            modalOpcionBase,
                            seleccionado
                              ? modalOpcionSeleccionada
                              : modalOpcionIdle,
                          )}
                          onClick={() => {
                            setPayOnSupplierAccount(false)
                            setMetodoPagoSeleccionado({
                              id: m.id,
                              label: m.name,
                              kind: m.kind,
                            })
                            if (m.kind !== "card_credit") {
                              setCardInstallments("1")
                              setPagoModalAbierto(false)
                            }
                          }}
                        >
                          <span className="line-clamp-3 w-full">{m.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
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
                />
                <p className="text-xs text-muted-foreground">
                  El proveedor se paga por el total hoy; las cuotas son financiación con la tarjeta.
                </p>
              </div>
            ) : null}
          </div>
          <DialogFooter className={cn(dialogFooter, "shrink-0")}>
            <Button
              type="button"
              className={cn(dialogPrimaryBtn, "w-full sm:w-auto")}
              onClick={() => setPagoModalAbierto(false)}
            >
              Listo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={descuentoModalAbierto} onOpenChange={setDescuentoModalAbierto}>
        <DialogContent className={cn(dialogSurfaceMd, "text-foreground")}>
          <DialogHeader className={dialogHeader}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Descuento en la compra
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Alterná % o monto fijo e ingresá el valor. Se aplica sobre el
              subtotal de ítems.
            </DialogDescription>
          </DialogHeader>
          <div className={dialogBody}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-foreground/10 bg-muted/50 hover:bg-muted"
                aria-label="Cambiar tipo de descuento"
                onClick={() =>
                  setDescuentoDraftModo((m) =>
                    m === "porcentaje" ? "fijo" : "porcentaje",
                  )
                }
              >
                {descuentoDraftModo === "porcentaje" ? (
                  <Percent className="size-4 text-primary" />
                ) : (
                  <Banknote className="size-4 text-primary" />
                )}
              </button>
              <Input
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
                className="h-11 min-w-0 flex-1 rounded-lg"
              />
            </div>
          </div>
          <DialogFooter className={dialogFooter}>
            <Button
              type="button"
              variant="ghost"
              className={dialogGhostBtn}
              onClick={quitarDescuento}
            >
              Quitar descuento
            </Button>
            <Button
              type="button"
              className={dialogPrimaryBtn}
              onClick={aplicarDescuentoModal}
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={descartarConfirmOpen} onOpenChange={setDescartarConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Descartar esta compra?</AlertDialogTitle>
            <AlertDialogDescription>
              Se perderán los ítems y datos ingresados. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-500"
              onClick={limpiarCompra}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar compra</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a registrar una compra de {KIND_LABEL[purchaseKind]} por{" "}
              {fmt.format(total)} ({itemsDetallados.length}{" "}
              {itemsDetallados.length === 1 ? "ítem" : "ítems"}): ingreso de stock
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
            </AlertDialogDescription>
          </AlertDialogHeader>
          {compraError ? (
            <p role="alert" className="px-6 text-sm text-destructive">
              {compraError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={compraSubmitting}>Volver</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 uppercase tracking-wide hover:bg-emerald-500"
              disabled={compraSubmitting}
              onClick={(e) => {
                e.preventDefault()
                void confirmarCompra()
              }}
            >
              {compraSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Procesando…
                </>
              ) : (
                "Comprar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default withAuth(PurchasesPage)
