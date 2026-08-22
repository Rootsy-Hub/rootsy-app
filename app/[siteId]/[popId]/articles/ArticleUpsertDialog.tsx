"use client"

import type { ArticleCategoryOption } from "@/app/[siteId]/[popId]/articles/actions"
import type { SalePriceList } from "@/lib/salePriceLists"
import {
  ArticleUpsertFormFields,
  ARTICLE_UPSERT_WIZARD_STEPS,
  hasArticleUpsertFieldErrors,
  validateArticleUpsertWizardStep,
  type ArticleUpsertFieldErrors,
  type ArticleUpsertFormState,
  type ArticleUpsertWizardStep,
} from "@/app/[siteId]/[popId]/articles/ArticleUpsertFormFields"
import { ArticleUpsertSummaryPanel } from "@/app/[siteId]/[popId]/articles/components/ArticleUpsertSummaryPanel"
import type { ArticleCostFormLine } from "@/app/[siteId]/[popId]/articles/components/ArticleCostEditor"
import type { ArticleItemKind } from "@/lib/articleItemKind"
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
import { useCallback, useState, type FormEvent, type FormEventHandler } from "react"

type FormFieldsProps = {
  idPrefix: string
  siteId: string
  popId: string
  form: ArticleUpsertFormState
  onChange: (patch: Partial<ArticleUpsertFormState>) => void
  onItemKindChange: (kind: ArticleItemKind) => void
  categories: ArticleCategoryOption[]
  categoriesLoading?: boolean
  priceLists?: SalePriceList[]
  priceListsLoading?: boolean
  supplierOptions: { id: string; name: string }[]
  costLines: ArticleCostFormLine[]
  onCostLinesChange: (lines: ArticleCostFormLine[]) => void
  canPostInitialStock?: boolean
  disabled?: boolean
}

type Props = FormFieldsProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  title: string
  loading?: boolean
  loadingMessage?: string
  refreshing?: boolean
  saving?: boolean
  banner?: string | null
  onBannerChange?: (message: string | null) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  onCancel: () => void
}

const LAST_STEP: ArticleUpsertWizardStep = 3

function clearErrorsForPatch(
  errors: ArticleUpsertFieldErrors,
  patch: Partial<ArticleUpsertFormState>,
): ArticleUpsertFieldErrors {
  const next = { ...errors }
  let changed = false

  for (const key of Object.keys(patch) as (keyof ArticleUpsertFieldErrors)[]) {
    if (next[key]) {
      delete next[key]
      changed = true
    }
  }

  return changed ? next : errors
}

export function ArticleUpsertDialog({
  open,
  onOpenChange,
  mode,
  title,
  loading = false,
  loadingMessage = "Cargando categorías…",
  refreshing = false,
  saving = false,
  banner,
  onBannerChange,
  onSubmit,
  onCancel,
  form,
  siteId,
  onChange,
  onItemKindChange,
  categories,
  categoriesLoading = false,
  priceLists,
  priceListsLoading = false,
  supplierOptions,
  costLines,
  canPostInitialStock,
  idPrefix,
  popId,
  ...formProps
}: Props) {
  const [step, setStep] = useState<ArticleUpsertWizardStep>(1)
  const [fieldErrors, setFieldErrors] = useState<ArticleUpsertFieldErrors>({})

  const resetWizard = useCallback(() => {
    setStep(1)
    setFieldErrors({})
  }, [])

  useDeferredDialogReset(open, resetWizard)

  const stepMeta = ARTICLE_UPSERT_WIZARD_STEPS.find((item) => item.step === step)!
  const isLastStep = step === LAST_STEP
  const confirmLabel = mode === "create" ? "Crear" : "Guardar"
  const confirmLoadingLabel = mode === "create" ? "Creando…" : "Guardando…"

  const handleFormChange = useCallback(
    (patch: Partial<ArticleUpsertFormState>) => {
      onChange(patch)
      setFieldErrors((current) => clearErrorsForPatch(current, patch))
      onBannerChange?.(null)
    },
    [onChange, onBannerChange],
  )

  const handlePrevious = () => {
    setFieldErrors({})
    onBannerChange?.(null)
    setStep((current) => (current > 1 ? ((current - 1) as ArticleUpsertWizardStep) : current))
  }

  const handleNext = () => {
    const errors = validateArticleUpsertWizardStep(step, form)
    if (hasArticleUpsertFieldErrors(errors)) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    onBannerChange?.(null)
    // Diferir el cambio de paso para que el click en "Siguiente" no caiga
    // sobre el botón "Crear" (submit) que ocupa el mismo lugar al paso 3.
    window.setTimeout(() => {
      setStep((current) =>
        current < LAST_STEP ? ((current + 1) as ArticleUpsertWizardStep) : current,
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
        {refreshing ? (
          <div
            className="h-0.5 w-full overflow-hidden bg-[color:var(--rootsy-bruma-200)]"
            aria-hidden
          >
            <div className="h-full w-1/3 animate-pulse bg-[color:var(--rootsy-savia-500)]/50" />
          </div>
        ) : null}
        {loading ? (
          <RootsDialogBody>
            <RootsDialogLoadingState message={loadingMessage} />
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
                    <ArticleUpsertFormFields
                      idPrefix={idPrefix}
                      popId={popId}
                      mode={mode}
                      form={form}
                      siteId={siteId}
                      step={step}
                      fieldErrors={fieldErrors}
                      onChange={handleFormChange}
                      onItemKindChange={onItemKindChange}
                      categories={categories}
                      categoriesLoading={categoriesLoading}
                      priceLists={priceLists}
                      priceListsLoading={priceListsLoading}
                      supplierOptions={supplierOptions}
                      costLines={costLines}
                      onCostLinesChange={formProps.onCostLinesChange}
                      canPostInitialStock={canPostInitialStock}
                      disabled={formProps.disabled}
                    />
                  </div>
                </div>

                <div
                  className={cn(rootsFormGridDividerClass, "hidden sm:block")}
                  aria-hidden
                />

                <div className="flex min-h-0 flex-col sm:pl-1">
                  <div className="rootsy-scroll-minimal min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 py-[var(--rootsy-space-200)]">
                    <ArticleUpsertSummaryPanel
                      form={form}
                      siteId={siteId}
                      mode={mode}
                      categories={categories}
                      supplierOptions={supplierOptions}
                      costLines={costLines}
                      canPostInitialStock={canPostInitialStock}
                    />
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
                      disabled={saving}
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
                      disabled={saving}
                      className="shrink-0"
                    >
                      {confirmLabel}
                    </RootsPrimaryButton>
                  )
                ) : (
                  <RootsPrimaryButton
                    type="button"
                    onClick={handleNext}
                    disabled={saving}
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
