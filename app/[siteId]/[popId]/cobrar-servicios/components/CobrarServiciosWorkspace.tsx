"use client"

import {
  createServiceCharges,
  getActiveServicesPageData,
  getServiceTypeChargeOptions,
  recordServiceChargePayment,
  type CreateServiceChargeInput,
  type ServiceTypeChargeOption,
} from "@/app/[siteId]/[popId]/active-services/actions"
import {
  buildServiceChargeClientPayload,
  emptyServiceChargeClientDraft,
  isServiceChargeClientReady,
  normalizeServiceChargeClientDraft,
  serviceChargeEffectiveClientIva,
} from "@/app/[siteId]/[popId]/active-services/components/ServiceChargeClientField"
import {
  hasServiceChargeCreateFieldErrors,
  isServiceChargeComprobanteChosen,
  isServiceChargePaymentMethodChosen,
  resolveServiceChargeComprobanteDisplayLabel,
  resolveServiceChargeComprobanteEffectiveLabel,
  resolveServiceChargeComprobanteToolboxLabel,
  SERVICE_CHARGE_COMPROBANTE_AUTO,
  SERVICE_CHARGE_PAYMENT_PENDING,
  SERVICE_CHARGE_PAYMENT_PENDING_LABEL,
  SERVICE_CHARGE_SNAPSHOT_PLACEHOLDER,
  validateServiceChargeOperateForm,
  type ServiceChargeCreateFieldErrors,
  type ServiceChargeCreateWizardForm,
} from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import type { ClientIvaConditionValue } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import { CLIENT_IVA_CONDITION_OPTIONS } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import { OperationPartyPickerDialog } from "@/components/checkout/OperationPartyPickerDialog"
import { DataWorkspaceOperationsLayout } from "@/components/layouts-module/DataWorkspaceOperationsLayout"
import { LayoutsOperarMainGrid } from "@/components/layouts-module/LayoutsOperarMainGrid"
import { useDataWorkspaceSidebar } from "@/components/layouts/useDataWorkspaceSidebar"
import { ServiceOperateSnapshotPanel } from "@/components/service-operation/ServiceOperateSnapshotPanel"
import { ServiceOperateCatalogBrowser } from "@/components/service-operation/ServiceOperateCatalogBrowser"
import { ServiceOperateComprobanteDialog } from "@/components/service-operation/ServiceOperateComprobanteDialog"
import { ServiceOperatePaymentDialog } from "@/components/service-operation/ServiceOperatePaymentDialog"
import { GeneralDiscountDialog } from "@/components/checkout/GeneralDiscountDialog"
import { SaleFinalizeDialog } from "@/components/checkout/SaleFinalizeDialog"
import { SaleOperationToolbox } from "@/components/sale-operation/SaleOperationToolbox"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import { serviceOperateSnapshotPanelClass } from "@/app/library/layouts/layoutsOperarStyles"
import {
  RootsAlertDialogContent,
  RootsAlertDialogFooter,
  RootsAlertDialogPanel,
} from "@/components/rootsy-dialog"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { useAuth } from "@/context/AuthContextSupabase"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { formatMoneyInputForField, parseMoneyInput } from "@/lib/moneyInput"
import type {
  OperationPartyCatalogItem,
  OperationPartyManualConfirmOptions,
  OperationPartyManualConfirmPayload,
  OperationPartySelection,
} from "@/lib/operationPartyPicker"
import { parseNonNegativeIntegerInput } from "@/lib/integerInput"
import {
  getSaleComprobantePickerOptions,
  type SaleComprobantePickerOption,
} from "@/lib/saleComprobantePicker"
import { suggestSaleComprobanteForClientIva } from "@/lib/saleComprobanteRules"
import { type ServiceDiscountMode } from "@/lib/serviceCatalogTypes"
import {
  resolveChargeAddonSelections,
  computeSelectedAddonsTotal,
} from "@/lib/serviceChargeAddonSelection"
import {
  availableBillingScopesForService,
  billingPeriodRequiresManualPeriodEnd,
  computeChargeAmount,
} from "@/lib/serviceChargeTypes"
import {
  buildServiceOperateCategories,
  mapServiceTypeToCatalogItem,
} from "@/lib/serviceOperateCatalog"
import {
  buildPaymentCheckoutSelection,
  paymentCheckoutKindIcon,
} from "@/lib/paymentMethodCheckout"
import { operationPaymentKindLabel } from "@/lib/operationPaymentKinds"
import {
  parseTreasuryPaymentOptionKey,
  type TreasuryPaymentContext,
} from "@/lib/treasuryPaymentOptions"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Clock3 } from "lucide-react"

