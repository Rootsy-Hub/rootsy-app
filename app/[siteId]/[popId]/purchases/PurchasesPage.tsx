"use client"

import { PopModuleLoading } from "@/app/[siteId]/[popId]/PopModuleLoading"
import { RootsIconButton } from "@/components/rootsy-button"
import dynamic from "next/dynamic"
import {
  type PurchaseCatalogArticle,
  type PurchaseCatalogArticleCost,
  type PurchaseCatalogPaymentOption,
  type PurchaseCatalogSupplier,
} from "@/app/[siteId]/[popId]/purchases/actions"
import { usePurchaseCatalogLoader } from "@/hooks/usePurchaseCatalogLoader"
import { invalidatePopOperateCatalogs } from "@/lib/invalidatePopOperateCatalogs"
import { useQueryClient } from "@tanstack/react-query"
import { PurchaseCatalogBrowser } from "@/components/purchase-operation/PurchaseCatalogBrowser"
import { PurchaseOperationToolbox } from "@/components/purchase-operation/PurchaseOperationToolbox"
import { SaleOperationDiscountHeaderButton } from "@/components/sale-operation/SaleOperationDiscountHeaderButton"
import { PurchaseOperationTicketOrderPanel } from "@/components/purchase-operation/PurchaseOperationTicketOrderPanel"
import type { PurchaseCatalogProduct } from "@/components/purchase-operation/purchaseCatalogTypes"
import type { PurchaseLineEditInput } from "@/components/purchase-operation/PurchaseCartLineCard"

