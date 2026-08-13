"use client"

import type { ServiceTypeChargeOption } from "@/app/[siteId]/[popId]/active-services/actions"
import type { ServiceChargeCreateWizardForm } from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import { ServiceOperateServiceShowcase } from "@/components/service-operation/ServiceOperateServiceShowcase"
import type { ServiceDiscountMode } from "@/lib/serviceCatalogTypes"
import { SERVICE_PAYMENT_TIMING_LABELS } from "@/lib/serviceCatalogTypes"
import { operationPaymentKindLabel } from "@/lib/operationPaymentKinds"
import {
  getServiceChargeCheckoutDestinations,
} from "@/lib/serviceChargeCheckoutPayment"
import {
  computeChargeAmount,
  computeChargeDueDate,
  billingPeriodRequiresManualPeriodEnd,
  resolveChargePeriodEnd,
  SERVICE_CHARGE_BILLING_SCOPE_LABELS,
} from "@/lib/serviceChargeTypes"
import { parseNonNegativeIntegerInput } from "@/lib/integerInput"
import { parseMoneyInput } from "@/lib/moneyInput"
import {
  formatRootsFormDisplayDateCompact,
  parseRootsFormIsoDate,
} from "@/lib/rootsFormDateFormat"
import {
  parseTreasuryPaymentOptionKey,
  type TreasuryPaymentContext,
} from "@/lib/treasuryPaymentOptions"
import { cn } from "@/lib/utils"
import { useMemo } from "react"

const PLACEHOLDER = "—"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

const sectionTitleClass =
  "text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]"

const rowLabelClass =
  "shrink-0 text-[11px] leading-snug text-[var(--rootsy-bruma-500)]"

const rowValueClass =
  "min-w-0 text-right text-xs leading-snug text-[var(--rootsy-bruma-700)]"

const rowValueEmptyClass = "text-[var(--rootsy-bruma-400)]"

const separatorClass = "border-t border-[var(--rootsy-bruma-200)]"

type Props = {
  form: ServiceChargeCreateWizardForm
  selectedService: ServiceTypeChargeOption | null
  treasuryPaymentContext: TreasuryPaymentContext | null
  comprobanteLabel: string
}

function SnapshotSeparator() {
  return <div className={separatorClass} role="separator" aria-hidden />
}

function SnapshotSection({
  title,
  children,
  className,
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("flex flex-col gap-2", className)}>
      {title ? <h3 className={sectionTitleClass}>{title}</h3> : null}
      {children}
    </section>
  )
}

function SnapshotRow({
  label,
  value,
  empty = false,
}: {
  label: string
  value: string
  empty?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5">
      <span className={rowLabelClass}>{label}</span>
      <span
        className={cn(
          rowValueClass,
          (empty || value === PLACEHOLDER) && rowValueEmptyClass,
        )}
        title={value === PLACEHOLDER ? undefined : value}
      >
        {value}
      </span>
    </div>
  )
}

function formatSummaryDate(iso: string | null | undefined): string {
  if (!iso?.trim()) return PLACEHOLDER
  const parsed = parseRootsFormIsoDate(iso.trim())
  return parsed ? formatRootsFormDisplayDateCompact(parsed) : iso.trim()
}

