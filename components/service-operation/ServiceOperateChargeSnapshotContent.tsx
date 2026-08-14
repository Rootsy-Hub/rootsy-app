"use client"

import type { ServiceTypeChargeOption } from "@/app/[siteId]/[popId]/active-services/actions"
import type {
  ServiceChargeCreateFieldErrors,
  ServiceChargeCreateWizardForm,
} from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import {
  layoutsOperarTicketProposalCartListClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import { layoutsOperarSummaryCartListSurfaceClass } from "@/app/library/layouts/layoutsOperarStyles"
import {
  formatSnapshotDateLabel,
  ServiceOperateChargeConfigShowcase,
} from "@/components/service-operation/ServiceOperateChargeConfigShowcase"
import { ServiceOperateChargeConfigFormPanel } from "@/components/service-operation/ServiceOperateChargeConfigFormPanel"
import { ServiceOperateSnapshotCartRow } from "@/components/service-operation/ServiceOperateSnapshotCartRow"
import type { ServiceOperateSnapshotPanelView } from "@/components/service-operation/ServiceOperateSnapshotPanelTabs"
import { serviceChargeHasComprobante } from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import { operationPaymentKindLabel } from "@/lib/operationPaymentKinds"
import {
  getServiceChargeCheckoutDestinations,
} from "@/lib/serviceChargeCheckoutPayment"
import { SERVICE_PAYMENT_TIMING_LABELS } from "@/lib/serviceCatalogTypes"
import {
  computeChargeDueDate,
  billingPeriodRequiresManualPeriodEnd,
  resolveChargePeriodEnd,
  SERVICE_CHARGE_BILLING_SCOPE_LABELS,
} from "@/lib/serviceChargeTypes"
import { parseNonNegativeIntegerInput } from "@/lib/integerInput"
import {
  parseTreasuryPaymentOptionKey,
  type TreasuryPaymentContext,
} from "@/lib/treasuryPaymentOptions"
import { cn } from "@/lib/utils"
import { useMemo } from "react"

const TICKET_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL

const PLACEHOLDER = "—"

type Props = {
  view: ServiceOperateSnapshotPanelView
  form: ServiceChargeCreateWizardForm
  fieldErrors: ServiceChargeCreateFieldErrors
  popId: string
  selectedService: ServiceTypeChargeOption | null
  treasuryPaymentContext: TreasuryPaymentContext | null
  comprobanteLabel: string
  suggestedComprobante: string | null
  disabled?: boolean
  onFormChange: (patch: Partial<ServiceChargeCreateWizardForm>) => void
}

function yesNo(value: boolean): string {
  return value ? "Sí" : "No"
}

function resolvePaymentSnapshot(
  paymentMethodKey: string,
  treasuryPaymentContext: TreasuryPaymentContext | null,
): { kind: string; destination: string | null } | null {
  if (!paymentMethodKey.trim()) return null

  const parsed = parseTreasuryPaymentOptionKey(paymentMethodKey)
  if (!parsed) {
    return { kind: "Medio elegido", destination: null }
  }

  const kind = operationPaymentKindLabel(parsed.kind)
  if (!treasuryPaymentContext) {
    return { kind, destination: null }
  }

  const destinations = getServiceChargeCheckoutDestinations(
    parsed.kind,
    treasuryPaymentContext,
  )
  const match = destinations.find((item) => item.id === parsed.treasuryAccountId)
  return { kind, destination: match?.name ?? null }
}

export function ServiceOperateChargeSnapshotContent({
  view,
  form,
  fieldErrors,
  selectedService,
  treasuryPaymentContext,
  comprobanteLabel,
  suggestedComprobante,
  disabled = false,
  onFormChange,
}: Props) {
  const chargeCount =
    form.billingScope === "one_period" || form.billingScope === "subscription"
      ? 1
      : Math.max(1, Number(form.periodCount.replace(/\D/g, "")) || 1)

  const dueDaysAfterParsed = parseNonNegativeIntegerInput(form.dueDaysAfter, 0)

  const manualPeriodEnd = selectedService
    ? billingPeriodRequiresManualPeriodEnd(selectedService.billingPeriod)
    : false

  const effectivePeriodEnd = useMemo(() => {
    if (!selectedService || !/^\d{4}-\d{2}-\d{2}$/.test(form.periodStartDate)) {
      return null
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

  const previewDueDate = useMemo(() => {
    if (!selectedService || !effectivePeriodEnd) return null
    return computeChargeDueDate(
      form.periodStartDate.trim(),
      effectivePeriodEnd,
      form.paymentTiming,
      dueDaysAfterParsed,
    )
  }, [
    selectedService,
    form.periodStartDate,
    effectivePeriodEnd,
    form.paymentTiming,
    dueDaysAfterParsed,
  ])

  const paymentSnapshot = resolvePaymentSnapshot(
    form.paymentMethodKey,
    treasuryPaymentContext,
  )

  const hasComprobante = serviceChargeHasComprobante(
    form.comprobanteLabel,
    suggestedComprobante,
  )

  if (!selectedService) {
    return null
  }

  if (view === "config") {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        data-snapshot-tab="config"
      >
        <ServiceOperateChargeConfigFormPanel
          form={form}
          selectedService={selectedService}
          fieldErrors={fieldErrors}
          disabled={disabled}
          onChange={onFormChange}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-col" data-snapshot-tab="cargo">
      <div
        className={cn(
          layoutsOperarSummaryCartListSurfaceClass,
          layoutsOperarTicketProposalCartListClass(TICKET_PROPOSAL),
          "min-h-0 flex-1",
        )}
      >
        <ServiceOperateChargeConfigShowcase
          form={form}
          scopeLabel={SERVICE_CHARGE_BILLING_SCOPE_LABELS[form.billingScope]}
          chargeCount={chargeCount}
          periodStartLabel={formatSnapshotDateLabel(form.periodStartDate)}
          periodEndLabel={formatSnapshotDateLabel(effectivePeriodEnd)}
          periodStartEmpty={!form.periodStartDate.trim()}
          periodEndEmpty={!effectivePeriodEnd}
          paymentTimingLabel={SERVICE_PAYMENT_TIMING_LABELS[form.paymentTiming]}
          dueDateLabel={formatSnapshotDateLabel(previewDueDate)}
          dueDateEmpty={!previewDueDate}
          notes={form.notes ?? ""}
          addons={selectedService.addons}
          selectedAddonIds={form.selectedAddonIds}
          oneTimeAddonIds={form.oneTimeAddonIds}
        />

        {paymentSnapshot ? (
          <>
            <ServiceOperateSnapshotCartRow
              label="Medio de pago"
              value={paymentSnapshot.kind}
            />
            {paymentSnapshot.destination ? (
              <ServiceOperateSnapshotCartRow
                label="Cuenta destino"
                value={paymentSnapshot.destination}
              />
            ) : null}
          </>
        ) : (
          <ServiceOperateSnapshotCartRow
            label="Medio de pago"
            value={PLACEHOLDER}
            empty
          />
        )}

        <ServiceOperateSnapshotCartRow
          label="Comprobante"
          value={comprobanteLabel}
        />
        {hasComprobante ? (
          <>
            <ServiceOperateSnapshotCartRow
              label="Se emite ahora"
              value={yesNo(form.issueInvoiceOnCreate)}
            />
            {form.issueInvoiceOnCreate ? (
              <>
                <ServiceOperateSnapshotCartRow
                  label="Imprimir"
                  value={yesNo(form.printInvoiceOnCreate)}
                />
                <ServiceOperateSnapshotCartRow
                  label="Enviar por email"
                  value={yesNo(form.emailInvoiceToClient)}
                />
              </>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  )
}

export { formatSnapshotDateLabel }