const PurchasePaymentMethodDialog = dynamic(
  () =>
    import("@/components/purchase-operation/PurchasePaymentMethodDialog").then(
      (mod) => mod.PurchasePaymentMethodDialog,
    ),
  { ssr: false },
)
const SimpleOperationCheckoutConfirmDialog = dynamic(
  () =>
    import("@/components/checkout/SimpleOperationCheckoutConfirmDialog").then(
      (mod) => mod.SimpleOperationCheckoutConfirmDialog,
    ),
  { ssr: false },
)
const PurchaseArticleCostPickerDialog = dynamic(
  () =>
    import("@/components/purchase-operation/PurchaseArticleCostPickerDialog").then(
      (mod) => mod.PurchaseArticleCostPickerDialog,
    ),
  { ssr: false },
)
const OperationPartyPickerDialog = dynamic(
  () =>
    import("@/components/checkout/OperationPartyPickerDialog").then(
      (mod) => mod.OperationPartyPickerDialog,
    ),
  { ssr: false },
)
const PurchaseComprobantePickerDialog = dynamic(
  () =>
    import("@/components/checkout/PurchaseComprobantePickerDialog").then(
      (mod) => mod.PurchaseComprobantePickerDialog,
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
  defaultPurchaseCheckoutPaymentSelection,
  isPurchasePaymentSelectionValid,
  resolvePurchaseToolboxPaymentDisplay,
} from "@/lib/purchaseCheckoutPayment"
import {
  CLIENT_IVA_CONDITION_OPTIONS,
} from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import { completePurchase } from "@/app/[siteId]/[popId]/purchases/completePurchase"
import {
  createPurchaseOrder,
  fetchPurchaseOrderDetail,
} from "@/lib/rootsyApi/purchaseOrdersClient"
import { resolveCatalogProductImage } from "@/lib/menuCatalogProduct"
import { resolveSaleLineDiscount } from "@/lib/saleLineDiscount"
import { SUPPLIER_ACCOUNT_PAYMENT_LABEL } from "@/lib/operationPaymentLabels"
import { partyCanOperateOnCurrentAccount } from "@/lib/currentAccounts"
import {
  getPurchaseComprobanteDisplayLabel,
  getPurchaseComprobantePickerOptions,
} from "@/lib/purchaseComprobantePicker"
import {
  DataWorkspaceOperationsLayout,
  OperationsModuleBackdrop,
} from "@/components/layouts-module/DataWorkspaceOperationsLayout"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { LayoutsOperarMainGrid } from "@/components/layouts-module/LayoutsOperarMainGrid"
import { LayoutsOperarSaleCheckoutFloor } from "@/components/layouts-module/LayoutsOperarSaleCheckoutFloor"
import {
  layoutsOperarSummaryPanelClass,
  layoutsOperarSummaryPanelMobileStackClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { useDataWorkspaceSidebar } from "@/components/layouts/useDataWorkspaceSidebar"
import { useAuth } from "@/context/AuthContextSupabase"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useParams, useRouter, useSearchParams } from "@/lib/pop-spa/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { Loader2, Truck, FileText } from "lucide-react"
import { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import { useCartListScrollHighlight } from "@/hooks/useCartListScrollHighlight"
import { cn } from "@/lib/utils"
import { derivePurchaseKindFromCartItems } from "@/lib/purchaseKind"
import { purchaseCartLineId } from "@/lib/purchaseCartLine"
import {
  buildPurchaseOrderCheckoutSnapshot,
  buildPurchaseOrderLineSummariesFromCart,
  formatPurchaseOrderDiscountLabel,
  formatPurchaseOrderPaymentLabel,
} from "@/lib/purchaseOrderCheckout"
import type { PurchaseCheckoutSnapshot } from "@/lib/purchaseOrderCheckoutState"
import {
  RootsAlertDialogContent,
  RootsAlertDialogFooter,
  RootsAlertDialogPanel,
} from "@/components/rootsy-dialog"
import { AlertDialog } from "@/components/ui/alert-dialog"
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

function articleToProducto(a: PurchaseCatalogArticle): PurchaseCatalogProduct {
  return {
    id: a.id,
    nombre: a.name,
    descripcion: a.description.trim() ? a.description : "—",
    iva: a.iva,
    categoria: a.categoryName.trim() ? a.categoryName : "—",
    categoriaFiltro: `${a.itemKind}:${a.categoryId}`,
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

function parseUnitCost(raw: string, fallback: number): number {
  const n = Number.parseFloat(raw.trim().replace(",", "."))
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.round(n * 100) / 100
}

function PurchasesPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderIdFromUrl = searchParams.get("orderId")
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined
  const queryClient = useQueryClient()
  const {
    open: catalogSidebarOpen,
    setOpen: setCatalogSidebarOpen,
  } = useDataWorkspaceSidebar(siteId, popId ?? "", Boolean(popId))
  const { user } = useAuth()
  const { bootstrap } = usePopWorkspace()

  const {
    catalogArticles,
    catalogCategorySections,
    canCreate,
    canUpdateArticles,
    treasuryPaymentContext,
    canReadPaymentMethods,
    mergeCatalogArticles,
    ensureCatalogArticles,
    catalogLoading: catalogQueryLoading,
    catalogPending: catalogQueryPending,
    catalogError: catalogQueryError,
  } = usePurchaseCatalogLoader(popId, { enabled: Boolean(popId && siteId) })
  const catalogLoading = !popId || !siteId ? false : catalogQueryLoading
  const catalogError =
    !popId || !siteId ? "Punto de venta no encontrado" : catalogQueryError

  const productosCatalogo = useMemo(
    () => catalogArticles.map(articleToProducto),
    [catalogArticles],
  )

  useEffect(() => {
    if (!canReadPaymentMethods || !treasuryPaymentContext || orderIdFromUrl) return
    setMetodoPagoSeleccionado((prev) => {
      if (prev && isPurchasePaymentSelectionValid(prev, treasuryPaymentContext)) {
        return prev
      }
      return defaultPurchaseCheckoutPaymentSelection(treasuryPaymentContext)
    })
  }, [canReadPaymentMethods, treasuryPaymentContext, orderIdFromUrl])

  const [carrito, setCarrito] = useState<ItemCarrito[]>([])

  useEffect(() => {
    void ensureCatalogArticles(carrito.map((item) => item.productoId))
  }, [carrito, ensureCatalogArticles])
  const [costPickerArticleId, setCostPickerArticleId] = useState<string | null>(
    null,
  )
  const [costPickerOpen, setCostPickerOpen] = useState(false)
  const [costPickerPendingQty, setCostPickerPendingQty] = useState(1)
  const cartScrollHighlight = useCartListScrollHighlight(orderIdFromUrl)
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
  const [itemExpiresAt, setItemExpiresAt] = useState<Record<string, string>>({})
  const [descartarConfirmOpen, setDescartarConfirmOpen] = useState(false)
  const [comprarConfirmOpen, setComprarConfirmOpen] = useState(false)
  const [compraSubmitting, setCompraSubmitting] = useState(false)
  const [compraError, setCompraError] = useState<string | null>(null)
  const [ordenConfirmOpen, setOrdenConfirmOpen] = useState(false)
  const [ordenSubmitting, setOrdenSubmitting] = useState(false)
  const [ordenError, setOrdenError] = useState<string | null>(null)

  const orderLoadRef = useRef<string | null>(null)
  const orderLoadingRef = useRef<string | null>(null)
  const [orderRestorePending, setOrderRestorePending] = useState(
    () => Boolean(orderIdFromUrl),
  )

  useEffect(() => {
    if (!orderIdFromUrl) {
      setOrderRestorePending(false)
      return
    }
    if (orderLoadRef.current !== orderIdFromUrl) {
      setOrderRestorePending(true)
    }
  }, [orderIdFromUrl])

  useEffect(() => {
    const today = new Date()
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    setDocumentDate(iso)
  }, [])

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
    if (Object.values(itemExpiresAt).some((c) => c?.trim())) return true
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
    itemExpiresAt,
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
        ? partyCanOperateOnCurrentAccount(proveedorSeleccionado)
        : canReadPaymentMethods && metodoPagoSeleccionado != null),
    [
      hayItemsEnPedido,
      canCreate,
      payOnSupplierAccount,
      proveedorSeleccionado,
      canReadPaymentMethods,
      metodoPagoSeleccionado?.treasuryAccountId,
    ],
  )

  const pagoResumenLabel = useMemo(() => {
    if (payOnSupplierAccount) return SUPPLIER_ACCOUNT_PAYMENT_LABEL
    return metodoPagoSeleccionado?.label ?? "Elegir forma de pago"
  }, [payOnSupplierAccount, metodoPagoSeleccionado])

  const toolboxPaymentDisplay = useMemo(
    () =>
      resolvePurchaseToolboxPaymentDisplay({
        payOnSupplierAccount,
        metodoPagoSeleccionado,
        treasuryPaymentContext,
      }),
    [payOnSupplierAccount, metodoPagoSeleccionado, treasuryPaymentContext],
  )

  const comprobanteToolboxLabel = useMemo(() => {
    if (comprobanteTipo != null) return comprobanteTipo
    if (documentNumber.trim()) return documentNumber.trim()
    if (comprobanteAdjunto) return comprobanteAdjunto.name
    return comprobanteDisplayLabel
  }, [comprobanteTipo, documentNumber, comprobanteAdjunto, comprobanteDisplayLabel])

  const descuentoToolboxLabel = useMemo(
    () =>
      hayDescuento
        ? modoDescuento === "porcentaje"
          ? `${valorDescuentoPorcentaje}%`
          : `Fijo ${fmt.format(valorDescuentoFijo)}`
        : "Sin descuento",
    [hayDescuento, modoDescuento, valorDescuentoPorcentaje, valorDescuentoFijo],
  )

  const limpiarCompra = useCallback(() => {
    setCarrito([])
    setItemUnitCosts({})
    setItemUpdateArticleCost({})
    setItemDescuentoModo({})
    setItemDescuentoDraft({})
    setItemComentarios({})
    setItemExpiresAt({})
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
    if (
      !payOnSupplierAccount &&
      metodoPagoSeleccionado?.kind === "check" &&
      !metodoPagoSeleccionado.checkDetails
    ) {
      return
    }
    setCompraError(null)
    setCompraSubmitting(true)
    try {
      const purchaseKind = derivePurchaseKindFromCartItems(carrito, catalogArticles)
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
        checkDetails:
          !payOnSupplierAccount && metodoPagoSeleccionado?.kind === "check"
            ? metodoPagoSeleccionado.checkDetails ?? null
            : null,
        lines: carrito.map((i) => {
          const detalle = itemsDetallados.find((d) => d.lineId === i.lineId)
          const fallback = detalle?.cost?.unitPrice ?? 0
          return {
            articleId: i.productoId,
            articleCostId: i.articleCostId,
            costQuantity: i.cantidad,
            unitCost: parseUnitCost(itemUnitCosts[i.lineId] ?? "", fallback),
            updateArticleCost: itemUpdateArticleCost[i.lineId] !== false,
            itemDiscountMode: itemDescuentoModo[i.lineId] ?? "porcentaje",
            itemDiscountDraft: itemDescuentoDraft[i.lineId] ?? "",
            comment: itemComentarios[i.lineId] ?? "",
            expiresOn: itemExpiresAt[i.lineId] || null,
          }
        }),
      })
      if (!res.success) {
        setCompraError(res.error)
        return
      }
      setComprarConfirmOpen(false)
      limpiarCompra()
      if (popId) invalidatePopOperateCatalogs(queryClient, popId)
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
    itemExpiresAt,
    limpiarCompra,
    queryClient,
  ])

  const ordenComprobanteLabel = confirmComprobanteLabel || "Sin comprobante"
  const ordenPaymentLabel = pagoConfigurado
    ? pagoResumenLabel
    : "Sin medio de pago"
  const ordenDiscountLabel = formatPurchaseOrderDiscountLabel({
    modoDescuento,
    valorDescuentoPorcentaje,
    valorDescuentoFijo,
    descuentoMonto,
  })

  const aplicarOrdenEnCompra = useCallback(
    (snapshot: PurchaseCheckoutSnapshot) => {
      setCarrito(snapshot.carrito.map((item) => ({ ...item })))
      setProveedorSeleccionado(snapshot.proveedorSeleccionado)
      setManualNombreProveedor(snapshot.manualNombreProveedor)
      setProveedorTaxId(snapshot.proveedorTaxId)
      setCompraIvaCondition(snapshot.compraIvaCondition)
      setDocumentNumber(snapshot.documentNumber)
      setDocumentDate(snapshot.documentDate)
      setDueDate(snapshot.dueDate)
      setComprobanteTipo(snapshot.comprobanteTipo)
      setComprobanteAdjunto(null)
      if (comprobanteAdjuntoInputRef.current) {
        comprobanteAdjuntoInputRef.current.value = ""
      }
      setPayOnSupplierAccount(snapshot.payOnSupplierAccount)
      setMetodoPagoSeleccionado(
        snapshot.metodoPagoSeleccionado &&
          treasuryPaymentContext &&
          isPurchasePaymentSelectionValid(
            snapshot.metodoPagoSeleccionado,
            treasuryPaymentContext,
          )
          ? snapshot.metodoPagoSeleccionado
          : snapshot.payOnSupplierAccount
            ? null
            : snapshot.metodoPagoSeleccionado,
      )
      setCardInstallments(snapshot.cardInstallments)
      setModoDescuento(snapshot.modoDescuento)
      setValorDescuentoPorcentaje(snapshot.valorDescuentoPorcentaje)
      setValorDescuentoFijo(snapshot.valorDescuentoFijo)
      setItemUnitCosts({ ...snapshot.itemUnitCosts })
      setItemUpdateArticleCost({ ...snapshot.itemUpdateArticleCost })
      setItemDescuentoModo({ ...snapshot.itemDescuentoModo })
      setItemDescuentoDraft({ ...snapshot.itemDescuentoDraft })
      setItemComentarios({ ...snapshot.itemComentarios })
      setItemExpiresAt({ ...snapshot.itemExpiresAt })
      setCompraError(null)
      setOrdenError(null)
    },
    [treasuryPaymentContext],
  )

  const confirmarOrden = useCallback(async () => {
    if (!popId || !hayItemsEnPedido) return
    setOrdenError(null)
    setOrdenSubmitting(true)
    try {
      const checkoutSnapshot = buildPurchaseOrderCheckoutSnapshot({
        carrito,
        proveedorSeleccionado,
        manualNombreProveedor,
        proveedorTaxId,
        compraIvaCondition,
        documentNumber,
        documentDate,
        dueDate,
        comprobanteTipo,
        attachmentFileName: comprobanteAdjunto?.name ?? null,
        payOnSupplierAccount,
        metodoPagoSeleccionado,
        cardInstallments,
        modoDescuento,
        valorDescuentoPorcentaje,
        valorDescuentoFijo,
        itemUnitCosts,
        itemUpdateArticleCost,
        itemDescuentoModo,
        itemDescuentoDraft,
        itemComentarios,
        itemExpiresAt,
      })
      const res = await createPurchaseOrder(popId, {
        checkoutSnapshot,
        subtotal,
        discountTotal: descuentoMonto,
        total,
        supplierId:
          proveedorSeleccionado?.id && !proveedorSeleccionado.manual
            ? proveedorSeleccionado.id
            : null,
        supplierName: confirmSupplierLabel,
        supplierTaxId:
          proveedorTaxId.trim() || proveedorSeleccionado?.taxId || null,
        metadata: {
          comprobanteLabel: ordenComprobanteLabel,
          paymentLabel: formatPurchaseOrderPaymentLabel({
            payOnSupplierAccount,
            metodoPagoSeleccionado,
          }),
          discountLabel: ordenDiscountLabel,
          lineSummaries: buildPurchaseOrderLineSummariesFromCart({
            items: itemsDetallados.map((item) => ({
              lineId: item.lineId,
              cantidad: item.cantidad,
              productName: item.producto?.nombre ?? "Artículo",
              costLabel: item.cost?.name ?? "",
              unitCost: parseUnitCost(
                itemUnitCosts[item.lineId] ?? "",
                item.cost?.unitPrice ?? 0,
              ),
            })),
            itemDescuentoModo,
            itemDescuentoDraft,
          }),
        },
      })
      if (!res.success) {
        setOrdenError(res.error)
        return
      }
      setOrdenConfirmOpen(false)
      limpiarCompra()
      router.push(`/${siteId}/${popId}/purchase-orders`)
    } finally {
      setOrdenSubmitting(false)
    }
  }, [
    popId,
    hayItemsEnPedido,
    carrito,
    proveedorSeleccionado,
    manualNombreProveedor,
    proveedorTaxId,
    compraIvaCondition,
    documentNumber,
    documentDate,
    dueDate,
    comprobanteTipo,
    comprobanteAdjunto,
    payOnSupplierAccount,
    metodoPagoSeleccionado,
    cardInstallments,
    modoDescuento,
    valorDescuentoPorcentaje,
    valorDescuentoFijo,
    itemUnitCosts,
    itemUpdateArticleCost,
    itemDescuentoModo,
    itemDescuentoDraft,
    itemComentarios,
    itemExpiresAt,
    subtotal,
    descuentoMonto,
    total,
    confirmSupplierLabel,
    ordenComprobanteLabel,
    ordenDiscountLabel,
    itemsDetallados,
    limpiarCompra,
    router,
    siteId,
  ])

  useEffect(() => {
    if (!orderIdFromUrl || !popId || catalogLoading) return
    if (orderLoadRef.current === orderIdFromUrl) return
    if (orderLoadingRef.current === orderIdFromUrl) return

    orderLoadingRef.current = orderIdFromUrl

    void (async () => {
      try {
        const res = await fetchPurchaseOrderDetail(popId, orderIdFromUrl)
        if (!res.success) {
          setCompraError(res.error)
          setOrderRestorePending(false)
          return
        }
        orderLoadRef.current = orderIdFromUrl
        aplicarOrdenEnCompra(res.order.checkoutSnapshot)
        router.replace(`/${siteId}/${popId}/purchases`, { scroll: false })
      } finally {
        orderLoadingRef.current = null
        setOrderRestorePending(false)
      }
    })()
  }, [
    aplicarOrdenEnCompra,
    catalogLoading,
    orderIdFromUrl,
    popId,
    router,
    siteId,
  ])

  const proveedorCatalogoBloqueado =
    proveedorSeleccionado != null && !proveedorSeleccionado.manual

  useEffect(() => {
    if (
      payOnSupplierAccount &&
      !partyCanOperateOnCurrentAccount(proveedorSeleccionado)
    ) {
      setPayOnSupplierAccount(false)
    }
  }, [payOnSupplierAccount, proveedorSeleccionado])

  const quitarProveedorCompra = useCallback(() => {
    setProveedorSeleccionado(null)
    setPayOnSupplierAccount(false)
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
      defaultInvoiceTypeLabel: null,
      currentAccountEnabled: s.currentAccountEnabled === true,
    })
    if (!s.currentAccountEnabled) setPayOnSupplierAccount(false)
    setManualNombreProveedor(s.name)
    setProveedorTaxId(s.taxId ?? "")
    setProveedorModalAbierto(false)
  }

  const confirmarProveedorManual = (
    payload: import("@/lib/operationPartyPicker").OperationPartyManualConfirmPayload,
  ) => {
    setManualNombreProveedor(payload.name)
    setProveedorTaxId(payload.taxId)
    setCompraIvaCondition(payload.ivaCondition)
    setProveedorSeleccionado({
      id: null,
      manual: true,
      name: payload.name || "Proveedor sin nombre",
      taxId: payload.taxId || "",
      ivaCondition: payload.ivaCondition || null,
      defaultInvoiceTypeLabel: null,
      currentAccountEnabled: false,
    })
    setPayOnSupplierAccount(false)
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
    (
      productoId: string,
      cost: PurchaseCatalogArticleCost,
      cantidad = 1,
    ) => {
      const qty = Math.max(1, Math.round(cantidad * 1e6) / 1e6)
      const lineId = purchaseCartLineId(productoId, cost.id)
      setCarrito((prev) => {
        const existe = prev.find((i) => i.lineId === lineId)
        if (existe) {
          return prev.map((i) =>
            i.lineId === lineId ? { ...i, cantidad: i.cantidad + qty } : i,
          )
        }
        return [
          ...prev,
          {
            lineId,
            productoId,
            articleCostId: cost.id,
            cantidad: qty,
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
      setItemUpdateArticleCost((prev) => ({
        ...prev,
        [lineId]: prev[lineId] ?? true,
      }))
    },
    [cartScrollHighlight],
  )

  const agregarAlCarrito = (productoId: string, cantidad = 1) => {
    const producto = productosCatalogo.find((p) => p.id === productoId)
    if (!producto) return
    if (producto.costs.length === 0) {
      setCompraError(
        "Este artículo no tiene costos de compra. Configuralos en Stock.",
      )
      return
    }
    if (producto.costs.length === 1) {
      agregarCostoAlCarrito(productoId, producto.costs[0], cantidad)
      return
    }
    setCostPickerArticleId(productoId)
    setCostPickerPendingQty(cantidad)
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
    setItemExpiresAt((prev) => {
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
      expiresAt,
      hasQuantityEdit,
      hasCostEdit,
      hasUpdateCostEdit,
      hasDiscountEdit,
      hasCommentEdit,
      hasExpiryEdit,
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
    if (hasExpiryEdit) {
      setItemExpiresAt((prev) => {
        const next = { ...prev }
        const trimmed = expiresAt.trim()
        if (!trimmed) delete next[lineId]
        else next[lineId] = trimmed
        return next
      })
    }
  }, [])

  const purchaseCartLines = useMemo(
    () =>
      itemsDetallados.map((item) => {
        const cost = item.cost!
        const costLabel = cost.costUnitLabel
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
      itemExpiresAt,
    }),
    [
      itemUnitCosts,
      itemUpdateArticleCost,
      itemDescuentoModo,
      itemDescuentoDraft,
      itemComentarios,
      itemExpiresAt,
    ],
  )

  const headerUserName =
    bootstrap?.userFullName?.trim() ||
    user?.email?.split("@")[0] ||
    "Usuario"
  const userAvatarSrc = bootstrap?.userImageUrl ?? undefined
  const popName = bootstrap?.popName ?? ""

  const purchaseCheckoutActions = {
    discardDisabled: !hayItemsEnPedido,
    confirmDisabled: !puedeComprar || compraSubmitting,
    confirmLoading: compraSubmitting,
    onDiscard: () => setDescartarConfirmOpen(true),
    onConfirm: () => {
      setCompraError(null)
      setComprarConfirmOpen(true)
    },
    confirmLabel: "Pagar" as const,
    confirmTone: "pay" as const,
    confirmTitle: !hayItemsEnPedido
      ? "Agregá artículos a la compra."
      : !payOnSupplierAccount && !metodoPagoSeleccionado
        ? "Elegí cómo vas a pagar o usá cuenta corriente."
        : payOnSupplierAccount &&
            !partyCanOperateOnCurrentAccount(proveedorSeleccionado)
          ? proveedorSeleccionado?.id
            ? "Este proveedor no está dado de alta en Cuentas corrientes."
            : "Elegí un proveedor del catálogo para comprar a cuenta corriente."
          : !canCreate
            ? "No tenés permiso para registrar compras."
            : undefined,
  }

  const purchaseCheckoutSteps = (
    <PurchaseOperationToolbox
      embedded
      proveedorLabel={proveedorSeleccionado?.name ?? "Elegir proveedor"}
      proveedorIvaLabel={compraIvaLabel}
      proveedorConfigurado={Boolean(proveedorSeleccionado)}
      comprobanteLabel={comprobanteToolboxLabel}
      comprobanteConfigurado={comprobanteConfigurado}
      pagoLabel={toolboxPaymentDisplay.pagoLabel}
      pagoSubLabel={toolboxPaymentDisplay.pagoSubLabel}
      pagoIcon={toolboxPaymentDisplay.pagoIcon}
      pagoConfigurado={pagoConfigurado}
      onProveedorClick={() => setProveedorModalAbierto(true)}
      onComprobanteClick={() => setComprobanteModalAbierto(true)}
      onPagoClick={() => setPagoModalAbierto(true)}
    />
  )

  if (!popId || !siteId) {
    return (
      <div className="min-h-screen bg-[#070a09] p-10 text-sm text-slate-300">
        Punto de venta no encontrado
      </div>
    )
  }

  if (catalogQueryPending) {
    return <PopModuleLoading moduleKey="purchases" />
  }

  return (
    <>
      <DataWorkspaceOperationsLayout
        siteId={siteId}
        popId={popId}
        popName={popName}
        title="Comprar"
        loading={!popName}
        userName={headerUserName}
        userAvatarSrc={userAvatarSrc}
        sidebarCollapsible
        sidebarEdgeToggle={false}
        sidebarOpen={catalogSidebarOpen}
        onSidebarOpenChange={setCatalogSidebarOpen}
        headerActions={
          <>
            <SaleOperationDiscountHeaderButton
              active={hayDescuento}
              title={descuentoToolboxLabel}
              onClick={abrirModalDescuento}
            />
            <RootsIconButton
              label="Crear orden de compra"
              semantic="tertiary"
              atmosphere="eter"
              size="default"
              disabled={!hayItemsEnPedido || ordenSubmitting}
              onClick={() => {
                setOrdenError(null)
                setOrdenConfirmOpen(true)
              }}
            >
              <FileText className="size-5" aria-hidden />
            </RootsIconButton>
          </>
        }
      >
        <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
          <OperationsModuleBackdrop />

          {orderRestorePending ? (
            <div
              className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[#070a09]/90 backdrop-blur-[2px]"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <RootsSpinner size="default" tone="dark" label="Cargando orden de compra" />
              <p className="text-sm font-medium text-white/90">
                Cargando orden de compra…
              </p>
              <p className="max-w-xs text-center text-xs text-white/50">
                Preparando ítems, proveedor y condiciones de la compra
              </p>
            </div>
          ) : null}

          <LayoutsOperarMainGrid
            catalog={
              <PurchaseCatalogBrowser
                siteId={siteId}
                popId={popId}
                mergeCatalogArticles={mergeCatalogArticles}
                categorySections={catalogCategorySections}
                products={productosCatalogo}
                loading={catalogLoading}
                error={catalogError}
                onAddProduct={agregarAlCarrito}
                catalogSidebarOpen={catalogSidebarOpen}
                onCatalogSidebarOpenChange={setCatalogSidebarOpen}
              />
            }
            floor={
              <LayoutsOperarSaleCheckoutFloor
                steps={purchaseCheckoutSteps}
                closingTotal={total}
                totalLabel="Total a pagar"
                regionLabel="Checkout de la compra"
                actions={purchaseCheckoutActions}
              />
            }
            ticket={
              <aside
                className={cn(
                  layoutsOperarSummaryPanelClass,
                  layoutsOperarSummaryPanelMobileStackClass,
                )}
                aria-label="Carrito de la compra"
              >
                <PurchaseOperationTicketOrderPanel
                  lines={purchaseCartLines}
                  overrides={purchaseCartOverrides}
                  canUpdateArticles={canUpdateArticles}
                  onApplyLineEdits={aplicarEdicionLineaCompra}
                  onRemoveLine={quitarDelCarrito}
                  listTitle="Tu compra"
                  cartScrollHighlight={cartScrollHighlight}
                  showDesktopActions={false}
                  actions={purchaseCheckoutActions}
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
            }
          />
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
        email=""
        onEmailChange={() => {}}
        ivaCondition={compraIvaCondition}
        onIvaConditionChange={setCompraIvaCondition}
        selected={proveedorSeleccionado}
        catalogBlocked={proveedorCatalogoBloqueado}
        onSelectCatalogParty={(party) =>
          seleccionarProveedorCatalogo({
            id: party.id,
            name: party.name,
            taxId: party.taxId ?? "",
            currentAccountEnabled: party.currentAccountEnabled === true,
          })
        }
        onConfirmManual={(payload) => confirmarProveedorManual(payload)}
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
        popId={popId}
        defaultPartyName={proveedorSeleccionado?.name ?? ""}
        defaultPartyId={
          proveedorSeleccionado && !proveedorSeleccionado.manual
            ? proveedorSeleccionado.id ?? ""
            : ""
        }
        onSelectImmediate={(option) => {
          setPayOnSupplierAccount(false)
          setMetodoPagoSeleccionado(option)
          if (option?.kind !== "card_credit") {
            setCardInstallments("1")
          }
        }}
        hideAccountOption={!partyCanOperateOnCurrentAccount(proveedorSeleccionado)}
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
        <RootsAlertDialogContent>
          <RootsAlertDialogPanel
            title="¿Descartar esta compra?"
            description="Se perderán los ítems y datos ingresados. Esta acción no se puede deshacer."
          />
          <RootsAlertDialogFooter
            cancelLabel="Cancelar"
            confirmLabel="Descartar"
            destructive
            onCancel={() => setDescartarConfirmOpen(false)}
            onConfirm={limpiarCompra}
          />
        </RootsAlertDialogContent>
      </AlertDialog>

      <SimpleOperationCheckoutConfirmDialog
        open={comprarConfirmOpen}
        onOpenChange={(open) => {
          setComprarConfirmOpen(open)
          if (!open) setCompraError(null)
        }}
        title="Confirmar compra"
        confirmLabel="Confirmar compra"
        tone="pay"
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

      <SimpleOperationCheckoutConfirmDialog
        open={ordenConfirmOpen}
        onOpenChange={(open) => {
          setOrdenConfirmOpen(open)
          if (!open) setOrdenError(null)
        }}
        title="Generar orden de compra"
        confirmLabel="Generar orden de compra"
        amountLabel="Total"
        submitting={ordenSubmitting}
        submitError={ordenError}
        total={total}
        subtotal={subtotal}
        descuentoMonto={descuentoMonto}
        hayDescuento={hayDescuento}
        partyLabel="Proveedor"
        partyValue={confirmSupplierLabel}
        partyIcon={Truck}
        comprobanteLabel={ordenComprobanteLabel}
        paymentLabel={ordenPaymentLabel}
        onConfirm={confirmarOrden}
      />

      <PurchaseArticleCostPickerDialog
        open={costPickerOpen}
        onOpenChange={(open) => {
          setCostPickerOpen(open)
          if (!open) {
            setCostPickerArticleId(null)
            setCostPickerPendingQty(1)
          }
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
          agregarCostoAlCarrito(
            costPickerArticleId,
            cost,
            costPickerPendingQty,
          )
          setCostPickerArticleId(null)
          setCostPickerPendingQty(1)
        }}
      />
    </>
  )
}

export default PurchasesPage