function rowValue(value: string | null | undefined): { value: string; empty: boolean } {
  const trimmed = value?.trim() ?? ""
  return trimmed
    ? { value: trimmed, empty: false }
    : { value: PLACEHOLDER, empty: true }
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
  selectedService,
  treasuryPaymentContext,
  comprobanteLabel,
}: Props) {
  const clientName =
    form.clientDraft.catalogClient?.name.trim() ||
    form.clientDraft.manualName.trim() ||
    ""

  const chargeCount =
    form.billingScope === "one_period" || form.billingScope === "subscription"
      ? 1
      : Math.max(1, Number(form.periodCount.replace(/\D/g, "")) || 1)

  const discountMode: ServiceDiscountMode =
    form.discountMode === "porcentaje" || form.discountMode === "fijo"
      ? form.discountMode
      : "none"

  const discountValue =
    discountMode === "none"
      ? null
      : discountMode === "porcentaje"
        ? Number(form.discountValue.replace(/\D/g, "")) || null
        : parseMoneyInput(form.discountValue, Number.NaN)

  const dueDaysAfterParsed = parseNonNegativeIntegerInput(form.dueDaysAfter, 0)
  const unitPrice = parseMoneyInput(form.unitPrice, 0)

  const amount = useMemo(
    () =>
      computeChargeAmount(
        unitPrice,
        discountMode,
        discountValue != null && Number.isFinite(discountValue)
          ? discountValue
          : null,
      ),
    [unitPrice, discountMode, discountValue],
  )

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

  const discountLabel =
    discountMode === "porcentaje"
      ? `${form.discountValue.trim() || "0"} %`
      : discountMode === "fijo"
        ? fmt.format(parseMoneyInput(form.discountValue, 0))
        : PLACEHOLDER

  const paymentSnapshot = resolvePaymentSnapshot(
    form.paymentMethodKey,
    treasuryPaymentContext,
  )

  const snapshotPrice = parseMoneyInput(form.unitPrice, selectedService?.defaultPrice ?? 0)

  return (
    <div className="flex flex-col gap-4">
      <SnapshotSection>
        {selectedService ? (
          <div className="overflow-hidden rounded-xl border border-[var(--rootsy-bruma-200)] bg-[linear-gradient(165deg,color-mix(in_srgb,var(--rootsy-savia-400)_5%,white),white)] p-2.5 shadow-[0_8px_28px_-24px_color-mix(in_srgb,var(--rootsy-savia-600)_40%,transparent)]">
            <ServiceOperateServiceShowcase
              service={selectedService}
              price={snapshotPrice > 0 ? snapshotPrice : selectedService.defaultPrice}
              clientName={clientName}
              tone="ticket"
            />
          </div>
        ) : (
          <p className="text-sm text-[var(--rootsy-bruma-400)]">Sin servicio</p>
        )}
      </SnapshotSection>

      <SnapshotSeparator />

      <SnapshotSection title="Configuración del cargo">
        <div className="flex flex-col gap-0.5">
          <SnapshotRow
            label="Alcance"
            value={SERVICE_CHARGE_BILLING_SCOPE_LABELS[form.billingScope]}
          />
          {form.billingScope === "multi_period" ? (
            <SnapshotRow label="Períodos" value={String(chargeCount)} />
          ) : null}
          <SnapshotRow
            label="Desde"
            value={formatSummaryDate(form.periodStartDate)}
            empty={!form.periodStartDate.trim()}
          />
          <SnapshotRow
            label="Hasta"
            value={formatSummaryDate(effectivePeriodEnd)}
            empty={!effectivePeriodEnd}
          />
          <SnapshotRow
            label="Cuándo se paga"
            value={SERVICE_PAYMENT_TIMING_LABELS[form.paymentTiming]}
          />
          <SnapshotRow
            label="Vencimiento"
            value={formatSummaryDate(previewDueDate)}
            empty={!previewDueDate}
          />
          <SnapshotRow
            label="Precio unitario"
            value={unitPrice > 0 ? fmt.format(unitPrice) : PLACEHOLDER}
            empty={unitPrice <= 0}
          />
          <SnapshotRow
            label="Descuento"
            value={discountLabel}
            empty={discountMode === "none"}
          />
          <SnapshotRow
            label={chargeCount > 1 ? "Monto c/u" : "Monto"}
            value={amount > 0 ? fmt.format(amount) : PLACEHOLDER}
            empty={amount <= 0}
          />
          {chargeCount > 1 ? (
            <SnapshotRow label="Cantidad de cargos" value={String(chargeCount)} />
          ) : null}
          <SnapshotRow label="Notas" {...rowValue(form.notes)} />
        </div>
      </SnapshotSection>

      <SnapshotSeparator />

      <SnapshotSection title="Medio de pago">
        {paymentSnapshot ? (
          <div className="flex flex-col gap-0.5">
            <SnapshotRow label="Forma" value={paymentSnapshot.kind} />
            {paymentSnapshot.destination ? (
              <SnapshotRow label="Cuenta" value={paymentSnapshot.destination} />
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-[var(--rootsy-bruma-400)]">Sin definir</p>
        )}
      </SnapshotSection>

      <SnapshotSeparator />

      <SnapshotSection title="Facturación">
        <div className="flex flex-col gap-0.5">
          <SnapshotRow label="Comprobante" value={comprobanteLabel} />
          <SnapshotRow
            label="Se emite ahora"
            value={yesNo(form.issueInvoiceOnCreate)}
          />
          {form.issueInvoiceOnCreate ? (
            <>
              <SnapshotRow
                label="Imprimir"
                value={yesNo(form.printInvoiceOnCreate)}
              />
              <SnapshotRow
                label="Enviar por email"
                value={yesNo(form.emailInvoiceToClient)}
              />
            </>
          ) : null}
        </div>
      </SnapshotSection>
    </div>
  )
}
