"use client"

import type {
  ServiceChargePaymentMethodOption,
  ServiceTypeChargeOption,
} from "@/app/[siteId]/[popId]/active-services/actions"
import { ServiceChargeClientField } from "@/app/[siteId]/[popId]/active-services/components/ServiceChargeClientField"
import { ServiceChargeAddonFields } from "@/app/[siteId]/[popId]/active-services/components/ServiceChargeAddonFields"
import { ServiceChargeBillingFields } from "@/app/[siteId]/[popId]/active-services/components/ServiceChargeBillingFields"
import type {
  ServiceChargeCreateFieldErrors,
  ServiceChargeCreateWizardForm,
  ServiceChargeCreateWizardStep,
} from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import { SERVICE_CHARGE_PAYMENT_PENDING } from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import {
  RootsFormDateField,
  RootsFormIntegerField,
  RootsFormMoneyField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextareaField,
  rootsFormColumnClass,
  rootsFormTwoColRowClass,
} from "@/components/rootsy-form"
import { parseMoneyInput } from "@/lib/moneyInput"
import {
  SERVICE_CHARGE_PERIOD_END_AUTO_LABEL_INFO,
  SERVICE_CHARGE_PERIOD_END_LABEL_INFO,
  SERVICE_CHARGE_PERIOD_START_LABEL_INFO,
} from "@/lib/serviceCatalogTypes"
import {
  availableBillingScopesForService,
  billingPeriodRequiresManualPeriodEnd,
  resolveChargePeriodEnd,
  SERVICE_CHARGE_BILLING_SCOPE_LABELS,
  type ServiceChargeBillingScope,
} from "@/lib/serviceChargeTypes"
import type { SaleComprobantePickerOption } from "@/lib/saleComprobantePicker"
import { treasuryPaymentOptionKey } from "@/lib/treasuryPaymentOptions"
import { cn } from "@/lib/utils"
import { useMemo } from "react"

type Props = {
  step: ServiceChargeCreateWizardStep
  popId: string
  form: ServiceChargeCreateWizardForm
  onChange: (patch: Partial<ServiceChargeCreateWizardForm>) => void
  services: ServiceTypeChargeOption[]
  canReadClients: boolean
  canCreateClient: boolean
  canUpdateClient: boolean
  fieldErrors: ServiceChargeCreateFieldErrors
  paymentMethods: ServiceChargePaymentMethodOption[]
  comprobanteFormOptions: SaleComprobantePickerOption[]
  suggestedComprobante: string | null
  disabled?: boolean
}

function ChargeConfigFields({
  form,
  onChange,
  selectedService,
  fieldErrors,
  disabled,
}: {
  form: ServiceChargeCreateWizardForm
  onChange: (patch: Partial<ServiceChargeCreateWizardForm>) => void
  selectedService: ServiceTypeChargeOption | null
  fieldErrors: ServiceChargeCreateFieldErrors
  disabled?: boolean
}) {
  const scopeOptions = useMemo(
    () =>
      selectedService
        ? availableBillingScopesForService(selectedService.billingPeriod)
        : (["one_period"] as ServiceChargeBillingScope[]),
    [selectedService],
  )

  const manualPeriodEnd = selectedService
    ? billingPeriodRequiresManualPeriodEnd(selectedService.billingPeriod)
    : false

  const effectivePeriodEnd = useMemo(() => {
    if (!selectedService || !/^\d{4}-\d{2}-\d{2}$/.test(form.periodStartDate)) {
      return ""
    }
    return resolveChargePeriodEnd(
      form.periodStartDate.trim(),
      selectedService.billingPeriod,
      manualPeriodEnd ? form.periodEndDate : null,
    )
  }, [
    selectedService,
    form.periodStartDate,
    form.periodEndDate,
    manualPeriodEnd,
  ])

  return (
    <div className={cn(rootsFormColumnClass, "min-w-0 gap-4")}>
      {fieldErrors.serviceTypeId ? (
        <p className="text-sm text-destructive" role="alert">
          {fieldErrors.serviceTypeId}
        </p>
      ) : null}

      <RootsFormSelectField
        label="Alcance"
        id="charge-scope"
        value={form.billingScope}
        onValueChange={(value) => {
          const billingScope = value as ServiceChargeBillingScope
          onChange({
            billingScope,
            ...(billingScope !== "subscription" ? { oneTimeAddonIds: [] } : {}),
          })
        }}
        disabled={disabled || !selectedService}
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
          id="charge-period-count"
          value={form.periodCount}
          onChange={(value) => onChange({ periodCount: value })}
          disabled={disabled}
          hint={
            selectedService?.billingPeriod === "hourly"
              ? "Ej. horas a facturar"
              : undefined
          }
          error={fieldErrors.periodCount}
          invalid={Boolean(fieldErrors.periodCount)}
        />
      ) : null}

      {form.billingScope === "subscription" ? (
        <p className="text-xs text-[var(--rootsy-bruma-600)]">
          Se creará la suscripción y el primer cargo. Los siguientes se generarán
          automáticamente hasta cancelar.
        </p>
      ) : null}

      <div className={rootsFormTwoColRowClass}>
        <RootsFormDateField
          label="Inicio del período"
          id="charge-period-start"
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
          disabled={disabled || !selectedService}
          displayFormat="compact"
          labelInfo={SERVICE_CHARGE_PERIOD_START_LABEL_INFO}
          error={fieldErrors.periodStartDate}
          invalid={Boolean(fieldErrors.periodStartDate)}
        />
        <RootsFormDateField
          label="Fin del período"
          id="charge-period-end"
          value={manualPeriodEnd ? form.periodEndDate : effectivePeriodEnd}
          onChange={(value) => onChange({ periodEndDate: value })}
          disabled={disabled || !selectedService || !manualPeriodEnd}
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
        id="charge-unit-price"
        value={form.unitPrice}
        onChange={(value) => onChange({ unitPrice: value })}
        disabled={disabled || !selectedService}
        error={fieldErrors.unitPrice}
        invalid={Boolean(fieldErrors.unitPrice)}
      />

      {selectedService ? (
        <ServiceChargeAddonFields
          form={form}
          selectedService={selectedService}
          disabled={disabled}
          onChange={onChange}
        />
      ) : null}

      <RootsFormTextareaField
        label="Notas"
        id="charge-notes"
        value={form.notes}
        onChange={(e) => onChange({ notes: e.target.value })}
        disabled={disabled}
        rows={3}
        placeholder="Opcional — observaciones para tu equipo"
      />
    </div>
  )
}

