"use client"

import type { ServiceTypeChargeOption } from "@/app/[siteId]/[popId]/active-services/actions"
import { ServiceChargeCreateSummaryPanel } from "@/app/[siteId]/[popId]/active-services/components/ServiceChargeCreateSummaryPanel"
import type {
  ServiceChargeCreateFieldErrors,
  ServiceChargeCreateWizardForm,
} from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import { ArticleCatalogDiscountField } from "@/app/[siteId]/[popId]/articles/ArticleCatalogDiscountField"
import {
  layoutsOperarSummaryCartHeadingClass,
  layoutsOperarSummaryCartListSurfaceClass,
  layoutsOperarSummaryTotalsPlacementClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  layoutsOperarTicketProposalActionsClass,
  layoutsOperarTicketProposalCartListClass,
  layoutsOperarTicketProposalHeaderClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { SaleOperationActionsBar } from "@/components/sale-operation/SaleOperationActionsBar"
import { SaleOperationTotalBar } from "@/components/sale-operation/SaleOperationTotalBar"
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
import type { ArticleDiscountMode } from "@/lib/articleDiscount"
import { parseMoneyInput } from "@/lib/moneyInput"
import {
  SERVICE_CHARGE_PERIOD_END_AUTO_LABEL_INFO,
  SERVICE_CHARGE_PERIOD_END_LABEL_INFO,
  SERVICE_CHARGE_PERIOD_START_LABEL_INFO,
  SERVICE_DUE_DAYS_LABEL_INFO,
  SERVICE_PAYMENT_TIMINGS,
  SERVICE_PAYMENT_TIMING_LABELS,
  type ServicePaymentTiming,
} from "@/lib/serviceCatalogTypes"
import {
  availableBillingScopesForService,
  billingPeriodRequiresManualPeriodEnd,
  computeChargeAmount,
  resolveChargePeriodEnd,
  SERVICE_CHARGE_BILLING_SCOPE_LABELS,
  type ServiceChargeBillingScope,
} from "@/lib/serviceChargeTypes"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"
import { useMemo } from "react"

const TICKET_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL

type Props = {
  form: ServiceChargeCreateWizardForm
  selectedService: ServiceTypeChargeOption | null
  fieldErrors: ServiceChargeCreateFieldErrors
  disabled?: boolean
  saving?: boolean
  canCreate?: boolean
  confirmTitle?: string
  onChange: (patch: Partial<ServiceChargeCreateWizardForm>) => void
  onDiscard: () => void
  onConfirm: () => void
}

export function ServiceOperateTicketPanel({
  form,
  selectedService,
  fieldErrors,
  disabled = false,
  saving = false,
  canCreate = true,
  confirmTitle,
  onChange,
  onDiscard,
  onConfirm,
}: Props) {
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
  }, [selectedService, form.periodStartDate, form.periodEndDate, manualPeriodEnd])

  const unitPrice = parseMoneyInput(form.unitPrice, 0)
  const discountMode =
    form.discountMode === "porcentaje" || form.discountMode === "fijo"
      ? form.discountMode
      : ("none" as const)
  const discountValue =
    discountMode === "none"
      ? null
      : discountMode === "porcentaje"
        ? Number(form.discountValue.replace(/\D/g, "")) || null
        : parseMoneyInput(form.discountValue, Number.NaN)

  const amount = computeChargeAmount(
    unitPrice,
    discountMode,
    discountValue != null && Number.isFinite(discountValue) ? discountValue : null,
  )

  const hayDescuento = discountMode !== "none" && amount < unitPrice

  return (
    <>
      <div
        className={cn(
          layoutsOperarTicketProposalHeaderClass(TICKET_PROPOSAL),
          "row-start-1 min-h-0 shrink-0",
        )}
      >
        <div className={layoutsOperarSummaryCartHeadingClass}>
          <p className="truncate text-sm font-semibold text-white/90">Tu cargo</p>
          <p className="truncate text-xs text-white/45">
            {selectedService
              ? `${selectedService.name} · ${selectedService.billingPeriodDisplay}`
              : "Elegí un servicio"}
          </p>
        </div>
      </div>

      <div
        className={cn(
          layoutsOperarSummaryCartListSurfaceClass,
          layoutsOperarTicketProposalCartListClass(TICKET_PROPOSAL),
          "row-start-2 min-h-0 overflow-y-auto overscroll-contain",
        )}
      >
        {!selectedService ? (
          <DataWorkspaceDetailEmptyState
            icon={Sparkles}
            title="Armá un cargo en segundos"
            description="Elegí un servicio del catálogo, configurá cliente y facturación en la barra inferior, y confirmá acá."
            className="border-0 bg-transparent py-10 text-white/70 [&_h3]:text-white/85 [&_p]:text-white/45"
          />
        ) : (
          <div className={cn(rootsFormColumnClass, "gap-4 p-3")}>
            <RootsFormSelectField
              label="Alcance"
              id="operate-charge-scope"
              value={form.billingScope}
              onValueChange={(value) =>
                onChange({ billingScope: value as ServiceChargeBillingScope })
              }
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
                id="operate-charge-period-count"
                value={form.periodCount}
                onChange={(value) => onChange({ periodCount: value })}
                disabled={disabled}
                error={fieldErrors.periodCount}
                invalid={Boolean(fieldErrors.periodCount)}
              />
            ) : null}

            <div className={rootsFormTwoColRowClass}>
              <RootsFormDateField
                label="Inicio"
                id="operate-charge-period-start"
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
                label="Fin"
                id="operate-charge-period-end"
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
              id="operate-charge-unit-price"
              value={form.unitPrice}
              onChange={(value) => onChange({ unitPrice: value })}
              disabled={disabled}
              error={fieldErrors.unitPrice}
              invalid={Boolean(fieldErrors.unitPrice)}
            />

            <ArticleCatalogDiscountField
              idPrefix="operate-charge-discount"
              discountMode={form.discountMode}
              discountValue={form.discountValue}
              onChange={(patch) => {
                const next: Partial<ServiceChargeCreateWizardForm> = {}
                if (patch.discountMode !== undefined) {
                  next.discountMode = patch.discountMode as "" | ArticleDiscountMode
                }
                if (patch.discountValue !== undefined) {
                  next.discountValue = patch.discountValue
                }
                onChange(next)
              }}
              salePrice={unitPrice}
              disabled={disabled}
            />

            <div className={rootsFormTwoColRowClass}>
              <RootsFormSelectField
                label="¿Cuándo se paga?"
                id="operate-charge-payment-timing"
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
                id="operate-charge-due-days"
                value={form.dueDaysAfter}
                onChange={(value) => onChange({ dueDaysAfter: value })}
                disabled={disabled}
                max={365}
                labelInfo={SERVICE_DUE_DAYS_LABEL_INFO}
                error={fieldErrors.dueDaysAfter}
                invalid={Boolean(fieldErrors.dueDaysAfter)}
              />
            </div>

            <RootsFormTextareaField
              label="Notas"
              id="operate-charge-notes"
              value={form.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              disabled={disabled}
              rows={2}
              placeholder="Opcional — observaciones internas"
            />

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <ServiceChargeCreateSummaryPanel
                form={form}
                selectedService={selectedService}
              />
            </div>
          </div>
        )}
      </div>

      <div className={layoutsOperarSummaryTotalsPlacementClass}>
        <SaleOperationTotalBar
          tone="operar"
          total={amount}
          subtotal={unitPrice}
          descuentoMonto={Math.max(0, unitPrice - amount)}
          hayDescuento={hayDescuento}
          totalLabel="Monto del cargo"
        />
      </div>

      <div className={layoutsOperarTicketProposalActionsClass(TICKET_PROPOSAL)}>
        <SaleOperationActionsBar
          variant="operar"
          discardDisabled={disabled || saving}
          confirmDisabled={!canCreate || !selectedService || disabled || saving}
          confirmLoading={saving}
          confirmLabel="Crear cargo"
          confirmTitle={confirmTitle}
          onDiscard={onDiscard}
          onConfirm={onConfirm}
        />
      </div>
    </>
  )
}
