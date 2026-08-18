"use client"

import type {
  CreateServiceChargeInput,
  ServiceChargePaymentMethodOption,
  ServiceTypeChargeOption,
} from "@/app/[siteId]/[popId]/active-services/actions"
import { ServiceChargeCreateFormFields } from "@/app/[siteId]/[popId]/active-services/components/ServiceChargeCreateFormFields"
import { ServiceChargeCreateSummaryPanel } from "@/app/[siteId]/[popId]/active-services/components/ServiceChargeCreateSummaryPanel"
import {
  buildServiceChargeClientPayload,
  emptyServiceChargeClientDraft,
  normalizeServiceChargeClientDraft,
  serviceChargeEffectiveClientIva,
} from "@/app/[siteId]/[popId]/active-services/components/ServiceChargeClientField"
import {
  hasServiceChargeCreateFieldErrors,
  SERVICE_CHARGE_COMPROBANTE_AUTO,
  SERVICE_CHARGE_CREATE_WIZARD_STEPS,
  validateServiceChargeCreateWizardStep,
  type ServiceChargeCreateFieldErrors,
  type ServiceChargeCreateWizardForm,
  type ServiceChargeCreateWizardStep,
} from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import {
  RootsPrimaryButton,
  RootsProgressButton,
  RootsSubtleButton,
} from "@/components/rootsy-button"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogErrorBanner,
  RootsDialogFooter,
  RootsDialogForm,
  RootsDialogHeader,
  useDeferredDialogReset,
} from "@/components/rootsy-dialog"
import { rootsFormColumnClass, rootsFormGridDividerClass } from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import type { ClientIvaConditionValue } from "@/app/[siteId]/[popId]/clients/clientIvaConstants"
import { formatMoneyInputForField, parseMoneyInput } from "@/lib/moneyInput"
import { parseNonNegativeIntegerInput } from "@/lib/integerInput"
import type { ServiceDiscountMode } from "@/lib/serviceCatalogTypes"
import { getSaleComprobantePickerOptions } from "@/lib/saleComprobantePicker"
import { suggestSaleComprobanteForClientIva } from "@/lib/saleComprobanteRules"
import {
  availableBillingScopesForService,
  billingPeriodRequiresManualPeriodEnd,
} from "@/lib/serviceChargeTypes"
import { resolveChargeAddonSelections } from "@/lib/serviceChargeAddonSelection"
import { cn } from "@/lib/utils"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  popId: string
  siteId: string
  services: ServiceTypeChargeOption[]
  paymentMethods: ServiceChargePaymentMethodOption[]
  canReadClients: boolean
  canCreateClient: boolean
  canUpdateClient: boolean
  saving?: boolean
  banner?: string | null
  onSubmit: (input: CreateServiceChargeInput) => void
}

const LAST_STEP: ServiceChargeCreateWizardStep = 3