export function ServiceChargeCreateFormFields({
  step,
  popId,
  form,
  onChange,
  services,
  canReadClients,
  canCreateClient,
  canUpdateClient,
  fieldErrors,
  paymentMethods,
  comprobanteFormOptions,
  suggestedComprobante,
  disabled = false,
}: Props) {
  const selectedService =
    services.find((s) => s.id === form.serviceTypeId) ?? null

  if (step === 1) {
    return (
      <div className={cn(rootsFormColumnClass, "gap-4")}>
        <RootsFormSelectField
          label="Servicio"
          id="charge-service"
          value={form.serviceTypeId}
          onValueChange={(value) => onChange({ serviceTypeId: value })}
          disabled={disabled || services.length === 0}
          placeholder="Elegí un servicio del catálogo"
          error={fieldErrors.serviceTypeId}
          invalid={Boolean(fieldErrors.serviceTypeId)}
        >
          {services.map((service) => (
            <RootsFormSelectItem key={service.id} value={service.id}>
              {service.name} · {service.billingPeriodDisplay}
            </RootsFormSelectItem>
          ))}
        </RootsFormSelectField>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="grid w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className={cn(rootsFormColumnClass, "min-w-0 gap-4")}>
          {fieldErrors.client ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.client}
            </p>
          ) : null}
          <ServiceChargeClientField
            popId={popId}
            disabled={disabled}
            canSearchClients={canReadClients}
            canCreateClient={canCreateClient}
            canUpdateClient={canUpdateClient}
            draft={form.clientDraft}
            manualNameError={fieldErrors.clientManualName}
            emailError={fieldErrors.clientEmail}
            onDraftChange={(patch) =>
              onChange({ clientDraft: { ...form.clientDraft, ...patch } })
            }
          />
        </div>

        <ChargeConfigFields
          form={form}
          onChange={onChange}
          selectedService={selectedService}
          fieldErrors={fieldErrors}
          disabled={disabled}
        />
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="grid w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className={cn(rootsFormColumnClass, "min-w-0 gap-4")}>
          <RootsFormSelectField
            label="Medio de pago"
            id="charge-payment-method"
            value={
              form.paymentMethodKey === SERVICE_CHARGE_PAYMENT_PENDING
                ? SERVICE_CHARGE_PAYMENT_PENDING
                : form.paymentMethodKey || ""
            }
            onValueChange={(value) =>
              onChange({
                paymentMethodKey:
                  value === SERVICE_CHARGE_PAYMENT_PENDING ? SERVICE_CHARGE_PAYMENT_PENDING : value,
              })
            }
            placeholder="Elegir medio de pago"
            disabled={disabled}
            hint="Opcional — cómo esperás cobrar este cargo."
          >
            <RootsFormSelectItem value={SERVICE_CHARGE_PAYMENT_PENDING}>
              Pendiente
            </RootsFormSelectItem>
            {paymentMethods.map((method) => {
              const key = treasuryPaymentOptionKey(method)
              return (
                <RootsFormSelectItem key={key} value={key}>
                  {method.label}
                </RootsFormSelectItem>
              )
            })}
          </RootsFormSelectField>
        </div>

        <div className={cn(rootsFormColumnClass, "min-w-0 gap-4")}>
          <ServiceChargeBillingFields
            form={form}
            fieldErrors={fieldErrors}
            comprobanteFormOptions={comprobanteFormOptions}
            suggestedComprobante={suggestedComprobante}
            disabled={disabled}
            canReadClients={canReadClients}
            onChange={onChange}
          />
        </div>
      </div>
    )
  }

  return null
}
