"use client"

import { getSaleCatalog, type SaleCatalogClient, type SaleCatalogArticle, type SaleCatalogCategory, type SaleCatalogPaymentMethod, type SaleOpenCashSession } from "@/app/[siteId]/[popId]/sale/actions"
import { completeSale } from "@/app/[siteId]/[popId]/sale/completeSale"
import { saleCatalogArticleToProduct } from "@/components/sale-operation/saleCatalogProduct"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import { CLIENT_IVA_CONDITION_OPTIONS, type ClientIvaConditionValue } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import { CLIENT_ACCOUNT_PAYMENT_LABEL } from "@/lib/operationPaymentLabels"
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
import { DEFAULT_SALE_SITE_ID } from "@/lib/saleInvoiceTypes"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const MANUAL_PARTY_LIST_ID = "__manual__"

export type MesasCartItem = { productoId: string; cantidad: number }

export type MesasClienteSeleccionado = {
  id: string | null
  manual: boolean
  name: string
  taxId: string | null
  ivaCondition: string | null
  defaultInvoiceTypeLabel: string | null
}

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

type SessionCheckoutSnapshot = {
  carrito: MesasCartItem[]
  clienteSeleccionado: MesasClienteSeleccionado | null
  manualNombreCliente: string
  fiscalDocVenta: string
  ventaIvaCondition: string
  comprobante: string | null
  metodoPagoSeleccionado: { id: string; label: string } | null
  payOnClientAccount: boolean
  modoDescuento: "porcentaje" | "fijo"
  valorDescuentoPorcentaje: number
  valorDescuentoFijo: number
}

function emptySessionSnapshot(
  defaultComprobante: string | null = null,
): SessionCheckoutSnapshot {
  return {
    carrito: [],
    clienteSeleccionado: null,
    manualNombreCliente: "",
    fiscalDocVenta: "",
    ventaIvaCondition: "",
    comprobante: defaultComprobante,
    metodoPagoSeleccionado: null,
    payOnClientAccount: false,
    modoDescuento: "porcentaje",
    valorDescuentoPorcentaje: 0,
    valorDescuentoFijo: 0,
  }
}

