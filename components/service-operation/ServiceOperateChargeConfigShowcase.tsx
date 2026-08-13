"use client"

import type { ServiceTypeChargeAddonOption } from "@/app/[siteId]/[popId]/active-services/actions"
import type { ServiceChargeCreateWizardForm } from "@/app/[siteId]/[popId]/active-services/serviceChargeCreateFormState"
import {
  selectedAddonsForDisplay,
} from "@/lib/serviceChargeAddonSelection"
import {
  layoutsOperarTicketProposalLineAmountClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import { ServiceOperateSnapshotCartRow } from "@/components/service-operation/ServiceOperateSnapshotCartRow"
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

const TICKET_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL

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
  notes: string
  addons?: ServiceTypeChargeAddonOption[]
  selectedAddonIds?: string[]
  oneTimeAddonIds?: string[]
}

function periodRangeValue(
  hasPeriod: boolean,
  periodStartLabel: string,
  periodEndLabel: string,
) {
  if (!hasPeriod) {
    return (
      <span
        className={cn(
          layoutsOperarTicketProposalLineAmountClass(TICKET_PROPOSAL),
          "self-center pt-0 font-normal text-[var(--layouts-operar-light-cart-line-meta)]",
        )}
      >
        {PLACEHOLDER}
      </span>
    )
  }

  return (
    <span
      className={cn(
        layoutsOperarTicketProposalLineAmountClass(TICKET_PROPOSAL),
        "flex min-w-0 items-center justify-end gap-1 self-center pt-0",
      )}
    >
      <span className="truncate">{periodStartLabel}</span>
      <ArrowRight
        className="size-3 shrink-0 text-[var(--rootsy-savia-600)]"
        aria-hidden
      />
      <span className="truncate">{periodEndLabel}</span>
    </span>
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
  notes,
  addons = [],
  selectedAddonIds = [],
  oneTimeAddonIds = [],
}: Props) {
  const notesTrimmed = notes.trim()
  const hasPeriod =
    !periodStartEmpty && !periodEndEmpty && periodEndLabel !== PLACEHOLDER
  const selectedAddons = selectedAddonsForDisplay(addons, selectedAddonIds)
  const oneTimeSet = new Set(oneTimeAddonIds)

  return (
    <>
      <ServiceOperateSnapshotCartRow label="Alcance" value={scopeLabel} />

      {form.billingScope === "multi_period" ? (
        <ServiceOperateSnapshotCartRow
          label="Cantidad de cargos"
          value={String(chargeCount)}
        />
      ) : null}

      <ServiceOperateSnapshotCartRow
        label="Cuándo se paga"
        value={paymentTimingLabel}
      />

      <ServiceOperateSnapshotCartRow
        label="Período"
        valueContent={periodRangeValue(hasPeriod, periodStartLabel, periodEndLabel)}
      />

      <ServiceOperateSnapshotCartRow
        label="Vencimiento"
        value={dueDateEmpty ? PLACEHOLDER : dueDateLabel}
        empty={dueDateEmpty}
      />

      {selectedAddons.map((addon) => {
        const suffix =
          form.billingScope === "subscription" && oneTimeSet.has(addon.id)
            ? " · única vez"
            : ""
        return (
          <ServiceOperateSnapshotCartRow
            key={addon.id}
            label="Adicional"
            value={`${addon.name}${suffix}`}
          />
        )
      })}

      {notesTrimmed ? (
        <ServiceOperateSnapshotCartRow label="Notas" value={notesTrimmed} />
      ) : null}
    </>
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
