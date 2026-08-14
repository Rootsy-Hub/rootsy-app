"use client"

import {
  createServiceCharges,
  getActiveServicesPageData,
  getServiceTypeChargeOptions,
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
  resolveServiceChargeComprobanteDisplayLabel,
  resolveServiceChargeComprobanteEffectiveLabel,
  resolveServiceChargeComprobanteToolboxLabel,
  SERVICE_CHARGE_COMPROBANTE_AUTO,
  validateServiceChargeCreateWizardStep,
  validateServiceChargeOperateForm,
  serviceChargeStep2ErrorMessages,
  serviceChargeStep3ErrorMessages,
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
import { ServiceOperateStepContent } from "@/components/service-operation/ServiceOperateStepContent"
import { ServiceOperateStepHeader } from "@/components/service-operation/ServiceOperateStepHeader"
import { ServiceOperateStepErrorBanner } from "@/components/service-operation/ServiceOperateStepErrorBanner"
import { ServiceOperateComprobanteDialog } from "@/components/service-operation/ServiceOperateComprobanteDialog"
import { ServiceOperatePaymentDialog } from "@/components/service-operation/ServiceOperatePaymentDialog"
import { GeneralDiscountDialog } from "@/components/checkout/GeneralDiscountDialog"
import { SaleFinalizeDialog } from "@/components/checkout/SaleFinalizeDialog"
import { SaleOperationToolbox } from "@/components/sale-operation/SaleOperationToolbox"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import { RootsFormToneProvider } from "@/components/rootsy-form"
import { serviceOperateSnapshotPanelClass, layoutsOperarStepEnterClass } from "@/app/library/layouts/layoutsOperarStyles"
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
import { cn } from "@/lib/utils"
import { parseNonNegativeIntegerInput } from "@/lib/integerInput"
import {
  getSaleComprobantePickerOptions,
  type SaleComprobantePickerOption,
} from "@/lib/saleComprobantePicker"
import { suggestSaleComprobanteForClientIva } from "@/lib/saleComprobanteRules"
import {
  SERVICE_PAYMENT_TIMING_LABELS,
  type ServiceDiscountMode,
} from "@/lib/serviceCatalogTypes"
import {
  resolveChargeAddonSelections,
  computeSelectedAddonsTotal,
  computeChargeAddonTotals,
  formatChargeConfigPriceSummary,
} from "@/lib/serviceChargeAddonSelection"
import {
  availableBillingScopesForService,
  billingPeriodRequiresManualPeriodEnd,
  computeChargeAmount,
  SERVICE_CHARGE_BILLING_SCOPE_LABELS,
} from "@/lib/serviceChargeTypes"
import {
  buildServiceOperateCategories,
  mapServiceTypeToCatalogItem,
} from "@/lib/serviceOperateCatalog"
import {
  type ServiceOperateStep,
  wizardStepForOperateStep,
} from "@/lib/serviceOperateSteps"
import {
  buildPaymentCheckoutSelection,
} from "@/lib/paymentMethodCheckout"
import {
  parseTreasuryPaymentOptionKey,
  type TreasuryPaymentContext,
} from "@/lib/treasuryPaymentOptions"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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

function firstOperateStepWithErrors(
  errors: ServiceChargeCreateFieldErrors,
): ServiceOperateStep | null {
  if (errors.serviceTypeId) return 1
  if (
    errors.client ||
    errors.clientManualName ||
    errors.clientEmail ||
    errors.billingScope ||
    errors.periodCount ||
    errors.periodStartDate ||
    errors.periodEndDate ||
    errors.unitPrice ||
    errors.discountValue
  ) {
    return 2
  }
  if (errors.paymentTiming || errors.dueDaysAfter || errors.comprobanteLabel) {
    return 3
  }
  if (errors.paymentMethodKey) return 3
  return null
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

  const [activeStep, setActiveStep] = useState<ServiceOperateStep>(1)
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
      setActiveStep(2)
    },
    [services, form.billingScope, form.periodEndDate, form.periodStartDate, patchForm],
  )

  const resetCharge = useCallback(() => {
    setForm(defaultFormState())
    setFieldErrors({})
    setSubmitError(null)
    setActiveStep(1)
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

  const paymentLabel = useMemo(() => {
    if (!form.paymentMethodKey) return "Sin definir"
    const parsed = parseTreasuryPaymentOptionKey(form.paymentMethodKey)
    if (!parsed || !treasuryPaymentContext) return "Medio elegido"
    return buildPaymentCheckoutSelection(
      "service_charge",
      parsed.kind,
      parsed.treasuryAccountId,
      treasuryPaymentContext,
    ).label
  }, [form.paymentMethodKey, treasuryPaymentContext])

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

  const pagoConfigurado = Boolean(form.paymentMethodKey.trim())
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

  const confirmTitle = useMemo(() => {
    if (!selectedService) return "Elegí un servicio en el paso 1."
    if (!clientName.trim()) return "Completá el cliente en el paso 2."
    if (!canCreate) return "No tenés permiso para crear cargos."
    return undefined
  }, [selectedService, clientName, canCreate])

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
      setActiveStep(1)
      return
    }

    const errors = validateServiceChargeOperateForm(form, validationOptions)
    if (hasServiceChargeCreateFieldErrors(errors)) {
      setFieldErrors(errors)
      const stepWithError = firstOperateStepWithErrors(errors)
      if (stepWithError) setActiveStep(stepWithError)
      return
    }

    setSubmitError(null)
    setCreateChargeConfirmOpen(true)
  }

  const handleSubmit = async () => {
    if (!selectedService) {
      setActiveStep(1)
      setCreateChargeConfirmOpen(false)
      return
    }

    const errors = validateServiceChargeOperateForm(form, validationOptions)
    if (hasServiceChargeCreateFieldErrors(errors)) {
      setFieldErrors(errors)
      const stepWithError = firstOperateStepWithErrors(errors)
      if (stepWithError) setActiveStep(stepWithError)
      setCreateChargeConfirmOpen(false)
      return
    }

    setSaving(true)
    setSubmitError(null)
    const payload = buildCreatePayload(form, selectedService, canCreateClient)
    const res = await createServiceCharges(popId, payload)
    if (!isMountedRef.current) return
    setSaving(false)

    if (!res.success) {
      setSubmitError(res.error)
      return
    }

    setCreateChargeConfirmOpen(false)
    setSuccessOpen(true)
    resetCharge()
    void loadPage()
  }

  const handleStepChange = (step: ServiceOperateStep) => {
    if (step < activeStep) {
      setFieldErrors({})
      setActiveStep(step)
      return
    }

    const wizardStep = wizardStepForOperateStep(activeStep)
    const stepErrors = validateServiceChargeCreateWizardStep(
      wizardStep,
      form,
      validationOptions,
    )
    if (hasServiceChargeCreateFieldErrors(stepErrors)) {
      setFieldErrors(stepErrors)
      return
    }
    setFieldErrors({})
    setActiveStep(step)
  }

  const configSummary = useMemo(() => {
    if (!selectedService) return "Configurar cargo"
    const scopeLabel = SERVICE_CHARGE_BILLING_SCOPE_LABELS[form.billingScope]
    const unitPrice = parseMoneyInput(form.unitPrice, Number.NaN)
    if (!Number.isFinite(unitPrice)) return scopeLabel

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

    const addonTotals = computeChargeAddonTotals(
      selectedService.addons,
      form.billingScope,
      form.selectedAddonIds,
      form.oneTimeAddonIds,
    )
    const priceSummary = formatChargeConfigPriceSummary({
      unitPrice,
      billingScope: form.billingScope,
      addonTotals,
      discountMode,
      discountValue:
        discountValue != null && Number.isFinite(discountValue)
          ? discountValue
          : null,
    })

    return `${scopeLabel} · ${priceSummary}`
  }, [
    selectedService,
    form.billingScope,
    form.unitPrice,
    form.selectedAddonIds,
    form.oneTimeAddonIds,
    form.discountMode,
    form.discountValue,
  ])

  const activeStepSummary = useMemo(() => {
    switch (activeStep) {
      case 1:
        if (!selectedService) return "Elegí un servicio del catálogo"
        return `${selectedService.name.trim()} · ${formatMoneyInputForField(selectedService.defaultPrice)}`
      case 2: {
        const parts: string[] = []
        if (!canReadClients) {
          parts.push("Sin permiso de clientes")
        } else if (clientName.trim()) {
          parts.push(clientName.trim())
        } else {
          parts.push("Completá cliente y configuración")
        }
        if (selectedService) parts.push(configSummary)
        return parts.join(" · ")
      }
      case 3: {
        const parts: string[] = [
          form.paymentMethodKey ? paymentLabel : "Sin definir",
        ]
        const comprobante = resolveServiceChargeComprobanteEffectiveLabel(
          form.comprobanteLabel,
          suggestedComprobante,
        )
        if (comprobante) parts.push(comprobante)
        parts.push(SERVICE_PAYMENT_TIMING_LABELS[form.paymentTiming])
        parts.push(`vence ${form.dueDaysAfter}d`)
        return parts.join(" · ")
      }
      default:
        return ""
    }
  }, [
    activeStep,
    selectedService,
    canReadClients,
    clientName,
    form.comprobanteLabel,
    form.paymentTiming,
    form.dueDaysAfter,
    form.paymentMethodKey,
    suggestedComprobante,
    configSummary,
    paymentLabel,
  ])

  const activeStepErrors = useMemo(() => {
    if (activeStep === 2) return serviceChargeStep2ErrorMessages(fieldErrors)
    if (activeStep === 3) return serviceChargeStep3ErrorMessages(fieldErrors)
    return []
  }, [activeStep, fieldErrors])

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
                <ServiceOperateStepHeader
                  step={activeStep}
                  summary={activeStepSummary}
                  onBack={() =>
                    handleStepChange((activeStep - 1) as ServiceOperateStep)
                  }
                  onNext={() =>
                    handleStepChange((activeStep + 1) as ServiceOperateStep)
                  }
                />
                <ServiceOperateStepErrorBanner messages={activeStepErrors} />
                <div className="min-h-0 flex-1 overflow-hidden bg-[var(--rootsy-sombra-800)]">
                  <RootsFormToneProvider tone="dark">
                    <div
                      key={activeStep}
                      className={cn("h-full min-h-0", layoutsOperarStepEnterClass)}
                    >
                      <ServiceOperateStepContent
                      step={activeStep}
                      popId={popId}
                      form={form}
                      fieldErrors={fieldErrors}
                      catalogItems={catalogItems}
                      catalogCategories={catalogCategories}
                      catalogLoading={loading}
                      catalogError={catalogError}
                      selectedService={selectedService}
                      treasuryPaymentContext={treasuryPaymentContext}
                      comprobanteFormOptions={comprobanteFormOptions}
                      suggestedComprobante={suggestedComprobante}
                      canReadClients={canReadClients}
                      canCreateClient={canCreateClient}
                      canUpdateClient={canUpdateClient}
                      catalogSidebarOpen={catalogSidebarOpen}
                      disabled={saving}
                      onFormChange={patchForm}
                      onSelectService={selectService}
                    />
                    </div>
                  </RootsFormToneProvider>
                </div>
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
                pagoLabel={paymentLabel}
                pagoConfigurado={pagoConfigurado}
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
                  comprobanteLabel={comprobanteDisplayLabel}
                  suggestedComprobante={suggestedComprobante}
                  disabled={saving}
                  saving={saving}
                  canCreate={canCreate}
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
        onChange={(paymentMethodKey) => patchForm({ paymentMethodKey })}
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
        partyValue={clientName.trim() || "Sin definir"}
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
            description="El servicio quedó registrado. Podés seguir cobrando o revisar los cargos activos."
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
