"use client"

import type { ServiceCategoryOption } from "@/app/[siteId]/[popId]/services/actions"
import { ServiceAddonsEditor } from "@/app/[siteId]/[popId]/services/components/ServiceAddonsEditor"
import { ServiceImageUploadField } from "@/app/[siteId]/[popId]/services/components/ServiceImageUploadField"
import { ServiceSpreadsheetEditor } from "@/app/[siteId]/[popId]/services/components/ServiceSpreadsheetEditor"
import {
  serviceDialogSectionHintClass,
  serviceDialogSectionTitleClass,
} from "@/app/[siteId]/[popId]/services/serviceDialogShared"
import type {
  ServiceFormState,
  ServiceUpsertFieldErrors,
  ServiceUpsertWizardStep,
} from "@/app/[siteId]/[popId]/services/serviceFormState"
import { ArticleCatalogDiscountField } from "@/app/[siteId]/[popId]/articles/ArticleCatalogDiscountField"
import {
  RootsFormIntegerField,
  RootsFormMoneyField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormSwitchField,
  RootsFormTextField,
  RootsFormTextareaField,
  rootsFormColumnClass,
  rootsFormTwoColRowClass,
} from "@/components/rootsy-form"
import {
  SERVICE_BILLING_PERIODS,
  SERVICE_BILLING_PERIOD_LABELS,
  SERVICE_LATE_INTEREST_TYPES,
  SERVICE_LATE_INTEREST_TYPE_LABELS,
  SERVICE_PAYMENT_TIMINGS,
  SERVICE_PAYMENT_TIMING_LABELS,
  SERVICE_DUE_DAYS_LABEL_INFO,
  type ServiceBillingPeriod,
  type ServiceLateInterestType,
  type ServicePaymentTiming,
} from "@/lib/serviceCatalogTypes"
import { parseMoneyInput } from "@/lib/moneyInput"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  idPrefix: string
  popId: string
  form: ServiceFormState
  onChange: (patch: Partial<ServiceFormState>) => void
  categories: ServiceCategoryOption[]
  step: ServiceUpsertWizardStep
  fieldErrors?: ServiceUpsertFieldErrors
  disabled?: boolean
}

function WizardSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h3 className={serviceDialogSectionTitleClass}>{title}</h3>
        {description ? (
          <p className={serviceDialogSectionHintClass}>{description}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

export function ServiceUpsertFormFields({
  idPrefix,
  popId,
  form,
  onChange,
  categories,
  step,
  fieldErrors = {},
  disabled = false,
}: Props) {
  if (step === 1) {
    return (
      <div className={cn(rootsFormColumnClass, "gap-6")}>
        <WizardSection title="Datos del servicio">
          <div className={rootsFormTwoColRowClass}>
            <RootsFormSelectField
              label="Categoría"
              id={`${idPrefix}-category`}
              value={form.categoryId}
              onValueChange={(value) => onChange({ categoryId: value })}
              disabled={disabled || categories.length === 0}
              placeholder="Elegí una categoría"
              error={fieldErrors.categoryId}
              invalid={Boolean(fieldErrors.categoryId)}
              hint={
                categories.length === 0
                  ? "Creá al menos una categoría antes de cargar servicios."
                  : undefined
              }
            >
              {categories.map((category) => (
                <RootsFormSelectItem key={category.id} value={category.id}>
                  {category.name}
                </RootsFormSelectItem>
              ))}
            </RootsFormSelectField>

            <RootsFormTextField
              label="Nombre"
              id={`${idPrefix}-name`}
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Ej. Plan mensual básico"
              disabled={disabled}
              required
              error={fieldErrors.name}
              invalid={Boolean(fieldErrors.name)}
            />
          </div>

          <RootsFormTextareaField
            label="Descripción"
            id={`${idPrefix}-description`}
            value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Opcional — resumen visible en el listado"
            disabled={disabled}
            rows={2}
          />

          <ServiceImageUploadField
            id={`${idPrefix}-image`}
            popId={popId}
            value={form.imageUrl}
            onChange={(imageUrl) => onChange({ imageUrl })}
            disabled={disabled}
          />
        </WizardSection>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className={cn(rootsFormColumnClass, "gap-6")}>
        <WizardSection
          title="Detalles (opcional)"
          description="Armá una guía en formato planilla."
        >
          <ServiceSpreadsheetEditor
            idPrefix={idPrefix}
            grid={form.detailsGrid}
            onChange={(detailsGrid) => onChange({ detailsGrid })}
            disabled={disabled}
          />
        </WizardSection>

        <RootsFormTextareaField
          label="Contrato (opcional)"
          id={`${idPrefix}-contract`}
          value={form.contractText}
          onChange={(e) => onChange({ contractText: e.target.value })}
          placeholder="Cláusulas, condiciones, alcance del servicio…"
          disabled={disabled}
          rows={8}
        />
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className={cn(rootsFormColumnClass, "gap-6")}>
        <ServiceAddonsEditor
          idPrefix={idPrefix}
          popId={popId}
          addonLines={form.addonLines}
          baseArticleLines={form.articleLines}
          onAddonLinesChange={(addonLines) => onChange({ addonLines })}
          onBaseArticleLinesChange={(articleLines) => onChange({ articleLines })}
          disabled={disabled}
          addonError={fieldErrors.addonLines}
          baseArticleError={fieldErrors.articleLines}
        />
      </div>
    )
  }

  const salePrice = parseMoneyInput(form.defaultPrice, 0)

  return (
    <div className={cn(rootsFormColumnClass, "gap-6")}>
      <WizardSection title="Precio y cobro">
        <div className={rootsFormTwoColRowClass}>
          <RootsFormSelectField
            label="Periodicidad"
            id={`${idPrefix}-period`}
            value={form.billingPeriod}
            onValueChange={(value) =>
              onChange({ billingPeriod: value as ServiceBillingPeriod })
            }
            disabled={disabled}
          >
            {SERVICE_BILLING_PERIODS.map((period) => (
              <RootsFormSelectItem key={period} value={period}>
                {SERVICE_BILLING_PERIOD_LABELS[period]}
              </RootsFormSelectItem>
            ))}
          </RootsFormSelectField>

          <RootsFormMoneyField
            label="Precio"
            id={`${idPrefix}-price`}
            value={form.defaultPrice}
            onChange={(value) => onChange({ defaultPrice: value })}
            disabled={disabled}
            error={fieldErrors.defaultPrice}
            invalid={Boolean(fieldErrors.defaultPrice)}
          />
        </div>

        {form.billingPeriod === "custom" ? (
          <RootsFormTextField
            label="Etiqueta del período"
            id={`${idPrefix}-period-label`}
            value={form.billingPeriodLabel}
            onChange={(e) => onChange({ billingPeriodLabel: e.target.value })}
            placeholder="Ej. Trimestral, Por sesión"
            disabled={disabled}
            error={fieldErrors.billingPeriodLabel}
            invalid={Boolean(fieldErrors.billingPeriodLabel)}
          />
        ) : null}

        <div className={rootsFormTwoColRowClass}>
          <RootsFormSelectField
            label="¿Cuándo se paga?"
            id={`${idPrefix}-payment-timing`}
            value={form.paymentTiming}
            onValueChange={(value) =>
              onChange({ paymentTiming: value as ServicePaymentTiming })
            }
            disabled={disabled}
          >
            {SERVICE_PAYMENT_TIMINGS.map((timing) => (
              <RootsFormSelectItem key={timing} value={timing}>
                {SERVICE_PAYMENT_TIMING_LABELS[timing]}
              </RootsFormSelectItem>
            ))}
          </RootsFormSelectField>

          <RootsFormIntegerField
            label="Vencimiento"
            id={`${idPrefix}-due-days-after`}
            value={form.dueDaysAfter}
            onChange={(value) => onChange({ dueDaysAfter: value })}
            disabled={disabled}
            labelInfo={SERVICE_DUE_DAYS_LABEL_INFO}
            error={fieldErrors.dueDaysAfter}
            invalid={Boolean(fieldErrors.dueDaysAfter)}
          />
        </div>
      </WizardSection>

      <WizardSection
        title="Interés por mora"
        description="Opcional — se aplica al no pagar a tiempo."
      >
        <div className={rootsFormTwoColRowClass}>
          <RootsFormSelectField
            label="Tipo de interés"
            id={`${idPrefix}-interest-type`}
            value={form.lateInterestType}
            onValueChange={(value) =>
              onChange({
                lateInterestType: value as ServiceLateInterestType,
                lateInterestValue:
                  value === "none" ? "" : form.lateInterestValue,
              })
            }
            disabled={disabled}
          >
            {SERVICE_LATE_INTEREST_TYPES.map((type) => (
              <RootsFormSelectItem key={type} value={type}>
                {SERVICE_LATE_INTEREST_TYPE_LABELS[type]}
              </RootsFormSelectItem>
            ))}
          </RootsFormSelectField>

          {form.lateInterestType === "simple_percent" ? (
            <RootsFormTextField
              label="Porcentaje mensual"
              id={`${idPrefix}-interest-value`}
              value={form.lateInterestValue}
              onChange={(e) => onChange({ lateInterestValue: e.target.value })}
              placeholder="Ej. 2"
              disabled={disabled}
              error={fieldErrors.lateInterestValue}
              invalid={Boolean(fieldErrors.lateInterestValue)}
            />
          ) : null}
        </div>
      </WizardSection>

      <WizardSection title="Descuento" description="Opcional — sobre el precio del servicio.">
        <ArticleCatalogDiscountField
          idPrefix={`${idPrefix}-discount`}
          discountMode={
            form.discountMode === "porcentaje" || form.discountMode === "fijo"
              ? form.discountMode
              : ""
          }
          discountValue={form.discountValue}
          onChange={(patch) => onChange(patch)}
          salePrice={salePrice}
          disabled={disabled}
        />
        {fieldErrors.discountValue ? (
          <p className="text-sm text-[var(--rootsy-coral-700)]">
            {fieldErrors.discountValue}
          </p>
        ) : null}
      </WizardSection>

      <WizardSection title="Estado">
        <RootsFormSwitchField
          label="Servicio activo en el catálogo"
          id={`${idPrefix}-active`}
          checked={form.isActive}
          onCheckedChange={(checked) => onChange({ isActive: checked })}
          disabled={disabled}
        />
      </WizardSection>
    </div>
  )
}
