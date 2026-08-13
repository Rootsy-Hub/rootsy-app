"use client"

import { ServiceUpsertFormFields } from "@/app/[siteId]/[popId]/services/ServiceUpsertFormFields"
import { ServiceUpsertSummaryPanel } from "@/app/[siteId]/[popId]/services/components/ServiceUpsertSummaryPanel"
import type {
  ServiceArticleOption,
  ServiceCategoryOption,
} from "@/app/[siteId]/[popId]/services/actions"
import {
  hasServiceUpsertFieldErrors,
  SERVICE_UPSERT_WIZARD_STEPS,
  validateServiceUpsertWizardStep,
  type ServiceFormState,
  type ServiceUpsertFieldErrors,
  type ServiceUpsertWizardStep,
} from "@/app/[siteId]/[popId]/services/serviceFormState"
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
  RootsDialogLoadingState,
  useDeferredDialogReset,
} from "@/components/rootsy-dialog"
import { rootsFormColumnClass, rootsFormGridDividerClass } from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type FormEvent,
  type FormEventHandler,
  type SetStateAction,
} from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  title: string
  loading?: boolean
  saving?: boolean
  banner?: string | null
  onBannerChange?: (message: string | null) => void
  form: ServiceFormState
  setForm: Dispatch<SetStateAction<ServiceFormState>>
  categories: ServiceCategoryOption[]
  articleOptions: ServiceArticleOption[]
  popId: string
  onSubmit: FormEventHandler<HTMLFormElement>
  onCancel: () => void
  onAfterClose?: () => void
}

const LAST_STEP: ServiceUpsertWizardStep = 4

function clearErrorsForPatch(
  errors: ServiceUpsertFieldErrors,
  patch: Partial<ServiceFormState>,
): ServiceUpsertFieldErrors {
  const next = { ...errors }
  let changed = false

  if ("categoryId" in patch && next.categoryId) {
    delete next.categoryId
    changed = true
  }
  if ("name" in patch && next.name) {
    delete next.name
    changed = true
  }
  if ("defaultPrice" in patch && next.defaultPrice) {
    delete next.defaultPrice
    changed = true
  }
  if ("billingPeriodLabel" in patch && next.billingPeriodLabel) {
    delete next.billingPeriodLabel
    changed = true
  }
  if ("dueDaysAfter" in patch && next.dueDaysAfter) {
    delete next.dueDaysAfter
    changed = true
  }
  if ("lateInterestValue" in patch && next.lateInterestValue) {
    delete next.lateInterestValue
    changed = true
  }
  if ("discountValue" in patch && next.discountValue) {
    delete next.discountValue
    changed = true
  }
  if ("articleLines" in patch && next.articleLines) {
    delete next.articleLines
    changed = true
  }

  return changed ? next : errors
}

export function ServiceUpsertDialog({
  open,
  onOpenChange,
  mode,
  title,
  loading = false,
  saving = false,
  banner,
  onBannerChange,
  form,
  setForm,
  categories,
  articleOptions,
  popId,
  onSubmit,
  onCancel,
  onAfterClose,
}: Props) {
  const [step, setStep] = useState<ServiceUpsertWizardStep>(1)
  const [fieldErrors, setFieldErrors] = useState<ServiceUpsertFieldErrors>({})

  const resetWizard = useCallback(() => {
    setStep(1)
    setFieldErrors({})
  }, [])

  useDeferredDialogReset(open, resetWizard)

  useEffect(() => {
    if (open) return
    const timer = window.setTimeout(() => {
      onAfterClose?.()
    }, 220)
    return () => window.clearTimeout(timer)
  }, [open, onAfterClose])

  const stepMeta = SERVICE_UPSERT_WIZARD_STEPS.find((item) => item.step === step)!
  const isLastStep = step === LAST_STEP
  const confirmLabel = mode === "create" ? "Crear servicio" : "Guardar cambios"
  const confirmLoadingLabel = mode === "create" ? "Creando…" : "Guardando…"
  const idPrefix = mode === "create" ? "service-create" : "service-edit"

  const handleFormChange = useCallback(
    (patch: Partial<ServiceFormState>) => {
      setForm((current) => ({ ...current, ...patch }))
      setFieldErrors((current) => clearErrorsForPatch(current, patch))
      onBannerChange?.(null)
    },
    [setForm, onBannerChange],
  )

  const handlePrevious = () => {
    setFieldErrors({})
    onBannerChange?.(null)
    setStep((current) =>
      current > 1 ? ((current - 1) as ServiceUpsertWizardStep) : current,
    )
  }

  const handleNext = () => {
    const errors = validateServiceUpsertWizardStep(step, form)
    if (hasServiceUpsertFieldErrors(errors)) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    onBannerChange?.(null)
    window.setTimeout(() => {
      setStep((current) =>
        current < LAST_STEP ? ((current + 1) as ServiceUpsertWizardStep) : current,
      )
    }, 0)
  }

  const handleConfirm = () => {
    if (!isLastStep) return
    onSubmit({ preventDefault: () => {} } as FormEvent<HTMLFormElement>)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isLastStep) {
      handleNext()
      return
    }
    onSubmit(event)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <RootsDialogContent size="twoCol" className="sm:!max-w-[47rem]">
          <RootsDialogHeader
            title={title}
            description={`Paso ${step}/${LAST_STEP} · ${stepMeta.label}`}
          />
          {loading ? (
            <RootsDialogBody>
              <RootsDialogLoadingState message="Cargando servicio…" />
            </RootsDialogBody>
          ) : (
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
                      <ServiceUpsertFormFields
                        idPrefix={idPrefix}
                        popId={popId}
                        form={form}
                        onChange={handleFormChange}
                        categories={categories}
                        articleOptions={articleOptions}
                        step={step}
                        fieldErrors={fieldErrors}
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
                      <ServiceUpsertSummaryPanel form={form} categories={categories} />
                    </div>
                  </div>
                </div>
              </RootsDialogBody>
              <RootsDialogFooter>
                <div className="flex w-full items-center justify-between gap-3">
                  <RootsSubtleButton
                    type="button"
                    onClick={step === 1 ? onCancel : handlePrevious}
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
                        disabled={saving || categories.length === 0}
                        loading={saving}
                        loadingLabel={confirmLoadingLabel}
                        className="shrink-0"
                      >
                        {confirmLabel}
                      </RootsProgressButton>
                    ) : (
                      <RootsPrimaryButton
                        type="button"
                        onClick={handleConfirm}
                        disabled={saving || categories.length === 0}
                        className="shrink-0"
                      >
                        {confirmLabel}
                      </RootsPrimaryButton>
                    )
                  ) : (
                    <RootsPrimaryButton
                      type="button"
                      onClick={handleNext}
                      disabled={saving || (step === 1 && categories.length === 0)}
                      className="shrink-0"
                    >
                      Siguiente
                    </RootsPrimaryButton>
                  )}
                </div>
              </RootsDialogFooter>
            </RootsDialogForm>
          )}
        </RootsDialogContent>
      ) : null}
    </Dialog>
  )
}

export {
  defaultServiceFormState,
  serviceFormFromDetail,
  serviceFormToPayload,
} from "@/app/[siteId]/[popId]/services/serviceFormState"
