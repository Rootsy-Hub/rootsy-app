"use client"

import type { TreasuryChildAccountRow } from "@/app/[siteId]/[popId]/accounts/actions"
import {
  getTreasuryReconciliationHistory,
  type TreasuryReconciliationEventRow,
} from "@/app/[siteId]/[popId]/accounts/treasuryDetailActions"
import {
  TREASURY_RECONCILE_COMMISSIONS_LABEL,
  formatTreasuryShortDate,
  treasuryMoneyFmt as fmt,
} from "@/app/[siteId]/[popId]/accounts/treasuryAccountUiUtils"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  type DataWorkspaceDatePreset,
  computeDataWorkspaceDateBounds,
} from "@/lib/dataWorkspaceDateFilter"
import { CreditCard, Wifi } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import type { DateRange } from "react-day-picker"

export function TreasuryChildReconciliationPanel({
  popId,
  motherAccountId,
  child,
  canConciliar,
  datePreset,
  customDateRange,
  dateBounds,
  onPresetChange,
  onCustomRangeChange,
  onConciliar,
  refreshKey,
}: {
  popId: string
  motherAccountId: string
  child: TreasuryChildAccountRow
  canConciliar: boolean
  datePreset: DataWorkspaceDatePreset
  customDateRange: DateRange | undefined
  dateBounds: ReturnType<typeof computeDataWorkspaceDateBounds>
  onPresetChange: (preset: DataWorkspaceDatePreset) => void
  onCustomRangeChange: (range: DateRange | undefined) => void
  onConciliar: () => void
  refreshKey?: number
}) {
  const [events, setEvents] = useState<TreasuryReconciliationEventRow[]>([])
  const [periodPendingBalance, setPeriodPendingBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPos = child.childRole === "pos"

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getTreasuryReconciliationHistory(popId, motherAccountId, {
      childTreasuryAccountId: child.id,
      childRole: child.childRole,
      dateFrom: dateBounds.from ?? "",
      dateTo: dateBounds.to ?? "",
    })
    setLoading(false)
    if (!res.success) {
      setError(res.error)
      setEvents([])
      setPeriodPendingBalance(0)
      return
    }
    setEvents(res.events)
    setPeriodPendingBalance(res.periodPendingBalance)
  }, [
    popId,
    motherAccountId,
    child.id,
    child.childRole,
    dateBounds.from,
    dateBounds.to,
  ])

  useEffect(() => {
    void loadEvents()
  }, [loadEvents, refreshKey])

  const periodPrincipalTotal = events.reduce(
    (sum, event) => sum + event.principalAmount,
    0,
  )
  const periodAdjustmentTotal = events.reduce(
    (sum, event) => sum + event.adjustmentAmount,
    0,
  )
  const principalLabel = isPos ? "Recibido" : "Pagado"
  const principalAmountClass = isPos
    ? "text-emerald-700 dark:text-emerald-400"
    : "text-rose-700 dark:text-rose-400"
  const commissionAmountClass = "text-amber-700 dark:text-amber-400"

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/15 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-5">
        <div className="min-w-0 flex-1">
          <DataWorkspacePeriodFilter
            variant="compact"
            hideAllPreset
            showActiveState={false}
            preset={datePreset}
            customRange={customDateRange}
            onPresetChange={onPresetChange}
            onCustomRangeChange={onCustomRangeChange}
            bounds={dateBounds}
          />
        </div>
        {canConciliar ? (
          <Button
            type="button"
            size="sm"
            className="self-end font-medium lg:self-auto"
            onClick={onConciliar}
          >
            Conciliar
          </Button>
        ) : null}
      </div>

      <div className="grid divide-y divide-border/60 border-b border-border/60 bg-muted/5 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="px-4 py-4 lg:px-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {isPos ? "Saldo a liquidar del período" : "Saldo a pagar del período"}
          </p>
          <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {loading ? "—" : fmt.format(periodPendingBalance)}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{child.name}</p>
        </div>
        <div className="px-4 py-4 lg:px-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Total conciliado del período
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">{principalLabel}</p>
              <p
                className={cn(
                  "mt-0.5 font-mono text-xl font-semibold tabular-nums tracking-tight",
                  principalAmountClass,
                )}
              >
                {loading ? "—" : fmt.format(periodPrincipalTotal)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {TREASURY_RECONCILE_COMMISSIONS_LABEL}
              </p>
              <p
                className={cn(
                  "mt-0.5 font-mono text-xl font-semibold tabular-nums tracking-tight",
                  periodAdjustmentTotal > 0
                    ? commissionAmountClass
                    : "text-muted-foreground",
                )}
              >
                {loading ? "—" : fmt.format(periodAdjustmentTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="border-b border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm text-destructive lg:px-5">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center px-4 py-10 text-sm text-muted-foreground">
          Cargando conciliaciones…
        </div>
      ) : events.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center px-4 py-10 text-center text-sm text-muted-foreground">
          No hay conciliaciones en el período seleccionado.
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <tbody className="divide-y divide-border/50">
              {events.map((event) => (
                <tr
                  key={`${event.kind}-${event.id}`}
                  className="hover:bg-muted/15"
                >
                  <td className="w-22 shrink-0 px-4 py-2.5 align-middle text-xs text-muted-foreground tabular-nums lg:px-5">
                    {formatTreasuryShortDate(event.eventDate)}
                  </td>
                  <td className="min-w-0 px-4 py-2.5 align-middle lg:px-5">
                    <span className="block truncate text-foreground">
                      {event.notes.trim() || "—"}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "w-28 shrink-0 px-4 py-2.5 align-middle text-right font-mono text-sm font-semibold tabular-nums lg:px-5",
                      principalAmountClass,
                    )}
                  >
                    {fmt.format(event.principalAmount)}
                  </td>
                  <td
                    className={cn(
                      "w-28 shrink-0 px-4 py-2.5 align-middle text-right font-mono text-sm tabular-nums lg:px-5",
                      event.adjustmentAmount > 0
                        ? cn("font-semibold", commissionAmountClass)
                        : "text-muted-foreground",
                    )}
                  >
                    {event.adjustmentAmount > 0
                      ? fmt.format(event.adjustmentAmount)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export function ChildIntegrationChip({
  child,
  selected,
  onToggle,
}: {
  child: TreasuryChildAccountRow
  selected: boolean
  onToggle: (child: TreasuryChildAccountRow) => void
}) {
  const isPos = child.childRole === "pos"

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onToggle(child)}
      className={cn(
        "group flex min-w-0 w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all",
        "cursor-pointer hover:border-primary/35 hover:bg-muted/25 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/25"
          : "border-border/60 bg-muted/15",
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
          selected ? "bg-primary/10" : "bg-background/80 group-hover:bg-background",
        )}
      >
        {isPos ? (
          <Wifi
            className={cn(
              "size-4",
              selected ? "text-primary" : "text-muted-foreground",
            )}
            aria-hidden
          />
        ) : (
          <CreditCard
            className={cn(
              "size-4",
              selected ? "text-primary" : "text-muted-foreground",
            )}
            aria-hidden
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {isPos ? "Terminal POS" : "Tarjeta corporativa"}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
          {child.name}
        </p>
      </div>
    </button>
  )
}