const IVA_LABELS = Object.fromEntries(
  CLIENT_IVA_CONDITION_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>

function labelCondicionIva(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  return IVA_LABELS[value.trim()] ?? value.trim()
}

type Props = {
  siteId: string
  popId: string
}

function todayIso(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
}

function defaultFormState(): ServiceChargeCreateWizardForm {
  return {
    clientDraft: emptyServiceChargeClientDraft(),
    serviceTypeId: "",
    billingScope: "one_period",
    periodCount: "1",
    periodStartDate: todayIso(),
    periodEndDate: todayIso(),
    paymentTiming: "end_of_period",
    dueDaysAfter: "0",
    unitPrice: formatMoneyInputForField(0),
    discountMode: "",
    discountValue: "",
    paymentMethodKey: "",
    checkDetails: null,
    comprobanteLabel: "",
    issueInvoiceOnCreate: true,
    printInvoiceOnCreate: false,
    emailInvoiceToClient: true,
    notes: "",
    selectedAddonIds: [],
    oneTimeAddonIds: [],
  }
}

function buildCreatePayload(
  form: ServiceChargeCreateWizardForm,
  selectedService: ServiceTypeChargeOption,
  canCreateClient: boolean,
): CreateServiceChargeInput {
  const discountMode: ServiceDiscountMode =
    form.discountMode === "porcentaje" || form.discountMode === "fijo"
      ? form.discountMode
      : "none"
  const discountValue =
    discountMode === "none"
      ? null
      : discountMode === "porcentaje"
        ? Number(form.discountValue.replace(/\D/g, "")) || null
        : parseMoneyInput(form.discountValue, Number.NaN)

  const chargeCount =
    form.billingScope === "one_period" || form.billingScope === "subscription"
      ? 1
      : Math.max(1, Number(form.periodCount.replace(/\D/g, "")) || 1)

  const draft = form.clientDraft
  const clientPayload = buildServiceChargeClientPayload(draft, { canCreateClient })

  return {
    ...clientPayload,
    serviceTypeId: form.serviceTypeId,
    billingScope: form.billingScope,
    periodCount: chargeCount,
    periodStartDate: form.periodStartDate,
    periodEndDate: billingPeriodRequiresManualPeriodEnd(selectedService.billingPeriod)
      ? form.periodEndDate
      : null,
    paymentTiming: form.paymentTiming,
    dueDaysAfter: parseNonNegativeIntegerInput(form.dueDaysAfter, 0),
    unitPrice: parseMoneyInput(form.unitPrice, 0),
    discountMode,
    discountValue,
    notes: form.notes,
    addons:
      form.selectedAddonIds.length > 0
        ? resolveChargeAddonSelections(
            form.billingScope,
            form.selectedAddonIds,
            form.oneTimeAddonIds,
          )
        : undefined,
  }
}

export function CobrarServiciosWorkspace({ siteId, popId }: Props) {
  const { user } = useAuth()
  const { bootstrap, loading: bootstrapLoading } = usePopWorkspace()
  const {
    open: catalogSidebarOpen,
    setOpen: setCatalogSidebarOpen,
  } = useDataWorkspaceSidebar(siteId, popId, true)

  const [loading, setLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [services, setServices] = useState<ServiceTypeChargeOption[]>([])
  const [treasuryPaymentContext, setTreasuryPaymentContext] =
    useState<TreasuryPaymentContext | null>(null)
  const [canCreate, setCanCreate] = useState(false)
  const [canReadClients, setCanReadClients] = useState(false)
  const [canCreateClient, setCanCreateClient] = useState(false)
  const [canUpdateClient, setCanUpdateClient] = useState(false)

  const [form, setForm] = useState<ServiceChargeCreateWizardForm>(defaultFormState)
  const [fieldErrors, setFieldErrors] = useState<ServiceChargeCreateFieldErrors>({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)
  const [createChargeConfirmOpen, setCreateChargeConfirmOpen] = useState(false)
  const [descartarConfirmOpen, setDescartarConfirmOpen] = useState(false)
  const [clienteModalAbierto, setClienteModalAbierto] = useState(false)
  const [comprobanteModalAbierto, setComprobanteModalAbierto] = useState(false)
  const [pagoModalAbierto, setPagoModalAbierto] = useState(false)
  const [chargeManualName, setChargeManualName] = useState("")
  const [chargeFiscalDoc, setChargeFiscalDoc] = useState("")
  const [chargeIvaCondition, setChargeIvaCondition] = useState("")
  const [descuentoModalAbierto, setDescuentoModalAbierto] = useState(false)
  const [descuentoDraftModo, setDescuentoDraftModo] = useState<"porcentaje" | "fijo">(
    "porcentaje",
  )
  const [descuentoDraftTexto, setDescuentoDraftTexto] = useState("")

  const loadGenRef = useRef(0)
  const isMountedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      loadGenRef.current += 1
    }
  }, [])

  const catalogItems = useMemo(
    () => services.map(mapServiceTypeToCatalogItem),
    [services],
  )
  const catalogCategories = useMemo(
    () => buildServiceOperateCategories(catalogItems),
    [catalogItems],
  )

  const selectedService = useMemo(
    () => services.find((service) => service.id === form.serviceTypeId) ?? null,
    [services, form.serviceTypeId],
  )

  const comprobanteFormOptions = useMemo(
    (): SaleComprobantePickerOption[] =>
      getSaleComprobantePickerOptions(
        siteId || "arg",
        bootstrap?.popEmisorIvaCondition ?? "responsable_inscripto",
        bootstrap?.hasValidPopFiscalCuit ?? false,
      ),
    [siteId, bootstrap?.popEmisorIvaCondition, bootstrap?.hasValidPopFiscalCuit],
  )

  const suggestedComprobante = useMemo(() => {
    const clientIva = serviceChargeEffectiveClientIva(form.clientDraft)
    if (!clientIva || !bootstrap?.hasValidPopFiscalCuit) return null
    return suggestSaleComprobanteForClientIva(
      clientIva as ClientIvaConditionValue,
      bootstrap.popEmisorIvaCondition,
    )
  }, [
    form.clientDraft,
    bootstrap?.hasValidPopFiscalCuit,
    bootstrap?.popEmisorIvaCondition,
  ])

  useEffect(() => {
    if (suggestedComprobante) return
    setForm((current) => {
      if (current.comprobanteLabel !== SERVICE_CHARGE_COMPROBANTE_AUTO) {
        return current
      }
      return { ...current, comprobanteLabel: "" }
    })
  }, [suggestedComprobante])

  const loadPage = useCallback(async () => {
    const gen = ++loadGenRef.current
    setLoading(true)
    const res = await getActiveServicesPageData(popId)
    if (gen !== loadGenRef.current) return
    if (!res.success) {
      setCatalogError(res.error)
      setServices([])
      setLoading(false)
      return
    }
    setCatalogError(null)
    const optionsRes = await getServiceTypeChargeOptions(popId)
    if (gen !== loadGenRef.current) return
    setServices(optionsRes.success ? optionsRes.services : [])
    setCanCreate(res.canCreate)
    setCanReadClients(res.canReadClients)
    setCanCreateClient(res.canCreateClient)
    setCanUpdateClient(res.canUpdateClient)
    setTreasuryPaymentContext(res.treasuryPaymentContext)
    setLoading(false)
  }, [popId])

  useEffect(() => {
    void loadPage()
  }, [loadPage])

  const patchForm = useCallback((patch: Partial<ServiceChargeCreateWizardForm>) => {
    setForm((current) => {
      const next: ServiceChargeCreateWizardForm = { ...current, ...patch }
      if (patch.clientDraft) {
        next.clientDraft = normalizeServiceChargeClientDraft({
          ...current.clientDraft,
          ...patch.clientDraft,
        })
      }
      return next
    })
    setFieldErrors({})
    setSubmitError(null)
  }, [])

  const selectService = useCallback(
    (serviceId: string) => {
      const service = services.find((item) => item.id === serviceId)
      if (!service) return
      const allowedScopes = availableBillingScopesForService(service.billingPeriod)
      const manualEnd = billingPeriodRequiresManualPeriodEnd(service.billingPeriod)
      patchForm({
        serviceTypeId: service.id,
        unitPrice: formatMoneyInputForField(service.defaultPrice),
        billingScope: allowedScopes.includes(form.billingScope)
          ? form.billingScope
          : allowedScopes[0]!,
        paymentTiming: service.paymentTiming,
        dueDaysAfter: String(service.dueDaysAfter),
        periodEndDate: manualEnd
          ? form.periodEndDate || form.periodStartDate
          : form.periodEndDate,
        selectedAddonIds: [],
        oneTimeAddonIds: [],
      })
      setFieldErrors({})
    },
    [services, form.billingScope, form.periodEndDate, form.periodStartDate, patchForm],
  )

  const clearSelectedService = useCallback(() => {
    patchForm({
      serviceTypeId: "",
      unitPrice: "",
      selectedAddonIds: [],
      oneTimeAddonIds: [],
    })
    setFieldErrors({})
  }, [patchForm])

  const resetCharge = useCallback(() => {
    setForm(defaultFormState())
    setFieldErrors({})
    setSubmitError(null)
    setDescuentoModalAbierto(false)
    setDescartarConfirmOpen(false)
    setCreateChargeConfirmOpen(false)
  }, [])

  const subtotalForDiscount = useMemo(() => {
    const unitPrice = parseMoneyInput(form.unitPrice, 0)
    const addonsTotal = selectedService
      ? computeSelectedAddonsTotal(selectedService.addons, form.selectedAddonIds)
      : 0
    return unitPrice + addonsTotal
  }, [form.unitPrice, form.selectedAddonIds, selectedService])

  const discountPct =
    form.discountMode === "porcentaje"
      ? Number(form.discountValue.replace(/\D/g, "")) || 0
      : 0
  const discountFixed =
    form.discountMode === "fijo" ? parseMoneyInput(form.discountValue, 0) : 0

  const hayDescuento =
    form.discountMode === "porcentaje"
      ? discountPct > 0
      : form.discountMode === "fijo"
        ? discountFixed > 0
        : false

  const descuentoToolboxLabel = hayDescuento
    ? form.discountMode === "porcentaje"
      ? `${discountPct}%`
      : `Fijo ${saleOpFmt.format(discountFixed)}`
    : "Sin descuento"

  const descuentoDisabled = !selectedService || subtotalForDiscount <= 0 || saving

  const abrirModalDescuento = () => {
    if (hayDescuento) {
      if (form.discountMode === "porcentaje") {
        setDescuentoDraftModo("porcentaje")
        setDescuentoDraftTexto(discountPct > 0 ? String(discountPct) : "")
      } else {
        setDescuentoDraftModo("fijo")
        setDescuentoDraftTexto(discountFixed > 0 ? String(discountFixed) : "")
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
      patchForm({ discountMode: "", discountValue: "" })
      setDescuentoModalAbierto(false)
      return
    }
    if (descuentoDraftModo === "porcentaje") {
      const pct = Math.min(100, Math.max(0, n))
      patchForm({
        discountMode: pct > 0 ? "porcentaje" : "",
        discountValue: pct > 0 ? String(pct) : "",
      })
    } else if (subtotalForDiscount > 0 && n > subtotalForDiscount) {
      patchForm({ discountMode: "porcentaje", discountValue: "100" })
    } else {
      const tope = Math.min(n, subtotalForDiscount)
      patchForm({
        discountMode: tope > 0 ? "fijo" : "",
        discountValue: tope > 0 ? formatMoneyInputForField(tope) : "",
      })
    }
    setDescuentoModalAbierto(false)
  }

  const quitarDescuento = () => {
    patchForm({ discountMode: "", discountValue: "" })
    setDescuentoModalAbierto(false)
  }

  const clientName =
    form.clientDraft.catalogClient?.name.trim() ||
    form.clientDraft.manualName.trim() ||
    ""

  const { paymentLabel, pagoSubLabel } = useMemo(() => {
    if (!isServiceChargePaymentMethodChosen(form.paymentMethodKey)) {
      return { paymentLabel: "Elegir pago", pagoSubLabel: null as string | null }
    }
    if (form.paymentMethodKey === SERVICE_CHARGE_PAYMENT_PENDING) {
      return {
        paymentLabel: SERVICE_CHARGE_PAYMENT_PENDING_LABEL,
        pagoSubLabel: null,
      }
    }
    const parsed = parseTreasuryPaymentOptionKey(form.paymentMethodKey)
    if (!parsed || !treasuryPaymentContext) {
      return { paymentLabel: "Medio elegido", pagoSubLabel: null }
    }

    const kindLabel = operationPaymentKindLabel(parsed.kind)
    const selection = buildPaymentCheckoutSelection(
      "service_charge",
      parsed.kind,
      parsed.treasuryAccountId,
      treasuryPaymentContext,
    )
    const destinationName =
      [...treasuryPaymentContext.cashTreasuryAccounts,
        ...treasuryPaymentContext.bankTreasuryAccounts,
        ...treasuryPaymentContext.posTreasuryAccounts,
      ].find((account) => account.id === parsed.treasuryAccountId)?.name ?? null

    if (parsed.kind === "check") {
      return {
        paymentLabel: form.checkDetails
          ? `Cheque ${form.checkDetails.checkNumber}`.trim()
          : kindLabel,
        pagoSubLabel: kindLabel,
      }
    }

    if (parsed.kind === "cash" && treasuryPaymentContext.cashTreasuryAccounts.length <= 1) {
      return { paymentLabel: kindLabel, pagoSubLabel: null }
    }

    if (destinationName) {
      return { paymentLabel: destinationName, pagoSubLabel: kindLabel }
    }

    return { paymentLabel: selection.label, pagoSubLabel: kindLabel }
  }, [form.checkDetails, form.paymentMethodKey, treasuryPaymentContext])

  const pagoIcon = useMemo(() => {
    if (!isServiceChargePaymentMethodChosen(form.paymentMethodKey)) {
      return undefined
    }
    if (form.paymentMethodKey === SERVICE_CHARGE_PAYMENT_PENDING) {
      return Clock3
    }
    const parsed = parseTreasuryPaymentOptionKey(form.paymentMethodKey)
    if (!parsed) return undefined
    return paymentCheckoutKindIcon(parsed.kind)
  }, [form.paymentMethodKey])

  const comprobanteDisplayLabel = useMemo(
    () =>
      resolveServiceChargeComprobanteDisplayLabel(
        form.comprobanteLabel,
        suggestedComprobante,
      ),
    [form.comprobanteLabel, suggestedComprobante],
  )

  const comprobanteToolboxLabel = useMemo(
    () =>
      resolveServiceChargeComprobanteToolboxLabel(
        form.comprobanteLabel,
        suggestedComprobante,
      ),
    [form.comprobanteLabel, suggestedComprobante],
  )

  const clienteSeleccionado = useMemo((): OperationPartySelection | null => {
    const draft = form.clientDraft
    if (draft.catalogClient?.id) {
      return {
        id: draft.catalogClient.id,
        manual: false,
        name: draft.catalogClient.name,
        taxId: draft.catalogClient.taxId ?? null,
        ivaCondition: serviceChargeEffectiveClientIva(draft) || null,
        defaultInvoiceTypeLabel: draft.catalogClient.defaultInvoiceTypeLabel ?? null,
      }
    }
    if (draft.manualName.trim()) {
      return {
        id: null,
        manual: true,
        name: draft.manualName.trim(),
        taxId: draft.taxId.trim() || null,
        email: draft.email.trim() || null,
        ivaCondition: draft.ivaCondition.trim() || null,
        defaultInvoiceTypeLabel: null,
      }
    }
    return null
  }, [form.clientDraft])

  const clienteIvaLabel = useMemo(
    () => labelCondicionIva(serviceChargeEffectiveClientIva(form.clientDraft)),
    [form.clientDraft],
  )

  const pagoConfigurado = isServiceChargePaymentMethodChosen(form.paymentMethodKey)
  const comprobanteConfigurado = isServiceChargeComprobanteChosen(form.comprobanteLabel)
  const toolbarDisabled = !selectedService || saving

  const aplicarComprobanteDesdeIva = useCallback(
    (iva: ClientIvaConditionValue) => {
      if (!bootstrap?.hasValidPopFiscalCuit) return
      const suggested = suggestSaleComprobanteForClientIva(
        iva,
        bootstrap.popEmisorIvaCondition,
      )
      if (suggested) {
        patchForm({ comprobanteLabel: SERVICE_CHARGE_COMPROBANTE_AUTO })
      }
    },
    [bootstrap?.hasValidPopFiscalCuit, bootstrap?.popEmisorIvaCondition, patchForm],
  )

  const seleccionarClienteCatalogo = useCallback(
    (party: OperationPartyCatalogItem) => {
      patchForm({
        clientDraft: normalizeServiceChargeClientDraft({
          ...form.clientDraft,
          catalogClient: party,
          manualName: "",
          taxId: "",
          ivaCondition: party.ivaCondition?.trim() ?? form.clientDraft.ivaCondition,
        }),
      })
      if (party.ivaCondition) {
        aplicarComprobanteDesdeIva(party.ivaCondition as ClientIvaConditionValue)
      }
      setClienteModalAbierto(false)
    },
    [form.clientDraft, patchForm, aplicarComprobanteDesdeIva],
  )

  const seleccionarClienteManual = useCallback(
    (
      payload: OperationPartyManualConfirmPayload,
      options: OperationPartyManualConfirmOptions,
    ) => {
      patchForm({
        clientDraft: normalizeServiceChargeClientDraft({
          catalogClient: null,
          manualName: payload.name,
          taxId: payload.taxId,
          email: payload.email,
          ivaCondition: payload.ivaCondition,
          persistInCatalog: options.persistInCatalog,
        }),
      })
      if (payload.ivaCondition) {
        aplicarComprobanteDesdeIva(payload.ivaCondition as ClientIvaConditionValue)
      }
    },
    [patchForm, aplicarComprobanteDesdeIva],
  )

  const quitarCliente = useCallback(() => {
    patchForm({ clientDraft: emptyServiceChargeClientDraft() })
    setClienteModalAbierto(false)
  }, [patchForm])

  const abrirClienteModal = useCallback(() => {
    const draft = form.clientDraft
    if (draft.catalogClient?.id) {
      setChargeManualName("")
      setChargeFiscalDoc("")
      setChargeIvaCondition("")
    } else {
      setChargeManualName(draft.manualName)
      setChargeFiscalDoc(draft.taxId)
      setChargeIvaCondition(draft.ivaCondition)
    }
    setClienteModalAbierto(true)
  }, [form.clientDraft])

  const validationOptions = useMemo(
    () => ({
      canReadClients,
      canCreateClient,
      hasServices: services.length > 0,
      selectedService,
    }),
    [canReadClients, canCreateClient, services.length, selectedService],
  )

  const canSubmitCharge = useMemo(() => {
    if (!canCreate || !selectedService) return false
    if (!isServiceChargeClientReady(form.clientDraft)) return false
    if (!isServiceChargePaymentMethodChosen(form.paymentMethodKey)) return false
    const parsedPayment = parseTreasuryPaymentOptionKey(form.paymentMethodKey)
    if (parsedPayment?.kind === "check" && !form.checkDetails) return false
    if (!isServiceChargeComprobanteChosen(form.comprobanteLabel)) return false
    const errors = validateServiceChargeOperateForm(form, validationOptions)
    return !hasServiceChargeCreateFieldErrors(errors)
  }, [canCreate, selectedService, form, validationOptions])

  const confirmTitle = useMemo(() => {
    if (!selectedService) return "Elegí un servicio del catálogo."
    if (!isServiceChargeClientReady(form.clientDraft)) return "Completá el cliente."
    if (!isServiceChargePaymentMethodChosen(form.paymentMethodKey)) {
      return "Elegí el medio de pago."
    }
    const parsedPayment = parseTreasuryPaymentOptionKey(form.paymentMethodKey)
    if (parsedPayment?.kind === "check" && !form.checkDetails) {
      return "Completá los datos del cheque."
    }
    if (!isServiceChargeComprobanteChosen(form.comprobanteLabel)) {
      return "Elegí el comprobante."
    }
    if (!canCreate) return "No tenés permiso para crear cargos."
    const errors = validateServiceChargeOperateForm(form, validationOptions)
    if (hasServiceChargeCreateFieldErrors(errors)) {
      return "Revisá la configuración del cargo."
    }
    return undefined
  }, [selectedService, form, canCreate, validationOptions])

  const chargeDiscountMode: ServiceDiscountMode =
    form.discountMode === "porcentaje" || form.discountMode === "fijo"
      ? form.discountMode
      : "none"

  const chargeDiscountValue =
    chargeDiscountMode === "none"
      ? null
      : chargeDiscountMode === "porcentaje"
        ? Number(form.discountValue.replace(/\D/g, "")) || null
        : parseMoneyInput(form.discountValue, Number.NaN)

  const chargeTotal = useMemo(
    () =>
      computeChargeAmount(
        subtotalForDiscount,
        chargeDiscountMode,
        chargeDiscountValue != null && Number.isFinite(chargeDiscountValue)
          ? chargeDiscountValue
          : null,
      ),
    [subtotalForDiscount, chargeDiscountMode, chargeDiscountValue],
  )

  const chargeDescuentoMonto = Math.max(0, subtotalForDiscount - chargeTotal)

  const handleOpenCreateChargeConfirm = () => {
    if (!selectedService) {
      return
    }

    const errors = validateServiceChargeOperateForm(form, validationOptions)
    if (hasServiceChargeCreateFieldErrors(errors)) {
      setFieldErrors(errors)
      return
    }

    setSubmitError(null)
    setCreateChargeConfirmOpen(true)
  }

  const handleSubmit = async () => {
    if (!selectedService) {
      setCreateChargeConfirmOpen(false)
      return
    }

    const errors = validateServiceChargeOperateForm(form, validationOptions)
    if (hasServiceChargeCreateFieldErrors(errors)) {
      setFieldErrors(errors)
      setCreateChargeConfirmOpen(false)
      return
    }

    setSaving(true)
    setSubmitError(null)
    const payload = buildCreatePayload(form, selectedService, canCreateClient)
    const res = await createServiceCharges(popId, payload)
    if (!isMountedRef.current) return

    if (!res.success) {
      setSaving(false)
      setSubmitError(res.error)
      return
    }

    const parsedPayment = parseTreasuryPaymentOptionKey(form.paymentMethodKey)
    if (
      parsedPayment?.kind === "check" &&
      form.checkDetails &&
      res.chargeIds.length === 1
    ) {
      const payRes = await recordServiceChargePayment(
        popId,
        res.chargeIds[0]!,
        chargeTotal,
        todayIso(),
        "check",
        parsedPayment.treasuryAccountId,
        form.notes,
        form.checkDetails,
      )
      if (!isMountedRef.current) return
      if (!payRes.success) {
        setSaving(false)
        setSubmitError(payRes.error)
        return
      }
    }

    setSaving(false)
    setCreateChargeConfirmOpen(false)
    setSuccessOpen(true)
    resetCharge()
    void loadPage()
  }

  const headerUserName =
    bootstrap?.userFullName?.trim() ||
    user?.user_metadata?.full_name?.trim() ||
    user?.email?.split("@")[0] ||
    "Usuario"
  const userAvatarSrc = bootstrap?.userImageUrl ?? undefined

  return (
    <>
      <DataWorkspaceOperationsLayout
        siteId={siteId}
        popId={popId}
        popName={bootstrap?.popName ?? ""}
        title="Vender servicio"
        loading={bootstrapLoading}
        userName={headerUserName}
        userAvatarSrc={userAvatarSrc}
        sidebarCollapsible
        sidebarEdgeToggle={false}
        sidebarOpen={catalogSidebarOpen}
        onSidebarOpenChange={setCatalogSidebarOpen}
      >
        <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
          <LayoutsOperarMainGrid
            catalog={
              <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--rootsy-sombra-800)]">
                <ServiceOperateCatalogBrowser
                  items={catalogItems}
                  categories={catalogCategories}
                  loading={loading}
                  error={catalogError}
                  selectedServiceId={form.serviceTypeId || null}
                  selectedService={selectedService}
                  popId={popId}
                  catalogSidebarOpen={catalogSidebarOpen}
                  disabled={saving}
                  onSelectService={selectService}
                  onClearSelectedService={clearSelectedService}
                />
              </div>
            }
            toolbox={
              <SaleOperationToolbox
                clienteLabel={
                  !canReadClients
                    ? "Sin permiso"
                    : clientName.trim() || "Elegir cliente"
                }
                clienteIvaLabel={clienteIvaLabel}
                clienteDisabled={!canReadClients}
                clienteConfigurado={isServiceChargeClientReady(form.clientDraft)}
                toolbarDisabled={toolbarDisabled}
                comprobanteLabel={comprobanteToolboxLabel}
                comprobanteConfigurado={comprobanteConfigurado}
                pagoLabel={paymentLabel}
                pagoSubLabel={pagoSubLabel}
                pagoConfigurado={pagoConfigurado}
                pagoIcon={pagoIcon}
                descuentoLabel={descuentoToolboxLabel}
                hayDescuento={hayDescuento}
                descuentoDisabled={descuentoDisabled || toolbarDisabled}
                onClienteClick={abrirClienteModal}
                onComprobanteClick={() => setComprobanteModalAbierto(true)}
                onPagoClick={() => setPagoModalAbierto(true)}
                onDescuentoClick={abrirModalDescuento}
              />
            }
            ticket={
              <aside
                className={serviceOperateSnapshotPanelClass}
                aria-label="Resumen del cargo"
              >
                <ServiceOperateSnapshotPanel
                  popId={popId}
                  form={form}
                  fieldErrors={fieldErrors}
                  selectedService={selectedService}
                  treasuryPaymentContext={treasuryPaymentContext}
                  suggestedComprobante={suggestedComprobante}
                  disabled={saving}
                  saving={saving}
                  canCreate={canSubmitCharge}
                  confirmTitle={confirmTitle}
                  onFormChange={patchForm}
                  onDiscard={() => setDescartarConfirmOpen(true)}
                  onConfirm={handleOpenCreateChargeConfirm}
                />
              </aside>
            }
          />
        </div>
      </DataWorkspaceOperationsLayout>

      <OperationPartyPickerDialog
        popId={popId}
        flow="sale"
        context="venta"
        open={clienteModalAbierto}
        onOpenChange={(open) => {
          setClienteModalAbierto(open)
          if (open && clienteSeleccionado?.manual) {
            setChargeManualName(clienteSeleccionado.name)
            setChargeFiscalDoc(clienteSeleccionado.taxId ?? "")
            setChargeIvaCondition(clienteSeleccionado.ivaCondition ?? "")
          }
        }}
        canSearchCatalog={canReadClients}
        canCreateClient={canCreateClient}
        manualRegisterMode="deferred"
        manualName={chargeManualName}
        onManualNameChange={setChargeManualName}
        taxId={chargeFiscalDoc}
        onTaxIdChange={setChargeFiscalDoc}
        email={form.clientDraft.email}
        onEmailChange={(value) =>
          patchForm({
            clientDraft: normalizeServiceChargeClientDraft({
              ...form.clientDraft,
              email: value,
            }),
          })
        }
        ivaCondition={chargeIvaCondition}
        onIvaConditionChange={setChargeIvaCondition}
        selected={clienteSeleccionado}
        catalogBlocked={!canReadClients}
        onSelectCatalogParty={seleccionarClienteCatalogo}
        onConfirmManual={seleccionarClienteManual}
        onClearSelection={quitarCliente}
        onIvaConditionApplied={aplicarComprobanteDesdeIva}
      />

      <ServiceOperateComprobanteDialog
        open={comprobanteModalAbierto}
        onOpenChange={setComprobanteModalAbierto}
        options={comprobanteFormOptions}
        suggestedComprobante={suggestedComprobante}
        value={form.comprobanteLabel}
        onChange={(comprobanteLabel) => {
          const hasComprobante = Boolean(
            resolveServiceChargeComprobanteEffectiveLabel(
              comprobanteLabel,
              suggestedComprobante,
            ),
          )
          patchForm({
            comprobanteLabel,
            ...(hasComprobante
              ? {}
              : {
                  issueInvoiceOnCreate: false,
                  printInvoiceOnCreate: false,
                  emailInvoiceToClient: false,
                }),
          })
        }}
      />

      <ServiceOperatePaymentDialog
        open={pagoModalAbierto}
        onOpenChange={setPagoModalAbierto}
        treasuryContext={treasuryPaymentContext}
        value={form.paymentMethodKey}
        popId={popId}
        defaultPartyName={
          form.clientDraft.catalogClient?.name.trim() ||
          form.clientDraft.manualName.trim() ||
          ""
        }
        defaultPartyId={form.clientDraft.catalogClient?.id ?? ""}
        checkDetails={form.checkDetails}
        onChange={(paymentMethodKey, checkDetails) =>
          patchForm({
            paymentMethodKey,
            checkDetails: checkDetails ?? null,
          })
        }
      />

      <GeneralDiscountDialog
        open={descuentoModalAbierto}
        onOpenChange={setDescuentoModalAbierto}
        context="cargo"
        subtotal={subtotalForDiscount}
        draftMode={descuentoDraftModo}
        onDraftModeChange={setDescuentoDraftModo}
        draftText={descuentoDraftTexto}
        onDraftTextChange={setDescuentoDraftTexto}
        onApply={aplicarDescuentoModal}
        onClear={quitarDescuento}
        disabled={descuentoDisabled}
      />

      <SaleFinalizeDialog
        open={createChargeConfirmOpen}
        onOpenChange={(open) => {
          setCreateChargeConfirmOpen(open)
          if (!open) setSubmitError(null)
        }}
        title="Confirmar cargo"
        confirmLabel="Confirmar cargo"
        submitting={saving}
        submitError={submitError}
        total={chargeTotal}
        subtotal={subtotalForDiscount}
        descuentoMonto={chargeDescuentoMonto}
        hayDescuento={hayDescuento}
        partyValue={clientName.trim() || SERVICE_CHARGE_SNAPSHOT_PLACEHOLDER}
        comprobanteLabel={comprobanteDisplayLabel}
        paymentLabel={paymentLabel}
        onConfirm={() => {
          void handleSubmit()
        }}
      />

      <AlertDialog open={descartarConfirmOpen} onOpenChange={setDescartarConfirmOpen}>
        <RootsAlertDialogContent>
          <RootsAlertDialogPanel
            title="¿Descartar el cargo?"
            description="Se quitarán el servicio, el cliente, la configuración, el medio de pago, el comprobante y los descuentos. Esta acción no se puede deshacer."
          />
          <RootsAlertDialogFooter
            cancelLabel="Cancelar"
            confirmLabel="Descartar"
            destructive
            onCancel={() => setDescartarConfirmOpen(false)}
            onConfirm={resetCharge}
          />
        </RootsAlertDialogContent>
      </AlertDialog>

      <AlertDialog open={successOpen} onOpenChange={setSuccessOpen}>
        <RootsAlertDialogContent>
          <RootsAlertDialogPanel
            title="Cargo creado"
            description="El servicio quedó registrado. Podés seguir cobrando o revisar los cargos en Operaciones."
          />
          <RootsAlertDialogFooter
            confirmLabel="Seguir cobrando"
            onConfirm={() => setSuccessOpen(false)}
          />
        </RootsAlertDialogContent>
      </AlertDialog>
    </>
  )
}
