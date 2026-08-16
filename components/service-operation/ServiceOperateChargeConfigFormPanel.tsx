"use client"

import type { ServiceTypeChargeOption } from "@/app/[siteId]/[popId]/active-services/actions"
import { ServiceChargeAddonFields } from "@/app/[siteId]/[popId]/active-services/components/ServiceChargeAddonFields"
import type {
  ServiceChargeCreateFieldErrors,
  ServiceChargeCreateWizardForm,
} from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import { ChannelDataPanel } from "@/components/sale-operation/ChannelOperationDataPanel"
import { ChannelDataFormSection } from "@/components/sale-operation/ChannelDataFormFields"
import { ServiceOperateServiceConfigFields } from "@/components/service-operation/ServiceOperateServiceConfigFields"
import {
  RootsFormIntegerField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextareaField,
  RootsFormToneProvider,
  rootsFormTwoColRowClass,
} from "@/components/rootsy-form"
import {
  SERVICE_DUE_DAYS_LABEL_INFO,
  SERVICE_PAYMENT_TIMINGS,
  SERVICE_PAYMENT_TIMING_LABELS,
  type ServicePaymentTiming,
} from "@/lib/serviceCatalogTypes"

type Props = {
  form: ServiceChargeCreateWizardForm
  selectedService: ServiceTypeChargeOption
  fieldErrors: ServiceChargeCreateFieldErrors
  disabled?: boolean
  onChange: (patch: Partial<ServiceChargeCreateWizardForm>) => void
}

export function ServiceOperateChargeConfigFormPanel({
  form,
  selectedService,
  fieldErrors,
  disabled = false,
  onChange,
}: Props) {
  return (
    <ChannelDataPanel className="flex-1">
      <RootsFormToneProvider tone="light">
        <ChannelDataFormSection>
          <ServiceOperateServiceConfigFields
            form={form}
            selectedService={selectedService}
            fieldErrors={fieldErrors}
            disabled={disabled}
            tone="light"
            showSectionTitle={false}
            fieldIdPrefix="snapshot-config"
            onChange={onChange}
          />

          <div className={rootsFormTwoColRowClass}>
            <RootsFormSelectField
              label="¿Cuándo se paga?"
              id="snapshot-config-payment-timing"
              value={form.paymentTiming}
              onValueChange={(value) =>
                onChange({ paymentTiming: value as ServicePaymentTiming })
              }
              disabled={disabled}
              error={fieldErrors.paymentTiming}
              invalid={Boolean(fieldErrors.paymentTiming)}
            >
              {SERVICE_PAYMENT_TIMINGS.map((timing) => (
                <RootsFormSelectItem key={timing} value={timing}>
                  {SERVICE_PAYMENT_TIMING_LABELS[timing]}
                </RootsFormSelectItem>
              ))}
            </RootsFormSelectField>

            <RootsFormIntegerField
              label="Vencimiento"
              id="snapshot-config-due-days-after"
              value={form.dueDaysAfter}
              onChange={(value) => onChange({ dueDaysAfter: value })}
              disabled={disabled}
              max={365}
              labelInfo={SERVICE_DUE_DAYS_LABEL_INFO}
              error={fieldErrors.dueDaysAfter}
              invalid={Boolean(fieldErrors.dueDaysAfter)}
            />
          </div>

          <ServiceChargeAddonFields
            form={form}
            selectedService={selectedService}
            disabled={disabled}
            fieldIdPrefix="snapshot-config"
            onChange={onChange}
          />

          <RootsFormTextareaField
            label="Notas"
            id="snapshot-config-notes"
            value={form.notes ?? ""}
            onChange={(e) => onChange({ notes: e.target.value })}
            disabled={disabled}
            rows={3}
            placeholder="Opcional — observaciones para tu equipo"
          />
        </ChannelDataFormSection>
      </RootsFormToneProvider>
    </ChannelDataPanel>
  )
}