export function useMesasSaleCheckout(
  popId: string | undefined,
  siteId: string,
  tableSessionId: string | null,
) {
  const [catalogArticles, setCatalogArticles] = useState<SaleCatalogArticle[]>([])
  const [saleCategories, setSaleCategories] = useState<SaleCatalogCategory[]>([])
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
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [busquedaClienteModal, setBusquedaClienteModal] = useState("")
  const [descuentoDraftModo, setDescuentoDraftModo] = useState<"porcentaje" | "fijo">("porcentaje")
  const [descuentoDraftTexto, setDescuentoDraftTexto] = useState("")

  const comprobanteInitRef = useRef(false)
  const sessionSnapshotsRef = useRef<Map<string, SessionCheckoutSnapshot>>(new Map())
  const loadedSessionIdRef = useRef<string | null>(null)
  const checkoutStateRef = useRef<SessionCheckoutSnapshot>(emptySessionSnapshot())

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
  }

  const applySessionSnapshot = useCallback((snap: SessionCheckoutSnapshot) => {
    setCarrito(snap.carrito)
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
    setClienteModalAbierto(false)
    setComprobanteModalAbierto(false)
    setPagoModalAbierto(false)
    setDescuentoModalAbierto(false)
    setDescartarConfirmOpen(false)
    setConfirmOpen(false)
    setSubmitError(null)
  }, [])

  useEffect(() => {
    const prevId = loadedSessionIdRef.current
    if (prevId) {
      sessionSnapshotsRef.current.set(prevId, checkoutStateRef.current)
    }

    loadedSessionIdRef.current = tableSessionId

    if (tableSessionId) {
      const saved = sessionSnapshotsRef.current.get(tableSessionId)
      if (saved) {
        applySessionSnapshot(saved)
      } else {
        let defaultComprobante: string | null = null
        if (popId) {
          const persisted = readSavedSaleComprobante(popId)
          if (
            persisted !== undefined &&
            isAllowedSaleComprobanteLabel(invoiceTypeSiteId, persisted)
          ) {
            defaultComprobante = persisted
          }
        }
        applySessionSnapshot(emptySessionSnapshot(defaultComprobante))
      }
    } else {
      let defaultComprobante: string | null = null
      if (popId) {
        const persisted = readSavedSaleComprobante(popId)
        if (
          persisted !== undefined &&
          isAllowedSaleComprobanteLabel(invoiceTypeSiteId, persisted)
        ) {
          defaultComprobante = persisted
        }
      }
      applySessionSnapshot(emptySessionSnapshot(defaultComprobante))
    }
    // Solo al cambiar de sesión de mesa; el snapshot se lee/escribe vía refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableSessionId, applySessionSnapshot])

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
    const res = await getSaleCatalog(popId)
    if (!res.success) {
      setCatalogArticles([])
      setSaleCategories([])
      setSaleClients([])
      setSalePaymentMethods([])
      setCatalogError(res.error)
      setCatalogLoading(false)
      return
    }
    setCatalogArticles(res.articles)
    setSaleCategories(res.categories)
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
    void loadCatalog()
  }, [loadCatalog])

  useEffect(() => {
    if (salePaymentMethods.length === 0) return
    setMetodoPagoSeleccionado((prev) => {
      if (prev && salePaymentMethods.some((m) => m.id === prev.id)) return prev
      const efectivo = salePaymentMethods.find((m) => m.kind === "cash")
      return efectivo ? { id: efectivo.id, label: efectivo.name } : null
    })
  }, [salePaymentMethods])

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

  const productosCatalogo = useMemo(
    () => catalogArticles.map(saleCatalogArticleToProduct),
    [catalogArticles],
  )

  const itemsDetallados = useMemo(
    () =>
      carrito
        .map((i) => ({
          ...i,
          producto: productosCatalogo.find((p) => p.id === i.productoId),
        }))
        .filter((i) => i.producto),
    [carrito, productosCatalogo],
  )

  const subtotal = useMemo(
    () =>
      itemsDetallados.reduce(
        (acc, i) => acc + (i.producto?.precio ?? 0) * i.cantidad,
        0,
      ),
    [itemsDetallados],
  )

  const descuentoMonto = useMemo(() => {
    if (modoDescuento === "porcentaje") {
      return subtotal * (valorDescuentoPorcentaje / 100)
    }
    return Math.min(valorDescuentoFijo, subtotal)
  }, [modoDescuento, subtotal, valorDescuentoPorcentaje, valorDescuentoFijo])

  const total = subtotal - descuentoMonto
  const hayDescuento = descuentoMonto > 0
  const hayItemsEnPedido = itemsDetallados.length > 0
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
      tableSessionId != null,
    [
      hayItemsEnPedido,
      pagoConfigurado,
      payOnClientAccount,
      clienteSeleccionado?.id,
      metodoPagoSeleccionado,
      canCreateSale,
      canReadCashRegisters,
      openCashSession,
      tableSessionId,
    ],
  )

  const hayContenidoVenta = useMemo(() => {
    if (carrito.length > 0) return true
    if (clienteSeleccionado != null) return true
    if (comprobante != null) return true
    if (hayDescuento) return true
    if (payOnClientAccount || metodoPagoSeleccionado != null) return true
    return false
  }, [
    carrito.length,
    clienteSeleccionado,
    comprobante,
    hayDescuento,
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

  const agregarAlCarrito = useCallback((productoId: string) => {
    setCarrito((prev) => {
      const existe = prev.find((i) => i.productoId === productoId)
      if (existe) {
        return prev.map((i) =>
          i.productoId === productoId ? { ...i, cantidad: i.cantidad + 1 } : i,
        )
      }
      return [...prev, { productoId, cantidad: 1 }]
    })
  }, [])

  const cambiarCantidad = useCallback((productoId: string, delta: number) => {
    setCarrito((prev) =>
      prev
        .map((i) =>
          i.productoId === productoId
            ? { ...i, cantidad: Math.max(0, i.cantidad + delta) }
            : i,
        )
        .filter((i) => i.cantidad > 0),
    )
  }, [])

  const limpiarPedido = useCallback(() => {
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
    setMetodoPagoSeleccionado(() => {
      const efectivo = salePaymentMethods.find((m) => m.kind === "cash")
      return efectivo ? { id: efectivo.id, label: efectivo.name } : null
    })
    setPayOnClientAccount(false)
    setDescartarConfirmOpen(false)
    setConfirmOpen(false)
    setSubmitError(null)
  }, [popId, salePaymentMethods])

  const confirmarMesa = useCallback(async () => {
    if (!popId || !siteId || !pagoConfigurado || !tableSessionId) return
    setSubmitError(null)
    setSubmitting(true)
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
      const res = await completeSale(popId, {
        siteId,
        lines: carrito.map((i) => ({
          articleId: i.productoId,
          quantity: i.cantidad,
          itemDiscountMode: "porcentaje" as const,
          itemDiscountDraft: "",
          comment: "",
        })),
        clientId: catalogClientId,
        payOnClientAccount,
        paymentMethodId: payOnClientAccount ? null : metodoPagoSeleccionado?.id,
        generalDiscountMode: modoDescuento === "porcentaje" ? "porcentaje" : "fijo",
        valorDescuentoPorcentaje,
        valorDescuentoFijo,
        invoiceTypeLabel: comprobante,
        customerIvaCondition:
          ventaIvaCondition.trim() || clienteSeleccionado?.ivaCondition || null,
        fiscalCustomer: hasFiscalOverride
          ? { name: manualOrFiscalName, taxId: manualOrFiscalTaxId }
          : null,
      })
      if (!res.success) {
        setSubmitError(res.error)
        return false
      }
      setConfirmOpen(false)
      limpiarPedido()
      return true
    } finally {
      setSubmitting(false)
    }
  }, [
    popId,
    siteId,
    tableSessionId,
    carrito,
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
    limpiarPedido,
  ])

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
    : tableSessionId == null
      ? "Sin mesa abierta"
      : (clienteSeleccionado?.name ?? "Elegir cliente")

  const clearSessionSnapshot = useCallback((sessionId: string) => {
    sessionSnapshotsRef.current.delete(sessionId)
  }, [])

  const mesaToolbarDisabled = tableSessionId == null

  return {
    catalogLoading,
    catalogError,
    saleCategories,
    productosCatalogo,
    carrito,
    itemsDetallados,
    agregarAlCarrito,
    cambiarCantidad,
    subtotal,
    descuentoMonto,
    total,
    hayDescuento,
    hayItemsEnPedido,
    hayContenidoVenta,
    puedeRegistrar,
    submitting,
    submitError,
    clearSessionSnapshot,
    // Toolbox
    toolbox: {
      clienteLabel: clienteToolbarLabel,
      clienteIvaLabel: mesaToolbarDisabled ? null : ventaIvaLabel,
      clienteDisabled: !canReadClients || mesaToolbarDisabled,
      clienteConfigurado: Boolean(clienteSeleccionado) && !mesaToolbarDisabled,
      toolbarDisabled: mesaToolbarDisabled,
      comprobanteLabel: mesaToolbarDisabled
        ? "Sin comprobante"
        : comprobanteDisplayLabel,
      pagoLabel: mesaToolbarDisabled ? "Elegir forma de pago" : pagoResumenLabel,
      pagoConfigurado: pagoConfigurado && !mesaToolbarDisabled,
      descuentoLabel: mesaToolbarDisabled ? "Sin descuento" : descuentoToolbarLabel,
      hayDescuento: hayDescuento && !mesaToolbarDisabled,
      onClienteClick: () => {
        if (!canReadClients || mesaToolbarDisabled) return
        setBusquedaClienteModal("")
        setClienteModalAbierto(true)
      },
      onComprobanteClick: () => {
        if (mesaToolbarDisabled) return
        setComprobanteModalAbierto(true)
      },
      onPagoClick: () => {
        if (mesaToolbarDisabled) return
        setPagoModalAbierto(true)
      },
      onDescuentoClick: () => {
        if (mesaToolbarDisabled) return
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
      confirmarMesa,
      submitError,
      total,
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

export type MesasSaleCheckout = ReturnType<typeof useMesasSaleCheckout>
