"use client"

import withAuth from "@/hoc/withAuth"
import Image from "next/image"
import {
  getPurchaseCatalog,
  type PurchaseCatalogArticle,
  type PurchaseCatalogCategory,
  type PurchaseCatalogArticleCost,
  type PurchaseCatalogPaymentOption,
  type PurchaseCatalogSupplier,
  type PurchaseKind,
} from "@/app/[siteId]/[popId]/purchases/actions"
import { PurchasePaymentMethodDialog } from "@/components/purchase-operation/PurchasePaymentMethodDialog"
import { SimpleOperationCheckoutConfirmDialog } from "@/components/checkout/SimpleOperationCheckoutConfirmDialog"
import {
  PurchaseOperationTicketOrderPanel,
} from "@/components/purchase-operation/PurchaseOperationTicketOrderPanel"
import { PurchaseArticleCostPickerDialog } from "@/components/purchase-operation/PurchaseArticleCostPickerDialog"
import type { PurchaseLineEditInput } from "@/components/purchase-operation/PurchaseCartLineCard"
import { OperationPartyPickerDialog } from "@/components/checkout/OperationPartyPickerDialog"
import { PurchaseComprobantePickerDialog } from "@/components/checkout/PurchaseComprobantePickerDialog"
import { GeneralDiscountDialog } from "@/components/checkout/GeneralDiscountDialog"
import {
  defaultPurchaseCheckoutPaymentSelection,
  isPurchasePaymentSelectionValid,
} from "@/lib/purchaseCheckoutPayment"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"
import {
  CLIENT_IVA_CONDITION_OPTIONS,
} from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import { completePurchase } from "@/app/[siteId]/[popId]/purchases/completePurchase"
import { resolveCatalogProductImage } from "@/lib/menuCatalogProduct"
import { resolveSaleLineDiscount } from "@/lib/saleLineDiscount"
import { SUPPLIER_ACCOUNT_PAYMENT_LABEL } from "@/lib/operationPaymentLabels"
import {
  getPurchaseComprobanteDisplayLabel,
  getPurchaseComprobantePickerOptions,
} from "@/lib/purchaseComprobantePicker"
import {
  DataWorkspaceOperationsLayout,
  OperationsModuleBackdrop,
} from "@/components/layouts-module/DataWorkspaceOperationsLayout"
import { saleOpImporteBaseClass } from "@/components/sale-operation/saleOperationStyles"
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
  LayoutGrid,
  Loader2,
  Percent,
  Plus,
  Receipt,
  Rows3,
  Search,
  Truck,
} from "lucide-react"
import { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import { useCartListScrollHighlight } from "@/hooks/useCartListScrollHighlight"
import { cn } from "@/lib/utils"
import { purchaseCartLineId } from "@/lib/purchaseCartLine"
import { saleQuantityFromCostPurchase } from "@/lib/articleCosts"
import { getLayoutsOperarMainGridClass } from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import {
  LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX,
  layoutsOperarCatalogSidebarAsideWidthClass,
  layoutsOperarCatalogSidebarInnerClass,
} from "@/app/library/layouts/layoutsOperarStyles"
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
type Producto = {
  id: string
  nombre: string
  descripcion: string
  iva: number
  categoria: string
  imagen: string
  unitOfMeasure: string
  costs: PurchaseCatalogArticleCost[]
}

type ItemCarrito = {
  lineId: string
  productoId: string
  articleCostId: string
  cantidad: number
}

type ProveedorCompraSeleccionado = {
  id: string | null
  manual: boolean
  name: string
  taxId: string
  ivaCondition: string | null
}

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
    const cost = article?.costs.find((c) => c.id === item.articleCostId)
    if (!article || !cost) continue
    const saleQty = saleQuantityFromCostPurchase(
      item.cantidad,
      cost.saleUnitsPerCostUnit,
    )
    counts.set(
      article.itemKind,
      (counts.get(article.itemKind) ?? 0) + saleQty,
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
    iva: a.iva,
    categoria: a.categoryName.trim() ? a.categoryName : "—",
    imagen: resolveCatalogProductImage(a.id, a.imageUrl),
    unitOfMeasure: a.unitOfMeasure,
    costs: a.costs,
  }
}

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

