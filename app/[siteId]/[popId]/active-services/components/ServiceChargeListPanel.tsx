"use client"

import type { ServiceChargeListRow } from "@/app/[siteId]/[popId]/active-services/actions"
import { RootsPrimaryButton, RootsSubtleButton } from "@/components/rootsy-button"
import {
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceShellCard,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { SERVICE_CHARGE_STATUS_LABELS } from "@/lib/serviceChargeTypes"
import { cn } from "@/lib/utils"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

const STATUS_CLASS: Record<string, string> = {
  pending:
    "bg-[color-mix(in_srgb,var(--rootsy-savia-500)_12%,white)] text-[var(--rootsy-savia-800)]",
  partial:
    "bg-[color-mix(in_srgb,var(--rootsy-amber-500)_14%,white)] text-[var(--rootsy-amber-900)]",
  paid: "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_14%,white)] text-[var(--rootsy-savia-900)]",
  overdue:
    "bg-[color-mix(in_srgb,var(--rootsy-coral-500)_12%,white)] text-[var(--rootsy-coral-800)]",
  cancelled: "bg-[var(--rootsy-bruma-100)] text-[var(--rootsy-bruma-600)]",
}

type Props = {
  charges: ServiceChargeListRow[]
  canUpdate: boolean
  onRecordPayment: (charge: ServiceChargeListRow) => void
  onCancelCharge: (charge: ServiceChargeListRow) => void
}

export function ServiceChargeListPanel({
  charges,
  canUpdate,
  onRecordPayment,
  onCancelCharge,
}: Props) {
  if (charges.length === 0) {
    return (
      <div className={cn(dataWorkspaceShellCard, dataWorkspaceBlocksEmptyStateClass)}>
        No hay cargos para mostrar con este filtro.
      </div>
    )
  }

  return (
    <div className={cn(dataWorkspaceShellCard, "overflow-hidden")}>
      <ul className="divide-y divide-border/80">
        {charges.map((charge) => (
          <li
            key={charge.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={cn(
                    "truncate font-medium",
                    workspaceTableNatureTextPrimaryClass,
                  )}
                >
                  {charge.clientName}
                </p>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                    STATUS_CLASS[charge.effectiveStatus] ?? STATUS_CLASS.pending,
                  )}
                >
                  {SERVICE_CHARGE_STATUS_LABELS[charge.effectiveStatus]}
                </span>
              </div>
              <p
                className={cn(
                  "mt-1 text-sm",
                  workspaceTableNatureTextSecondaryClass,
                )}
              >
                {charge.serviceName}
                {charge.periodCount > 1
                  ? ` · Período ${charge.sequenceIndex + 1}/${charge.periodCount}`
                  : charge.periodDisplay
                    ? ` · ${charge.periodDisplay}`
                    : ""}
              </p>
              <p
                className={cn(
                  "mt-1 font-numeric text-xs tabular-nums",
                  workspaceTableNatureTextSecondaryClass,
                )}
              >
                Vence {charge.dueDate}
                {charge.paidTotal > 0
                  ? ` · Cobrado ${fmt.format(charge.paidTotal)}`
                  : ""}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2 sm:items-end">
              <div className="text-right">
                <p
                  className={cn(
                    "font-numeric text-lg font-semibold tabular-nums",
                    workspaceTableNatureTextPrimaryClass,
                  )}
                >
                  {fmt.format(charge.amount)}
                </p>
                {charge.balance > 0 && charge.balance < charge.amount ? (
                  <p className="font-numeric text-xs tabular-nums text-[var(--rootsy-coral-700)]">
                    Saldo {fmt.format(charge.balance)}
                  </p>
                ) : charge.balance > 0 ? (
                  <p
                    className={cn(
                      "font-numeric text-xs tabular-nums",
                      workspaceTableNatureTextSecondaryClass,
                    )}
                  >
                    Saldo {fmt.format(charge.balance)}
                  </p>
                ) : null}
              </div>
              {canUpdate && charge.effectiveStatus !== "cancelled" ? (
                <div className="flex flex-wrap justify-end gap-2">
                  {charge.balance > 0 ? (
                    <RootsPrimaryButton
                      type="button"
                      onClick={() => onRecordPayment(charge)}
                    >
                      Registrar cobro
                    </RootsPrimaryButton>
                  ) : null}
                  {charge.effectiveStatus !== "paid" ? (
                    <RootsSubtleButton
                      type="button"
                      onClick={() => onCancelCharge(charge)}
                    >
                      Cancelar
                    </RootsSubtleButton>
                  ) : null}
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
