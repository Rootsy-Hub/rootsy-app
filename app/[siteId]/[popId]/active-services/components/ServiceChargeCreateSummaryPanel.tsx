"use client"

import type { ServiceTypeChargeOption } from "@/app/[siteId]/[popId]/active-services/actions"
import type { ServiceChargeCreateWizardForm } from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import type { ServiceDiscountMode } from "@/lib/serviceCatalogTypes"
import {
  SERVICE_PAYMENT_TIMING_LABELS,
} from "@/lib/serviceCatalogTypes"
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
import { cn } from "@/lib/utils"
import { useMemo } from "react"

const PLACEHOLDER = "—"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

const summaryRowLabelClass =
  "shrink-0 text-[11px] leading-snug text-[var(--rootsy-bruma-500)]"

const summaryRowValueClass =
  "min-w-0 truncate text-right text-xs leading-snug text-[var(--rootsy-bruma-700)]"

const summaryRowEmptyClass = "text-[var(--rootsy-bruma-400)]"

const summaryCoreMetaClass =
  "text-[11px] font-medium uppercase tracking-wide text-[var(--rootsy-bruma-500)]"

const summaryCoreNameClass =
  "text-sm font-medium leading-snug text-[var(--rootsy-bruma-800)]"

const summaryCoreNameEmptyClass =
  "text-sm font-medium leading-snug text-[var(--rootsy-bruma-400)]"

const summaryCoreDescriptionClass =
  "text-xs leading-relaxed text-[var(--rootsy-bruma-600)]"

const summaryCoreDescriptionEmptyClass =
  "text-xs leading-relaxed text-[var(--rootsy-bruma-400)]"

type Props = {
  form: ServiceChargeCreateWizardForm
  selectedService: ServiceTypeChargeOption | null
  tone?: "default" | "operar"
}

function SummaryRow({
  label,
  value,
  empty = false,
  operar = false,
}: {
  label: string
  value: string
  empty?: boolean
  operar?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span
        className={cn(summaryRowLabelClass, operar && "text-white/45")}
      >
        {label}
      </span>
      <span
        className={cn(
          summaryRowValueClass,
          (empty || value === PLACEHOLDER) && summaryRowEmptyClass,
          operar && "text-white/80",
          operar && (empty || value === PLACEHOLDER) && "text-white/35",
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

function filledText(value: string | null | undefined): boolean {
  return Boolean(value?.trim())
}

export function ServiceChargeCreateSummaryPanel({
  form,
  selectedService,
  tone = "default",
}: Props) {
  const operar = tone === "operar"
  const clientName =
    form.clientDraft.catalogClient?.name.trim() ||
    form.clientDraft.manualName.trim() ||
    ""

  const serviceLabel = selectedService
    ? `${selectedService.name} · ${selectedService.billingPeriodDisplay}`
    : ""

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

  const hasClient = filledText(clientName)
  const hasService = filledText(serviceLabel)
  const displayClient = clientName.trim() || "Sin cliente"
  const displayService = serviceLabel.trim() || "Sin servicio"

  const discountLabel =
    discountMode === "porcentaje"
      ? `${form.discountValue.trim() || "0"} %`
      : discountMode === "fijo"
        ? fmt.format(parseMoneyInput(form.discountValue, 0))
        : PLACEHOLDER

  return (
    <aside
      aria-hidden={operar ? undefined : true}
      className={cn(
        "flex min-h-0 flex-col gap-3",
        operar ? "select-text" : "pointer-events-none select-none",
      )}
    >
      <div className="flex flex-col gap-2.5">
        <p
          className={cn(
            summaryCoreMetaClass,
            operar && "text-white/45",
          )}
        >
          Nuevo cargo
          {selectedService
            ? ` · ${selectedService.billingPeriodDisplay}`
            : " · Sin servicio"}
        </p>

        <div className="min-w-0 flex-1 pt-0.5">
          <p
            className={cn(
              "truncate",
              hasClient ? summaryCoreNameClass : summaryCoreNameEmptyClass,
              operar && hasClient && "text-white/90",
              operar && !hasClient && "text-white/35",
            )}
            title={hasClient ? displayClient : undefined}
          >
            {displayClient}
          </p>
          <p
            className={cn(
              "mt-0.5 line-clamp-3",
              hasService
                ? summaryCoreDescriptionClass
                : summaryCoreDescriptionEmptyClass,
              operar && hasService && "text-white/55",
              operar && !hasService && "text-white/35",
            )}
            title={hasService ? displayService : undefined}
          >
            {hasService ? displayService : PLACEHOLDER}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-col gap-1 border-t pt-3",
          operar ? "border-white/10" : "border-[var(--rootsy-bruma-200)]",
        )}
      >
        <SummaryRow
          label="Alcance"
          value={SERVICE_CHARGE_BILLING_SCOPE_LABELS[form.billingScope]}
          operar={operar}
        />
        {form.billingScope === "multi_period" ? (
          <SummaryRow label="Períodos" value={String(chargeCount)} operar={operar} />
        ) : null}
        <SummaryRow
          label="Inicio"
          value={formatSummaryDate(form.periodStartDate)}
          empty={!form.periodStartDate.trim()}
          operar={operar}
        />
        <SummaryRow
          label="Fin"
          value={formatSummaryDate(effectivePeriodEnd)}
          empty={!effectivePeriodEnd}
          operar={operar}
        />
        <SummaryRow
          label="Pago"
          value={SERVICE_PAYMENT_TIMING_LABELS[form.paymentTiming]}
          operar={operar}
        />
        <SummaryRow
          label="Vencimiento"
          value={formatSummaryDate(previewDueDate)}
          empty={!previewDueDate}
          operar={operar}
        />
        <SummaryRow
          label="Precio unit."
          value={unitPrice > 0 ? fmt.format(unitPrice) : PLACEHOLDER}
          empty={unitPrice <= 0}
          operar={operar}
        />
        <SummaryRow
          label="Descuento"
          value={discountLabel}
          empty={discountMode === "none"}
          operar={operar}
        />
        <SummaryRow
          label={chargeCount > 1 ? "Monto c/u" : "Monto"}
          value={amount > 0 ? fmt.format(amount) : PLACEHOLDER}
          empty={amount <= 0}
          operar={operar}
        />
        {chargeCount > 1 ? (
          <SummaryRow label="Cargos" value={String(chargeCount)} operar={operar} />
        ) : null}
        <SummaryRow label="Notas" {...rowValue(form.notes)} operar={operar} />
      </div>
    </aside>
  )
}
