"use client"

import type { ServiceChargeCreateWizardForm } from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import {
  serviceOperateSnapshotCardDividerClass,
  serviceOperateSnapshotMicroLabelClass,
  serviceOperateSnapshotPillClass,
  serviceOperateSnapshotRowLabelClass,
  serviceOperateSnapshotRowValueClass,
  serviceOperateSnapshotRowValueMutedClass,
  serviceOperateSnapshotTicketCardClass,
} from "@/components/service-operation/serviceOperateSnapshotStyles"
import type { ServiceDiscountMode } from "@/lib/serviceCatalogTypes"
import { parseMoneyInput } from "@/lib/moneyInput"
import {
  formatRootsFormDisplayDateCompact,
  parseRootsFormIsoDate,
} from "@/lib/rootsFormDateFormat"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

const PLACEHOLDER = "—"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

type Props = {
  form: ServiceChargeCreateWizardForm
  scopeLabel: string
  chargeCount: number
  periodStartLabel: string
  periodEndLabel: string
  periodStartEmpty: boolean
  periodEndEmpty: boolean
  paymentTimingLabel: string
  dueDateLabel: string
  dueDateEmpty: boolean
  unitPriceLabel: string
  unitPriceEmpty: boolean
  discountLabel: string
  discountEmpty: boolean
  amountLabel: string
  amountEmpty: boolean
  notes: string
}

function ConfigRow({
  label,
  value,
  empty = false,
  emphasis = false,
}: {
  label: string
  value: string
  empty?: boolean
  emphasis?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className={serviceOperateSnapshotRowLabelClass}>{label}</span>
      <span
        className={cn(
          serviceOperateSnapshotRowValueClass,
          empty && serviceOperateSnapshotRowValueMutedClass,
          emphasis &&
            "font-canopy text-sm font-bold tabular-nums tracking-tight text-[var(--rootsy-savia-700)]",
        )}
      >
        {value}
      </span>
    </div>
  )
}

export function ServiceOperateChargeConfigShowcase({
  form,
  scopeLabel,
  chargeCount,
  periodStartLabel,
  periodEndLabel,
  periodStartEmpty,
  periodEndEmpty,
  paymentTimingLabel,
  dueDateLabel,
  dueDateEmpty,
  unitPriceLabel,
  unitPriceEmpty,
  discountLabel,
  discountEmpty,
  amountLabel,
  amountEmpty,
  notes,
}: Props) {
  const notesTrimmed = notes.trim()
  const hasPeriod =
    !periodStartEmpty && !periodEndEmpty && periodEndLabel !== PLACEHOLDER

  return (
    <div className={serviceOperateSnapshotTicketCardClass}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={serviceOperateSnapshotPillClass}>
          <span className="truncate">{scopeLabel}</span>
        </span>
        {form.billingScope === "multi_period" ? (
          <span
            className={cn(
              serviceOperateSnapshotPillClass,
              "border-[color-mix(in_srgb,var(--rootsy-bruma-300)_80%,transparent)] bg-[color-mix(in_srgb,var(--rootsy-bruma-100)_80%,white)] text-[var(--rootsy-bruma-600)]",
            )}
          >
            {chargeCount} cargos
          </span>
        ) : null}
        <span
          className={cn(
            serviceOperateSnapshotPillClass,
            "border-[color-mix(in_srgb,var(--rootsy-bruma-300)_80%,transparent)] bg-[color-mix(in_srgb,var(--rootsy-bruma-100)_80%,white)] text-[var(--rootsy-bruma-600)]",
          )}
        >
          {paymentTimingLabel}
        </span>
      </div>

      <div className="mt-2.5 space-y-1">
        {hasPeriod ? (
          <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-[var(--rootsy-bruma-800)]">
            <span className="truncate">{periodStartLabel}</span>
            <ArrowRight
              className="size-3 shrink-0 text-[var(--rootsy-savia-600)]"
              aria-hidden
            />
            <span className="truncate">{periodEndLabel}</span>
          </div>
        ) : (
          <p className="text-xs text-[var(--rootsy-bruma-400)]">Período sin definir</p>
        )}

        <p
          className={cn(
            "text-[11px] leading-snug",
            dueDateEmpty
              ? "text-[var(--rootsy-bruma-400)]"
              : "text-[var(--rootsy-bruma-600)]",
          )}
        >
          {dueDateEmpty ? "Vencimiento pendiente" : `Vence ${dueDateLabel}`}
        </p>
      </div>

      <div
        className={cn(serviceOperateSnapshotCardDividerClass, "my-2.5")}
        role="separator"
        aria-hidden
      />

      <div className="space-y-1">
        <p className={cn(serviceOperateSnapshotMicroLabelClass, "mb-1")}>
          Importes
        </p>
        <ConfigRow
          label="Precio unitario"
          value={unitPriceLabel}
          empty={unitPriceEmpty}
        />
        <ConfigRow
          label="Descuento"
          value={discountLabel}
          empty={discountEmpty}
        />
      </div>

      <div
        className={cn(serviceOperateSnapshotCardDividerClass, "my-2.5")}
        role="separator"
        aria-hidden
      />

      <ConfigRow
        label={chargeCount > 1 ? "Monto c/u" : "Total del cargo"}
        value={amountLabel}
        empty={amountEmpty}
        emphasis
      />

      {notesTrimmed ? (
        <>
          <div
            className={cn(serviceOperateSnapshotCardDividerClass, "my-2.5")}
            role="separator"
            aria-hidden
          />
          <div className="space-y-0.5">
            <p className={serviceOperateSnapshotMicroLabelClass}>Notas</p>
            <p className="line-clamp-3 text-[11px] leading-relaxed text-[var(--rootsy-bruma-600)]">
              {notesTrimmed}
            </p>
          </div>
        </>
      ) : null}
    </div>
  )
}

export function formatSnapshotDateLabel(iso: string | null | undefined): string {
  if (!iso?.trim()) return PLACEHOLDER
  const parsed = parseRootsFormIsoDate(iso.trim())
  return parsed ? formatRootsFormDisplayDateCompact(parsed) : iso.trim()
}

export function formatSnapshotDiscountLabel(
  discountMode: ServiceDiscountMode,
  discountValueRaw: string,
): { label: string; empty: boolean } {
  if (discountMode === "porcentaje") {
    return {
      label: `${discountValueRaw.trim() || "0"} %`,
      empty: false,
    }
  }
  if (discountMode === "fijo") {
    return {
      label: fmt.format(parseMoneyInput(discountValueRaw, 0)),
      empty: false,
    }
  }
  return { label: PLACEHOLDER, empty: true }
}

export { fmt as snapshotMoneyFmt, PLACEHOLDER as snapshotPlaceholder }
