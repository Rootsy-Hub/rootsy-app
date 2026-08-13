"use client"

import type { ServiceTypeChargeOption } from "@/app/[siteId]/[popId]/active-services/actions"
import { ServiceChargeClientField } from "@/app/[siteId]/[popId]/active-services/components/ServiceChargeClientField"
import { ServiceChargeAddonFields } from "@/app/[siteId]/[popId]/active-services/components/ServiceChargeAddonFields"
import { ServiceChargeBillingFields } from "@/app/[siteId]/[popId]/active-services/components/ServiceChargeBillingFields"
import type {
  ServiceChargeCreateFieldErrors,
  ServiceChargeCreateWizardForm,
} from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import { ServiceOperatePaymentFields } from "@/components/service-operation/ServiceOperatePaymentFields"
import { ServiceOperateCatalogBrowser } from "@/components/service-operation/ServiceOperateCatalogBrowser"
import { ServiceOperateServiceConfigFields } from "@/components/service-operation/ServiceOperateServiceConfigFields"
import {
  RootsFormTextareaField,
  rootsFormColumnClass,
} from "@/components/rootsy-form"
import type { ServiceOperateStep } from "@/lib/serviceOperateSteps"
import type {
  ServiceOperateCatalogCategory,
  ServiceOperateCatalogItem,
} from "@/lib/serviceOperateCatalog"
import type { SaleComprobantePickerOption } from "@/lib/saleComprobantePicker"
import type { TreasuryPaymentContext } from "@/lib/treasuryPaymentOptions"
import {
  layoutsOperarCatalogColumnClass,
  layoutsOperarFormDarkMutedTextClass,
  layoutsOperarScrollMinimalClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"

type Props = {
  step: ServiceOperateStep
  popId: string
  form: ServiceChargeCreateWizardForm
  fieldErrors: ServiceChargeCreateFieldErrors
  catalogItems: ServiceOperateCatalogItem[]
  catalogCategories: ServiceOperateCatalogCategory[]
  catalogLoading: boolean
  catalogError: string | null
  selectedService: ServiceTypeChargeOption | null
  treasuryPaymentContext: TreasuryPaymentContext | null
  comprobanteFormOptions: SaleComprobantePickerOption[]
  suggestedComprobante: string | null
  canReadClients: boolean
  canCreateClient: boolean
  canUpdateClient: boolean
  catalogSidebarOpen?: boolean
  disabled?: boolean
  onFormChange: (patch: Partial<ServiceChargeCreateWizardForm>) => void
  onSelectService: (serviceId: string) => void
}

/** Canvas pasos 2 y 3 — grid 2 columnas a altura completa, scroll por columna. */
function OperateTwoColumnStep({
  left,
  right,
}: {
  left: React.ReactNode
  right: React.ReactNode
}) {
  return (
    <section
      className={cn(
        layoutsOperarCatalogColumnClass,
        "flex min-h-0 flex-1 flex-col bg-[var(--rootsy-sombra-800)]",
      )}
    >
      <div
        className={cn(
          "grid min-h-0 flex-1",
          "grid-cols-1 gap-6 overflow-y-auto",
          layoutsOperarScrollMinimalClass,
          "px-4 py-4 sm:px-5 sm:py-5",
          "lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:gap-0 lg:overflow-hidden lg:px-0 lg:py-0",
        )}
      >
        <OperateTwoColumnPane>{left}</OperateTwoColumnPane>

        <div
          className="hidden min-h-full bg-[var(--layouts-operar-border-dark-hairline)] lg:block"
          aria-hidden
        />

        <OperateTwoColumnPane>{right}</OperateTwoColumnPane>
      </div>
    </section>
  )
}

function OperateTwoColumnPane({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col lg:overflow-hidden">
      <div
        className={cn(
          layoutsOperarScrollMinimalClass,
          "min-w-0 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain",
          "lg:px-6 lg:py-6",
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function ServiceOperateStepContent({
  step,
  popId,
  form,
  fieldErrors,
  catalogItems,
  catalogCategories,
  catalogLoading,
  catalogError,
  selectedService,
  treasuryPaymentContext,
  comprobanteFormOptions,
  suggestedComprobante,
  canReadClients,
  canCreateClient,
  canUpdateClient,
  catalogSidebarOpen,
  disabled = false,
  onFormChange,
  onSelectService,
}: Props) {
  if (step === 1) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <ServiceOperateCatalogBrowser
          items={catalogItems}
          categories={catalogCategories}
          loading={catalogLoading}
          error={catalogError}
          selectedServiceId={form.serviceTypeId || null}
          catalogSidebarOpen={catalogSidebarOpen}
          disabled={disabled}
          onSelectService={onSelectService}
        />
      </div>
    )
  }

  if (step === 2) {
    return (
      <OperateTwoColumnStep
        left={
          <ServiceChargeClientField
            popId={popId}
            disabled={disabled || !canReadClients}
            canSearchClients={canReadClients}
            canCreateClient={canCreateClient}
            canUpdateClient={canUpdateClient}
            draft={form.clientDraft}
            manualNameError={fieldErrors.clientManualName}
            emailError={fieldErrors.clientEmail}
            onDraftChange={(patch) =>
              onFormChange({ clientDraft: { ...form.clientDraft, ...patch } })
            }
          />
        }
        right={
          <div className={rootsFormColumnClass}>
            {fieldErrors.serviceTypeId ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.serviceTypeId}
              </p>
            ) : null}
            {selectedService ? (
              <>
                <ServiceOperateServiceConfigFields
                  form={form}
                  selectedService={selectedService}
                  fieldErrors={fieldErrors}
                  disabled={disabled}
                  onChange={onFormChange}
                />
                <ServiceChargeAddonFields
                  form={form}
                  selectedService={selectedService}
                  disabled={disabled}
                  onChange={onFormChange}
                />
                <RootsFormTextareaField
                  label="Notas"
                  id="operate-charge-notes"
                  value={form.notes ?? ""}
                  onChange={(e) => onFormChange({ notes: e.target.value })}
                  disabled={disabled}
                  rows={3}
                  placeholder="Opcional — observaciones para tu equipo"
                />
              </>
            ) : (
              <p className={cn("text-sm", layoutsOperarFormDarkMutedTextClass)}>
                Elegí un servicio en el paso 1 para configurar el cargo.
              </p>
            )}
          </div>
        }
      />
    )
  }

  if (step === 3) {
    return (
      <OperateTwoColumnStep
        left={
          <ServiceOperatePaymentFields
            paymentMethodKey={form.paymentMethodKey}
            onChange={(paymentMethodKey) => onFormChange({ paymentMethodKey })}
            treasuryContext={treasuryPaymentContext}
            disabled={disabled}
          />
        }
        right={
          <div className={rootsFormColumnClass}>
            <p
              className={cn(
                "text-xs font-medium uppercase tracking-wide",
                layoutsOperarFormDarkMutedTextClass,
              )}
            >
              Facturación
            </p>
            <ServiceChargeBillingFields
              form={form}
              fieldErrors={fieldErrors}
              comprobanteFormOptions={comprobanteFormOptions}
              suggestedComprobante={suggestedComprobante}
              disabled={disabled}
              tone="dark"
              showSectionTitle={false}
              canReadClients={canReadClients}
              onChange={onFormChange}
            />
          </div>
        }
      />
    )
  }

  return null
}
