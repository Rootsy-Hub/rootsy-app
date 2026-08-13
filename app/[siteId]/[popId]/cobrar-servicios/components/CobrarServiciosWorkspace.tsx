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
  normalizeServiceChargeClientDraft,
  serviceChargeEffectiveClientIva,
} from "@/app/[siteId]/[popId]/active-services/components/ServiceChargeClientField"
import {
  hasServiceChargeCreateFieldErrors,
  resolveServiceChargeComprobanteDisplayLabel,
  resolveServiceChargeComprobanteEffectiveLabel,
  SERVICE_CHARGE_COMPROBANTE_AUTO,
  validateServiceChargeCreateWizardStep,
  validateServiceChargeOperateForm,
  type ServiceChargeCreateFieldErrors,
  type ServiceChargeCreateWizardForm,
} from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import type { ClientIvaConditionValue } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import { DataWorkspaceOperationsLayout } from "@/components/layouts-module/DataWorkspaceOperationsLayout"
import { LayoutsOperarMainGrid } from "@/components/layouts-module/LayoutsOperarMainGrid"
import { useDataWorkspaceSidebar } from "@/components/layouts/useDataWorkspaceSidebar"
import { ServiceOperateSnapshotPanel } from "@/components/service-operation/ServiceOperateSnapshotPanel"
import { ServiceOperateStepContent } from "@/components/service-operation/ServiceOperateStepContent"
import { ServiceOperateStepHeader } from "@/components/service-operation/ServiceOperateStepHeader"
import { ServiceOperateStepToolbox } from "@/components/service-operation/ServiceOperateStepToolbox"
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
  availableBillingScopesForService,
  billingPeriodRequiresManualPeriodEnd,
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

function isOperateStepConfigured(
  step: ServiceOperateStep,
  form: ServiceChargeCreateWizardForm,
  options: {
    canReadClients: boolean
    canCreateClient: boolean
    hasServices: boolean
    selectedService: ServiceTypeChargeOption | null
  },
  maxReachedStep: ServiceOperateStep,
): boolean {
  if (step === 3 && maxReachedStep < 3) return false
  if (step === 3) return Boolean(form.paymentMethodKey)
  const errors = validateServiceChargeCreateWizardStep(step, form, options)
  return !hasServiceChargeCreateFieldErrors(errors)
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
  const [maxReachedStep, setMaxReachedStep] = useState<ServiceOperateStep>(1)
  const [form, setForm] = useState<ServiceChargeCreateWizardForm>(defaultFormState)
  const [fieldErrors, setFieldErrors] = useState<ServiceChargeCreateFieldErrors>({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)

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

  useEffect(() => {
    setMaxReachedStep((current) => (activeStep > current ? activeStep : current))
  }, [activeStep])

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
    setMaxReachedStep(1)
  }, [])

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

  const handleSubmit = async () => {
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
    const price = parseMoneyInput(form.unitPrice, Number.NaN)
    if (!Number.isFinite(price)) return scopeLabel
    return `${scopeLabel} · ${formatMoneyInputForField(price)}`
  }, [selectedService, form.billingScope, form.unitPrice])

  const paymentStepSummary = useMemo(() => {
    const parts = [paymentLabel, comprobanteDisplayLabel].filter(Boolean)
    return parts.join(" · ")
  }, [paymentLabel, comprobanteDisplayLabel])

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

  const stepToolboxSlots = useMemo(
    () => [
      {
        step: 1 as const,
        value: selectedService?.name.trim() || "Elegir servicio",
        configured: isOperateStepConfigured(1, form, validationOptions, maxReachedStep),
      },
      {
        step: 2 as const,
        value: !canReadClients
          ? "Sin permiso"
          : clientName.trim()
            ? `${clientName.trim()} · ${configSummary}`
            : configSummary,
        configured: isOperateStepConfigured(2, form, validationOptions, maxReachedStep),
        disabled: !canReadClients,
      },
      {
        step: 3 as const,
        value: paymentStepSummary,
        configured: isOperateStepConfigured(3, form, validationOptions, maxReachedStep),
      },
    ],
    [
      form,
      validationOptions,
      maxReachedStep,
      selectedService,
      configSummary,
      canReadClients,
      clientName,
      paymentStepSummary,
    ],
  )

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
        title="Cobrar servicio"
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
                  selectedService={activeStep === 1 ? selectedService : null}
                  onBack={() =>
                    handleStepChange((activeStep - 1) as ServiceOperateStep)
                  }
                  onNext={() =>
                    handleStepChange((activeStep + 1) as ServiceOperateStep)
                  }
                />
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
              <ServiceOperateStepToolbox
                activeStep={activeStep}
                onStepChange={handleStepChange}
                slots={stepToolboxSlots}
              />
            }
            ticket={
              <aside
                className={serviceOperateSnapshotPanelClass}
                aria-label="Resumen del cargo"
              >
                <ServiceOperateSnapshotPanel
                  form={form}
                  selectedService={selectedService}
                  treasuryPaymentContext={treasuryPaymentContext}
                  comprobanteLabel={comprobanteDisplayLabel}
                  disabled={saving}
                  saving={saving}
                  canCreate={canCreate}
                  confirmTitle={confirmTitle ?? submitError ?? undefined}
                  onDiscard={resetCharge}
                  onConfirm={() => {
                    void handleSubmit()
                  }}
                />
              </aside>
            }
          />
        </div>
      </DataWorkspaceOperationsLayout>

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

      <AlertDialog open={Boolean(submitError)} onOpenChange={() => setSubmitError(null)}>
        <RootsAlertDialogContent>
          <RootsAlertDialogPanel
            title="No se pudo crear el cargo"
            description={submitError ?? ""}
          />
          <RootsAlertDialogFooter
            confirmLabel="Entendido"
            onConfirm={() => setSubmitError(null)}
          />
        </RootsAlertDialogContent>
      </AlertDialog>
    </>
  )
}