function catalogArticleCostHint(producto: Producto): string {
  const active = producto.costs.filter((c) => c.unitPrice > 0)
  if (producto.costs.length === 0) return "Sin costos"
  if (active.length === 0) {
    return `${producto.costs.length} costo${producto.costs.length === 1 ? "" : "s"}`
  }
  const min = Math.min(...active.map((c) => c.unitPrice))
  if (producto.costs.length === 1) {
    const cost = producto.costs[0]
    return `${fmt.format(min)} / ${cost.costUnitLabel}`
  }
  return `Desde ${fmt.format(min)}`
}

const compraImporteBaseClass = saleOpImporteBaseClass
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
  const [popName, setPopName] = useState("")
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [canCreate, setCanCreate] = useState(false)
  const [canUpdateArticles, setCanUpdateArticles] = useState(false)
  const [treasuryPaymentContext, setTreasuryPaymentContext] =
    useState<TreasuryPaymentContext | null>(null)
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
      setPopName("")
      setCanCreate(false)
      setCanUpdateArticles(false)
      setTreasuryPaymentContext(null)
      setCanReadPaymentMethods(false)
      setCatalogError(res.error)
      setCatalogLoading(false)
      return
    }
    setCatalogArticles(res.articles)
    setCatalogCategories(res.categories)
    setPopName(res.popName)
    setCanCreate(res.canCreate)
    setCanUpdateArticles(res.canUpdateArticles)
    setTreasuryPaymentContext(res.treasuryPaymentContext)
    setCanReadPaymentMethods(res.canReadPaymentMethods)
    setCatalogError(null)
    setCatalogLoading(false)
  }, [popId, siteId])

  useEffect(() => {
    void loadCatalog()
  }, [loadCatalog])

  useEffect(() => {
    if (!canReadPaymentMethods || !treasuryPaymentContext) return
    setMetodoPagoSeleccionado((prev) => {
      if (prev && isPurchasePaymentSelectionValid(prev, treasuryPaymentContext)) {
        return prev
      }
      return defaultPurchaseCheckoutPaymentSelection(treasuryPaymentContext)
    })
  }, [canReadPaymentMethods, treasuryPaymentContext])

  const [vistaCatalogo, setVistaCatalogo] = useState<VistaCatalogo>({
    modo: "categoria",
    categoria: CATEGORIA_TODOS,
  })
  const [modoVista, setModoVista] = useState<"grid" | "lista">("grid")
  const [busqueda, setBusqueda] = useState("")
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [costPickerArticleId, setCostPickerArticleId] = useState<string | null>(
    null,
  )
  const [costPickerOpen, setCostPickerOpen] = useState(false)
  const cartScrollHighlight = useCartListScrollHighlight()
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
  const [comprobanteModalAbierto, setComprobanteModalAbierto] = useState(false)
  const [pagoModalAbierto, setPagoModalAbierto] = useState(false)
  const [descuentoModalAbierto, setDescuentoModalAbierto] = useState(false)
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] =
    useState<PurchaseCatalogPaymentOption | null>(null)
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

  const confirmSupplierLabel = useMemo(
    () =>
      proveedorSeleccionado?.name?.trim() ||
      manualNombreProveedor.trim() ||
      compraPadron.razonSocial.trim() ||
      "Sin proveedor",
    [
      proveedorSeleccionado?.name,
      manualNombreProveedor,
      compraPadron.razonSocial,
    ],
  )

  const confirmComprobanteLabel = useMemo(() => {
    if (comprobanteTipo != null) return comprobanteTipo
    if (comprobanteAdjunto) return comprobanteAdjunto.name
    return comprobanteDisplayLabel
  }, [comprobanteTipo, comprobanteAdjunto, comprobanteDisplayLabel])

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
      .map((i) => {
        const producto = productosCatalogo.find((p) => p.id === i.productoId)
        const cost = producto?.costs.find((c) => c.id === i.articleCostId)
        return {
          ...i,
          producto,
          cost,
        }
      })
      .filter((i) => i.producto && i.cost)
  }, [carrito, productosCatalogo])

  const subtotalOriginal = useMemo(() => {
    return itemsDetallados.reduce((acc, item) => {
      const fallback = item.cost?.unitPrice ?? 0
      const unitCost = parseUnitCost(
        itemUnitCosts[item.lineId] ?? "",
        fallback,
      )
      return acc + unitCost * item.cantidad
    }, 0)
  }, [itemsDetallados, itemUnitCosts])

  const subtotal = useMemo(() => {
    return itemsDetallados.reduce((acc, item) => {
      const itemId = item.lineId
      const fallback = item.cost?.unitPrice ?? 0
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
    setMetodoPagoSeleccionado(() =>
      treasuryPaymentContext
        ? defaultPurchaseCheckoutPaymentSelection(treasuryPaymentContext)
        : null,
    )
    setDescartarConfirmOpen(false)
    setComprarConfirmOpen(false)
    setCompraError(null)
    const today = new Date()
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    setDocumentDate(iso)
  }, [treasuryPaymentContext])

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
          const detalle = itemsDetallados.find((d) => d.lineId === i.lineId)
          const fallback = detalle?.cost?.unitPrice ?? 0
          return {
            articleId: i.productoId,
            articleCostId: i.articleCostId,
            costQuantity: i.cantidad,
            unitCost: parseUnitCost(itemUnitCosts[i.lineId] ?? "", fallback),
            updateArticleCost: itemUpdateArticleCost[i.lineId] === true,
            itemDiscountMode: itemDescuentoModo[i.lineId] ?? "porcentaje",
            itemDiscountDraft: itemDescuentoDraft[i.lineId] ?? "",
            comment: itemComentarios[i.lineId] ?? "",
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
    itemsDetallados,
    itemUnitCosts,
    itemUpdateArticleCost,
    itemDescuentoModo,
    itemDescuentoDraft,
    itemComentarios,
    limpiarCompra,
    loadCatalog,
  ])

  const proveedorCatalogoBloqueado =
    proveedorSeleccionado != null && !proveedorSeleccionado.manual

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

  const compraIvaLabel = useMemo(
    () =>
      labelCondicionIva(
        proveedorSeleccionado?.ivaCondition ?? compraIvaCondition,
      ),
    [compraIvaCondition, proveedorSeleccionado?.ivaCondition],
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

  const agregarCostoAlCarrito = useCallback(
    (productoId: string, cost: PurchaseCatalogArticleCost) => {
      const lineId = purchaseCartLineId(productoId, cost.id)
      setCarrito((prev) => {
        const existe = prev.find((i) => i.lineId === lineId)
        if (existe) {
          return prev.map((i) =>
            i.lineId === lineId ? { ...i, cantidad: i.cantidad + 1 } : i,
          )
        }
        return [
          ...prev,
          {
            lineId,
            productoId,
            articleCostId: cost.id,
            cantidad: 1,
          },
        ]
      })
      cartScrollHighlight.notifyLineAdded(lineId)
      setItemUnitCosts((prev) => {
        if (prev[lineId]?.trim()) return prev
        return {
          ...prev,
          [lineId]:
            cost.unitPrice > 0 ? String(cost.unitPrice) : prev[lineId] ?? "",
        }
      })
    },
    [cartScrollHighlight],
  )

  const agregarAlCarrito = (productoId: string) => {
    const producto = productosCatalogo.find((p) => p.id === productoId)
    if (!producto) return
    if (producto.costs.length === 0) {
      setCompraError(
        "Este artículo no tiene costos de compra. Configuralos en Stock.",
      )
      return
    }
    if (producto.costs.length === 1) {
      agregarCostoAlCarrito(productoId, producto.costs[0])
      return
    }
    setCostPickerArticleId(productoId)
    setCostPickerOpen(true)
  }

  const establecerCantidad = (lineId: string, cantidad: number) => {
    setCarrito((prev) =>
      prev
        .map((i) => (i.lineId === lineId ? { ...i, cantidad } : i))
        .filter((i) => i.cantidad > 0),
    )
  }

  const cambiarCantidad = (lineId: string, delta: number) => {
    setCarrito((prev) =>
      prev
        .map((i) => {
          if (i.lineId !== lineId) return i
          const next = Math.round((i.cantidad + delta) * 1e6) / 1e6
          return { ...i, cantidad: next }
        })
        .filter((i) => i.cantidad > 0),
    )
  }

  const quitarDelCarrito = (lineId: string) => {
    setCarrito((prev) => prev.filter((i) => i.lineId !== lineId))
    setItemUnitCosts((prev) => {
      const next = { ...prev }
      delete next[lineId]
      return next
    })
    setItemUpdateArticleCost((prev) => {
      const next = { ...prev }
      delete next[lineId]
      return next
    })
    setItemDescuentoModo((prev) => {
      const next = { ...prev }
      delete next[lineId]
      return next
    })
    setItemDescuentoDraft((prev) => {
      const next = { ...prev }
      delete next[lineId]
      return next
    })
    setItemComentarios((prev) => {
      const next = { ...prev }
      delete next[lineId]
      return next
    })
  }

  const aplicarEdicionLineaCompra = useCallback((input: PurchaseLineEditInput) => {
    const {
      lineId,
      quantity,
      unitCost,
      updateArticleCost,
      discountMode,
      discountDraft,
      comment,
      hasQuantityEdit,
      hasCostEdit,
      hasUpdateCostEdit,
      hasDiscountEdit,
      hasCommentEdit,
    } = input

    if (hasQuantityEdit) {
      establecerCantidad(lineId, quantity)
    }
    if (hasCostEdit) {
      setItemUnitCosts((prev) => ({ ...prev, [lineId]: unitCost }))
    }
    if (hasUpdateCostEdit) {
      setItemUpdateArticleCost((prev) => ({
        ...prev,
        [lineId]: updateArticleCost,
      }))
    }
    if (hasDiscountEdit) {
      setItemDescuentoModo((prev) => ({
        ...prev,
        [lineId]: discountMode,
      }))
      setItemDescuentoDraft((prev) => ({
        ...prev,
        [lineId]: discountDraft,
      }))
    }
    if (hasCommentEdit) {
      setItemComentarios((prev) => ({ ...prev, [lineId]: comment }))
    }
  }, [])

  const purchaseCartLines = useMemo(
    () =>
      itemsDetallados.map((item) => {
        const cost = item.cost!
        const costLabel = cost.name.trim() || cost.costUnitLabel
        return {
          lineId: item.lineId,
          productoId: item.productoId,
          articleCostId: item.articleCostId,
          cantidad: item.cantidad,
          nombre: item.producto?.nombre ?? "Artículo",
          costLabel,
          costUnitLabel: cost.costUnitLabel,
          saleUnitsPerCostUnit: cost.saleUnitsPerCostUnit,
          descripcion: item.producto?.descripcion,
          fallbackCost: cost.unitPrice,
          iva: item.producto?.iva,
          unitOfMeasure: item.producto?.unitOfMeasure ?? "",
        }
      }),
    [itemsDetallados],
  )

  const purchaseCartOverrides = useMemo(
    () => ({
      itemUnitCosts,
      itemUpdateArticleCost,
      itemDescuentoModo,
      itemDescuentoDraft,
      itemComentarios,
    }),
    [
      itemUnitCosts,
      itemUpdateArticleCost,
      itemDescuentoModo,
      itemDescuentoDraft,
      itemComentarios,
    ],
  )

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

  const compraAlertDialogContent = cn(
    "rootsy-app-light text-foreground",
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
      <DataWorkspaceOperationsLayout
        siteId={siteId}
        popId={popId}
        popName={popName}
        title="Comprar"
        loading={catalogLoading}
        userName={headerUserName}
        userAvatarSrc={userAvatarSrc}
        sidebarCollapsible
        sidebarEdgeToggle={false}
        sidebarOpen={catalogSidebarOpen}
        onSidebarOpenChange={setCatalogSidebarOpen}
      >
        <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
          <OperationsModuleBackdrop />

          <main className={cn("relative z-10 grid min-h-0 flex-1", getLayoutsOperarMainGridClass())}>
            <div className="col-start-1 row-start-1 flex min-h-0 min-w-0 overflow-hidden">
              <aside
                id="data-workspace-sidebar"
                className={cn(
                  "relative shrink-0 overflow-hidden border-r border-white/10 bg-[#1a2027] transition-[width,border-color] duration-300 ease-in-out motion-reduce:transition-none",
                  layoutsOperarCatalogSidebarAsideWidthClass(catalogSidebarOpen),
                )}
                aria-hidden={!catalogSidebarOpen}
                {...(!catalogSidebarOpen ? { inert: true } : {})}
                aria-label="Filtros del catálogo"
              >
                <div className={layoutsOperarCatalogSidebarInnerClass}>
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
                              sizes={modoVista === "grid" ? "33vw" : `${LAYOUTS_OPERAR_CATALOG_SIDEBAR_WIDTH_PX}px`}
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
                              <span className={cn(compraImporteCardClass, "text-base")}>
                                {catalogArticleCostHint(p)}
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
            className="rootsy-app-light col-start-2 row-span-2 grid min-h-0 overflow-hidden grid-rows-[minmax(0,1fr)] bg-[#eef1f5] text-[#121417]"
            aria-label="Carrito de la compra"
          >
            <PurchaseOperationTicketOrderPanel
              lines={purchaseCartLines}
              overrides={purchaseCartOverrides}
              canUpdateArticles={canUpdateArticles}
              onApplyLineEdits={aplicarEdicionLineaCompra}
              onRemoveLine={quitarDelCarrito}
              listTitle="Tu compra"
              emptyTitle="Compra vacía"
              cartScrollHighlight={cartScrollHighlight}
              actions={{
                discardDisabled: !hayItemsEnPedido,
                confirmDisabled: !puedeComprar || compraSubmitting,
                confirmLoading: compraSubmitting,
                onDiscard: () => setDescartarConfirmOpen(true),
                onConfirm: () => {
                  setCompraError(null)
                  setComprarConfirmOpen(true)
                },
                confirmLabel: "Comprar",
                confirmTitle: !hayItemsEnPedido
                  ? "Agregá artículos a la compra."
                  : !payOnSupplierAccount && !metodoPagoSeleccionado
                    ? "Elegí cómo vas a pagar o usá cuenta corriente."
                    : payOnSupplierAccount && !proveedorSeleccionado?.id
                      ? "Elegí un proveedor del catálogo para comprar a cuenta corriente."
                      : !canCreate
                        ? "No tenés permiso para registrar compras."
                        : undefined,
              }}
              totalBar={{
                total,
                subtotal,
                descuentoMonto,
                hayDescuento,
                subtotalOriginal,
                descuentoItemsMonto,
                hayDescuentoItems,
                totalLabel: "Total a pagar",
                totalAriaLabel: "Total a pagar",
              }}
            />
          </aside>
        </main>
        </div>
      </DataWorkspaceOperationsLayout>

      <OperationPartyPickerDialog
        popId={popId ?? ""}
        flow="purchase"
        context="compra"
        open={proveedorModalAbierto}
        onOpenChange={(open) => {
          setProveedorModalAbierto(open)
          if (open && proveedorSeleccionado?.manual) {
            setManualNombreProveedor(proveedorSeleccionado.name)
            setProveedorTaxId(proveedorSeleccionado.taxId)
            setCompraIvaCondition(proveedorSeleccionado.ivaCondition ?? "")
          }
        }}
        canSearchCatalog={Boolean(popId)}
        manualName={manualNombreProveedor}
        onManualNameChange={setManualNombreProveedor}
        taxId={proveedorTaxId}
        onTaxIdChange={setProveedorTaxId}
        ivaCondition={compraIvaCondition}
        onIvaConditionChange={setCompraIvaCondition}
        selected={proveedorSeleccionado}
        padron={compraPadron}
        catalogBlocked={proveedorCatalogoBloqueado}
        onSelectCatalogParty={(party) =>
          seleccionarProveedorCatalogo({
            id: party.id,
            name: party.name,
            taxId: party.taxId ?? "",
          })
        }
        onSelectManual={seleccionarProveedorManual}
        onClearSelection={quitarProveedorCompra}
      />

      <PurchaseComprobantePickerDialog
        open={comprobanteModalAbierto}
        onOpenChange={setComprobanteModalAbierto}
        options={comprobantePickerOptions}
        comprobanteTipo={comprobanteTipo}
        onComprobanteTipoChange={setComprobanteTipo}
        documentNumber={documentNumber}
        onDocumentNumberChange={setDocumentNumber}
        documentDate={documentDate}
        onDocumentDateChange={setDocumentDate}
        dueDate={dueDate}
        onDueDateChange={setDueDate}
        attachment={comprobanteAdjunto}
        onAttachmentChange={setComprobanteAdjunto}
        attachmentInputRef={comprobanteAdjuntoInputRef}
      />

      <PurchasePaymentMethodDialog
        open={pagoModalAbierto}
        onOpenChange={setPagoModalAbierto}
        treasuryContext={treasuryPaymentContext}
        selected={metodoPagoSeleccionado}
        payOnSupplierAccount={payOnSupplierAccount}
        cardInstallments={cardInstallments}
        onCardInstallmentsChange={setCardInstallments}
        onSelectImmediate={(option) => {
          setPayOnSupplierAccount(false)
          setMetodoPagoSeleccionado(option)
          if (option?.kind !== "card_credit") {
            setCardInstallments("1")
          }
        }}
        onSelectSupplierAccount={() => {
          setPayOnSupplierAccount(true)
          setMetodoPagoSeleccionado(null)
          setCardInstallments("1")
        }}
      />

      <GeneralDiscountDialog
        open={descuentoModalAbierto}
        onOpenChange={setDescuentoModalAbierto}
        context="compra"
        subtotal={subtotal}
        draftMode={descuentoDraftModo}
        onDraftModeChange={setDescuentoDraftModo}
        draftText={descuentoDraftTexto}
        onDraftTextChange={setDescuentoDraftTexto}
        onApply={aplicarDescuentoModal}
        onClear={quitarDescuento}
      />

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

      <SimpleOperationCheckoutConfirmDialog
        open={comprarConfirmOpen}
        onOpenChange={(open) => {
          setComprarConfirmOpen(open)
          if (!open) setCompraError(null)
        }}
        title="Confirmar compra"
        confirmLabel="Confirmar compra"
        submitting={compraSubmitting}
        submitError={compraError}
        total={total}
        subtotal={subtotal}
        descuentoMonto={descuentoMonto}
        hayDescuento={hayDescuento}
        partyLabel="Proveedor"
        partyValue={confirmSupplierLabel}
        partyIcon={Truck}
        comprobanteLabel={confirmComprobanteLabel}
        paymentLabel={pagoResumenLabel}
        onConfirm={confirmarCompra}
      />

      <PurchaseArticleCostPickerDialog
        open={costPickerOpen}
        onOpenChange={(open) => {
          setCostPickerOpen(open)
          if (!open) setCostPickerArticleId(null)
        }}
        articleName={
          productosCatalogo.find((p) => p.id === costPickerArticleId)?.nombre ??
          "Artículo"
        }
        saleUnitOfMeasure={
          productosCatalogo.find((p) => p.id === costPickerArticleId)
            ?.unitOfMeasure ?? "unidad"
        }
        costs={
          productosCatalogo.find((p) => p.id === costPickerArticleId)?.costs ?? []
        }
        onSelect={(cost) => {
          if (!costPickerArticleId) return
          setCompraError(null)
          agregarCostoAlCarrito(costPickerArticleId, cost)
          setCostPickerArticleId(null)
        }}
      />
    </>
  )
}

export default withAuth(PurchasesPage)
