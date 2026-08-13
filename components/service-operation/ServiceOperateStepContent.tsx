"use client"

import type { ServiceTypeChargeOption } from "@/app/[siteId]/[popId]/active-services/actions"
import { ServiceChargeClientField } from "@/app/[siteId]/[popId]/active-services/components/ServiceChargeClientField"
import { ServiceChargeBillingFields } from "@/app/[siteId]/[popId]/active-services/components/ServiceChargeBillingFields"
import {
  serviceChargeStep2ErrorMessages,
  serviceChargeStep3ErrorMessages,
  type ServiceChargeCreateFieldErrors,
  type ServiceChargeCreateWizardForm,
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
  layoutsOperarFormCanvasScrollClass,
  layoutsOperarFormCanvasScrollEndClass,
  layoutsOperarFormDarkErrorBannerClass,
  layoutsOperarFormDarkMutedTextClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { OperarReveal } from "@/components/layouts-module/OperarReveal"
import { cn } from "@/lib/utils"
import { CircleAlert } from "lucide-react"

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

/** Canvas formularios — fondo sombra-800 + scroll con padding simétrico. */
function ClientStepCanvas({ children }: { children: React.ReactNode }) {
  return (
    <section
      className={cn(
        layoutsOperarCatalogColumnClass,
        "min-h-0 min-w-0 flex-1 flex-col bg-[var(--rootsy-sombra-800)]",
      )}
    >
      <div
        className={cn(
          layoutsOperarFormCanvasScrollClass,
          "flex min-h-0 flex-1 flex-col",
        )}
      >
        <div className={cn("min-h-0 w-full", layoutsOperarFormCanvasScrollEndClass)}>
          {children}
        </div>
      </div>
    </section>
  )
}

/** Grid 2 columnas con línea divisoria (pasos configuración / pago). */
function OperateTwoColumnStep({
  children,
  errors,
}: {
  children: React.ReactNode
  errors: string[]
}) {
  return (
    <ClientStepCanvas>
      <div className="mx-auto w-full max-w-5xl">
        {children}
        <OperarReveal open={errors.length > 0} className="shrink-0 pt-6">
          <div
            className={layoutsOperarFormDarkErrorBannerClass}
            role="alert"
          >
            <CircleAlert
              className="size-5 shrink-0 self-center text-[#fca5a5]"
              aria-hidden
            />
            {errors.length === 1 ? (
              <span className="min-w-0 flex-1">{errors[0]}</span>
            ) : (
              <ul className="min-w-0 flex-1 space-y-1">
                {errors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            )}
          </div>
        </OperarReveal>
      </div>
    </ClientStepCanvas>
  )
}

function OperateTwoColumnGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:items-stretch lg:gap-x-10 lg:gap-y-0">
      {children}
    </div>
  )
}

function OperateTwoColumnDivider() {
  return (
    <div
      className="hidden bg-[var(--layouts-operar-border-dark-hairline)] lg:block"
      aria-hidden
    />
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
    const stepErrors = serviceChargeStep2ErrorMessages(fieldErrors)

    return (
      <OperateTwoColumnStep errors={stepErrors}>
        <OperateTwoColumnGrid>
          <div className={cn(rootsFormColumnClass, "min-w-0")}>
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
          </div>

          <OperateTwoColumnDivider />

          <div className={cn(rootsFormColumnClass, "min-w-0")}>
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
        </OperateTwoColumnGrid>
      </OperateTwoColumnStep>
    )
  }

  if (step === 3) {
    const stepErrors = serviceChargeStep3ErrorMessages(fieldErrors)

    return (
      <OperateTwoColumnStep errors={stepErrors}>
        <OperateTwoColumnGrid>
          <div className={cn(rootsFormColumnClass, "min-w-0")}>
            <ServiceOperatePaymentFields
              paymentMethodKey={form.paymentMethodKey}
              onChange={(paymentMethodKey) => onFormChange({ paymentMethodKey })}
              treasuryContext={treasuryPaymentContext}
              disabled={disabled}
            />
          </div>

          <OperateTwoColumnDivider />

          <div className={cn(rootsFormColumnClass, "min-w-0")}>
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
        </OperateTwoColumnGrid>
      </OperateTwoColumnStep>
    )
  }

  return null
}
