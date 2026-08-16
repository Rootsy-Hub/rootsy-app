"use client"

import type { ServiceTypeChargeOption } from "@/app/[siteId]/[popId]/active-services/actions"
import type {
  ServiceChargeCreateFieldErrors,
  ServiceChargeCreateWizardForm,
} from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import {
  RootsFormDateField,
  RootsFormIntegerField,
  RootsFormMoneyField,
  RootsFormSelectField,
  RootsFormSelectItem,
  rootsFormColumnClass,
  rootsFormTwoColRowClass,
} from "@/components/rootsy-form"
import { parseMoneyInput } from "@/lib/moneyInput"
import {
  SERVICE_CHARGE_PERIOD_END_AUTO_LABEL_INFO,
  SERVICE_CHARGE_PERIOD_END_LABEL_INFO,
  SERVICE_CHARGE_PERIOD_START_LABEL_INFO,
  SERVICE_CHARGE_UNIT_PRICE_LABEL_INFO,
} from "@/lib/serviceCatalogTypes"
import {
  availableBillingScopesForService,
  billingPeriodRequiresManualPeriodEnd,
  resolveChargePeriodEnd,
  SERVICE_CHARGE_BILLING_SCOPE_LABELS,
  type ServiceChargeBillingScope,
} from "@/lib/serviceChargeTypes"
import {
  layoutsOperarFormDarkMutedTextClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import { useMemo } from "react"

type Props = {
  form: ServiceChargeCreateWizardForm
  selectedService: ServiceTypeChargeOption
  fieldErrors: ServiceChargeCreateFieldErrors
  disabled?: boolean
  tone?: "light" | "dark"
  showSectionTitle?: boolean
  fieldIdPrefix?: string
  onChange: (patch: Partial<ServiceChargeCreateWizardForm>) => void
}

export function ServiceOperateServiceConfigFields({
  form,
  selectedService,
  fieldErrors,
  disabled = false,
  tone = "dark",
  showSectionTitle = true,
  fieldIdPrefix = "",
  onChange,
}: Props) {
  const scopeOptions = useMemo(
    () => availableBillingScopesForService(selectedService.billingPeriod),
    [selectedService],
  )

  const manualPeriodEnd = billingPeriodRequiresManualPeriodEnd(
    selectedService.billingPeriod,
  )

  const effectivePeriodEnd = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.periodStartDate)) return ""
    return resolveChargePeriodEnd(
      form.periodStartDate.trim(),
      selectedService.billingPeriod,
      manualPeriodEnd ? form.periodEndDate : null,
    )
  }, [selectedService, form.periodStartDate, form.periodEndDate, manualPeriodEnd])

  const isDark = tone === "dark"
  const mutedTextClass = isDark
    ? layoutsOperarFormDarkMutedTextClass
    : "text-[var(--rootsy-bruma-500)]"
  const id = (suffix: string) =>
    fieldIdPrefix ? `${fieldIdPrefix}-${suffix}` : suffix

  return (
    <div
      className={cn(rootsFormColumnClass, "gap-4")}
    >
      {showSectionTitle ? (
        <p className={cn("text-xs font-medium uppercase tracking-wide", mutedTextClass)}>
          Configuración del cargo
        </p>
      ) : null}

      <RootsFormSelectField
        label="Alcance"
        id={id("operate-charge-scope")}
        value={form.billingScope}
        onValueChange={(value) => {
          const billingScope = value as ServiceChargeBillingScope
          onChange({
            billingScope,
            ...(billingScope !== "subscription" ? { oneTimeAddonIds: [] } : {}),
          })
        }}
        disabled={disabled}
        error={fieldErrors.billingScope}
        invalid={Boolean(fieldErrors.billingScope)}
      >
        {scopeOptions.map((scope) => (
          <RootsFormSelectItem key={scope} value={scope}>
            {SERVICE_CHARGE_BILLING_SCOPE_LABELS[scope]}
          </RootsFormSelectItem>
        ))}
      </RootsFormSelectField>

      {form.billingScope === "multi_period" ? (
        <RootsFormIntegerField
          label="Cantidad de períodos"
          id={id("operate-charge-period-count")}
          value={form.periodCount}
          onChange={(value) => onChange({ periodCount: value })}
          disabled={disabled}
          error={fieldErrors.periodCount}
          invalid={Boolean(fieldErrors.periodCount)}
        />
      ) : null}

      {form.billingScope === "subscription" ? (
        <p className={cn("text-xs", mutedTextClass)}>
          Se creará la suscripción y el primer cargo. Los siguientes se generarán
          automáticamente hasta cancelar.
        </p>
      ) : null}

      <div className={rootsFormTwoColRowClass}>
        <RootsFormDateField
          label="Inicio del período"
          id={id("operate-charge-period-start")}
          value={form.periodStartDate}
          onChange={(value) => {
            const patch: Partial<ServiceChargeCreateWizardForm> = {
              periodStartDate: value,
            }
            if (
              manualPeriodEnd &&
              form.periodEndDate &&
              form.periodEndDate < value
            ) {
              patch.periodEndDate = value
            }
            onChange(patch)
          }}
          disabled={disabled}
          displayFormat="compact"
          labelInfo={SERVICE_CHARGE_PERIOD_START_LABEL_INFO}
          error={fieldErrors.periodStartDate}
          invalid={Boolean(fieldErrors.periodStartDate)}
        />
        <RootsFormDateField
          label="Fin del período"
          id={id("operate-charge-period-end")}
          value={manualPeriodEnd ? form.periodEndDate : effectivePeriodEnd}
          onChange={(value) => onChange({ periodEndDate: value })}
          disabled={disabled || !manualPeriodEnd}
          displayFormat="compact"
          labelInfo={
            manualPeriodEnd
              ? SERVICE_CHARGE_PERIOD_END_LABEL_INFO
              : SERVICE_CHARGE_PERIOD_END_AUTO_LABEL_INFO
          }
          error={fieldErrors.periodEndDate}
          invalid={Boolean(fieldErrors.periodEndDate)}
        />
      </div>

      <RootsFormMoneyField
        label="Precio unitario"
        id={id("operate-charge-unit-price")}
        value={form.unitPrice}
        onChange={(value) => onChange({ unitPrice: value })}
        disabled={disabled}
        labelInfo={SERVICE_CHARGE_UNIT_PRICE_LABEL_INFO}
        error={fieldErrors.unitPrice}
        invalid={Boolean(fieldErrors.unitPrice)}
      />
    </div>
  )
}
