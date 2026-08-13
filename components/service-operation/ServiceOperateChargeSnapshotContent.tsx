"use client"

import type { ServiceTypeChargeOption } from "@/app/[siteId]/[popId]/active-services/actions"
import type { ServiceChargeCreateWizardForm } from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import {
  layoutsOperarTicketProposalCartListClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import { layoutsOperarSummaryCartListSurfaceClass } from "@/app/library/layouts/layoutsOperarStyles"
import {
  ServiceOperateChargeConfigShowcase,
  formatSnapshotDateLabel,
} from "@/components/service-operation/ServiceOperateChargeConfigShowcase"
import { ServiceOperateServiceShowcase } from "@/components/service-operation/ServiceOperateServiceShowcase"
import { ServiceOperateSnapshotCartRow } from "@/components/service-operation/ServiceOperateSnapshotCartRow"
import { serviceOperateSnapshotTicketCardClass } from "@/components/service-operation/serviceOperateSnapshotStyles"
import { serviceChargeHasComprobante } from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import { SERVICE_PAYMENT_TIMING_LABELS } from "@/lib/serviceCatalogTypes"
import { operationPaymentKindLabel } from "@/lib/operationPaymentKinds"
import {
  getServiceChargeCheckoutDestinations,
} from "@/lib/serviceChargeCheckoutPayment"
import {
  computeChargeDueDate,
  billingPeriodRequiresManualPeriodEnd,
  resolveChargePeriodEnd,
  SERVICE_CHARGE_BILLING_SCOPE_LABELS,
} from "@/lib/serviceChargeTypes"
import { parseNonNegativeIntegerInput } from "@/lib/integerInput"
import { parseMoneyInput } from "@/lib/moneyInput"
import {
  parseTreasuryPaymentOptionKey,
  type TreasuryPaymentContext,
} from "@/lib/treasuryPaymentOptions"
import { cn } from "@/lib/utils"
import { useMemo } from "react"

const TICKET_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL

const PLACEHOLDER = "—"

type Props = {
  form: ServiceChargeCreateWizardForm
  popId: string
  selectedService: ServiceTypeChargeOption | null
  treasuryPaymentContext: TreasuryPaymentContext | null
  comprobanteLabel: string
  suggestedComprobante: string | null
}

function formatSummaryDate(iso: string | null | undefined): string {
  return formatSnapshotDateLabel(iso)
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
  form,
  popId,
  selectedService,
  treasuryPaymentContext,
  comprobanteLabel,
  suggestedComprobante,
}: Props) {
  const clientName =
    form.clientDraft.catalogClient?.name.trim() ||
    form.clientDraft.manualName.trim() ||
    ""

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

  const snapshotPrice = parseMoneyInput(form.unitPrice, selectedService?.defaultPrice ?? 0)

  if (!selectedService) {
    return null
  }

  return (
    <div className="flex min-h-0 flex-col">
      <div className="shrink-0 p-3">
        <div className={serviceOperateSnapshotTicketCardClass}>
          <ServiceOperateServiceShowcase
            service={selectedService}
            price={snapshotPrice > 0 ? snapshotPrice : selectedService.defaultPrice}
            clientName={clientName}
            tone="ticket"
            popId={popId}
            showPlanDetails
          />
        </div>
      </div>

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
          periodStartLabel={formatSummaryDate(form.periodStartDate)}
          periodEndLabel={formatSummaryDate(effectivePeriodEnd)}
          periodStartEmpty={!form.periodStartDate.trim()}
          periodEndEmpty={!effectivePeriodEnd}
          paymentTimingLabel={SERVICE_PAYMENT_TIMING_LABELS[form.paymentTiming]}
          dueDateLabel={formatSummaryDate(previewDueDate)}
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