function todayIso(): string {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`
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

function buildClientPayload(
  draft: ServiceChargeCreateWizardForm["clientDraft"],
  canCreateClient: boolean,
): Pick<
  CreateServiceChargeInput,
  "clientId" | "newClient" | "updateExistingClient" | "saveNewClient"
> {
  return buildServiceChargeClientPayload(draft, { canCreateClient })
}

function clearErrorsForPatch(
  errors: ServiceChargeCreateFieldErrors,
  patch: Partial<ServiceChargeCreateWizardForm>,
): ServiceChargeCreateFieldErrors {
  const next = { ...errors }
  let changed = false

  if ("clientDraft" in patch) {
    if (next.client) {
      delete next.client
      changed = true
    }
    if (next.clientManualName) {
      delete next.clientManualName
      changed = true
    }
    if (next.clientEmail) {
      delete next.clientEmail
      changed = true
    }
  }
  if ("serviceTypeId" in patch && next.serviceTypeId) {
    delete next.serviceTypeId
    changed = true
  }
  if ("periodCount" in patch && next.periodCount) {
    delete next.periodCount
    changed = true
  }
  if ("periodStartDate" in patch && next.periodStartDate) {
    delete next.periodStartDate
    changed = true
  }
  if ("periodEndDate" in patch && next.periodEndDate) {
    delete next.periodEndDate
    changed = true
  }
  if ("paymentTiming" in patch && next.paymentTiming) {
    delete next.paymentTiming
    changed = true
  }
  if ("dueDaysAfter" in patch && next.dueDaysAfter) {
    delete next.dueDaysAfter
    changed = true
  }
  if ("billingScope" in patch && next.billingScope) {
    delete next.billingScope
    changed = true
  }
  if ("unitPrice" in patch && next.unitPrice) {
    delete next.unitPrice
    changed = true
  }
  if (
    ("discountMode" in patch || "discountValue" in patch) &&
    next.discountValue
  ) {
    delete next.discountValue
    changed = true
  }

  return changed ? next : errors
}

export function ServiceChargeCreateDialog({
  open,
  onOpenChange,
  popId,
  siteId,
  services,
  paymentMethods,
  canReadClients,
  canCreateClient,
  canUpdateClient,
  saving = false,
  banner,
  onSubmit,
}: Props) {
  const { bootstrap } = usePopWorkspace()
  const [step, setStep] = useState<ServiceChargeCreateWizardStep>(1)
  const [form, setForm] = useState<ServiceChargeCreateWizardForm>(defaultFormState)
  const [fieldErrors, setFieldErrors] = useState<ServiceChargeCreateFieldErrors>({})

  const resetWizard = useCallback(() => {
    setStep(1)
    setForm(defaultFormState())
    setFieldErrors({})
  }, [])

  useDeferredDialogReset(open, resetWizard)

  const stepMeta = SERVICE_CHARGE_CREATE_WIZARD_STEPS.find(
    (item) => item.step === step,
  )!
  const isLastStep = step === LAST_STEP

  const selectedService = useMemo(
    () => services.find((s) => s.id === form.serviceTypeId) ?? null,
    [services, form.serviceTypeId],
  )

  const comprobanteFormOptions = useMemo(
    () =>
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

  useEffect(() => {
    if (!selectedService) return
    const allowedScopes = availableBillingScopesForService(
      selectedService.billingPeriod,
    )
    setForm((current) => {
      const nextScope = allowedScopes.includes(current.billingScope)
        ? current.billingScope
        : allowedScopes[0]!
      const manualEnd = billingPeriodRequiresManualPeriodEnd(
        selectedService.billingPeriod,
      )
      return {
        ...current,
        unitPrice: formatMoneyInputForField(selectedService.defaultPrice),
        billingScope: nextScope,
        paymentTiming: selectedService.paymentTiming,
        dueDaysAfter: String(selectedService.dueDaysAfter),
        periodEndDate: manualEnd
          ? current.periodEndDate || current.periodStartDate
          : current.periodEndDate,
        selectedAddonIds: [],
        oneTimeAddonIds: [],
      }
    })
  }, [selectedService])

  const handleFormChange = useCallback(
    (patch: Partial<ServiceChargeCreateWizardForm>) => {
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
      setFieldErrors((current) => clearErrorsForPatch(current, patch))
    },
    [],
  )

  const handlePrevious = () => {
    setFieldErrors({})
    setStep((current) =>
      current > 1 ? ((current - 1) as ServiceChargeCreateWizardStep) : current,
    )
  }

  const handleNext = () => {
    const errors = validateServiceChargeCreateWizardStep(step, form, {
      canReadClients,
      canCreateClient,
      hasServices: services.length > 0,
      selectedService,
    })
    if (hasServiceChargeCreateFieldErrors(errors)) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setStep((current) =>
      current < LAST_STEP ? ((current + 1) as ServiceChargeCreateWizardStep) : current,
    )
  }

  const submitPayload = useCallback((): CreateServiceChargeInput | null => {
    for (let s = 1 as ServiceChargeCreateWizardStep; s <= LAST_STEP; s++) {
      const errors = validateServiceChargeCreateWizardStep(s, form, {
        canReadClients,
        canCreateClient,
        hasServices: services.length > 0,
        selectedService,
      })
      if (hasServiceChargeCreateFieldErrors(errors)) return null
    }

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

    return {
      ...buildClientPayload(form.clientDraft, canCreateClient),
      serviceTypeId: form.serviceTypeId,
      billingScope: form.billingScope,
      periodCount: chargeCount,
      periodStartDate: form.periodStartDate,
      periodEndDate: selectedService &&
        billingPeriodRequiresManualPeriodEnd(selectedService.billingPeriod)
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
  }, [form, canCreateClient, services.length, selectedService])

  const handleConfirm = () => {
    const payload = submitPayload()
    if (!payload) return
    onSubmit(payload)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isLastStep) {
      handleNext()
      return
    }
    handleConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <RootsDialogContent size="twoCol" className="sm:!max-w-[47rem]">
          <RootsDialogHeader
            title="Nuevo cargo"
            description={`Paso ${step}/${LAST_STEP} · ${stepMeta.label}`}
          />
          <RootsDialogForm onSubmit={handleSubmit} className="min-h-0 flex-1">
            <RootsDialogBody className="flex min-h-0 flex-1 flex-col overflow-hidden !py-0">
              <div
                className={cn(
                  "grid w-full min-w-0 min-h-0 flex-1 items-stretch gap-5",
                  "sm:grid-cols-[minmax(0,1fr)_1px_15rem] sm:gap-x-5 sm:gap-y-0",
                )}
              >
                <div className="flex min-h-0 flex-col">
                  <div
                    className={cn(
                      rootsFormColumnClass,
                      "rootsy-scroll-minimal min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 py-[var(--rootsy-space-200)]",
                    )}
                  >
                    {banner ? (
                      <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner>
                    ) : null}
                    <ServiceChargeCreateFormFields
                      step={step}
                      popId={popId}
                      form={form}
                      onChange={handleFormChange}
                      services={services}
                      canReadClients={canReadClients}
                      canCreateClient={canCreateClient}
                      canUpdateClient={canUpdateClient}
                      fieldErrors={fieldErrors}
                      paymentMethods={paymentMethods}
                      comprobanteFormOptions={comprobanteFormOptions}
                      suggestedComprobante={suggestedComprobante}
                      disabled={saving}
                    />
                  </div>
                </div>

                <div
                  className={cn(rootsFormGridDividerClass, "hidden sm:block")}
                  aria-hidden
                />

                <div className="flex min-h-0 flex-col sm:pl-1">
                  <div className="rootsy-scroll-minimal min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 py-[var(--rootsy-space-200)]">
                    <ServiceChargeCreateSummaryPanel
                      form={form}
                      selectedService={selectedService}
                    />
                  </div>
                </div>
              </div>
            </RootsDialogBody>
            <RootsDialogFooter>
              <div className="flex w-full items-center justify-between gap-3">
                <RootsSubtleButton
                  type="button"
                  onClick={
                    step === 1 ? () => onOpenChange(false) : handlePrevious
                  }
                  disabled={saving}
                  className="shrink-0"
                >
                  {step === 1 ? "Cancelar" : "Anterior"}
                </RootsSubtleButton>

                {isLastStep ? (
                  saving ? (
                    <RootsProgressButton
                      type="button"
                      onClick={handleConfirm}
                      disabled={saving || services.length === 0}
                      loading={saving}
                      loadingLabel="Creando…"
                      className="shrink-0"
                    >
                      Crear cargo
                    </RootsProgressButton>
                  ) : (
                    <RootsPrimaryButton
                      type="button"
                      onClick={handleConfirm}
                      disabled={saving || services.length === 0}
                      className="shrink-0"
                    >
                      Crear cargo
                    </RootsPrimaryButton>
                  )
                ) : (
                  <RootsPrimaryButton
                    type="button"
                    onClick={handleNext}
                    disabled={saving || (step === 1 && services.length === 0)}
                    className="shrink-0"
                  >
                    Siguiente
                  </RootsPrimaryButton>
                )}
              </div>
            </RootsDialogFooter>
          </RootsDialogForm>
        </RootsDialogContent>
      ) : null}
    </Dialog>
  )
}
