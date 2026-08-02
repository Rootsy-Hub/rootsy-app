"use client"

import type { CashRegisterSummarySession } from "@/app/[siteId]/[popId]/cash-registers/actions"
import { filterSessionsForArqueoTable } from "@/app/[siteId]/[popId]/cash-registers/cashRegisterDetailUtils"
import {
  formatCashRegisterDateTime,
  formatCashRegisterMoney,
} from "@/app/[siteId]/[popId]/cash-registers/cashRegisterFormatters"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import { tdMoneyClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import type { DataWorkspaceDatePreset } from "@/lib/dataWorkspaceDateFilter"
import { cn } from "@/lib/utils"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { useMemo, type ReactNode } from "react"
import type { DateRange } from "react-day-picker"

type Props = {
  sessions: CashRegisterSummarySession[]
  datePreset: DataWorkspaceDatePreset
  customDateRange: DateRange | undefined
  dateBounds: { from: string | null; to: string | null }
  onPresetChange: (preset: DataWorkspaceDatePreset) => void
  onCustomRangeChange: (range: DateRange | undefined) => void
  onViewArqueo: (sessionId: string) => void
}

function formatArqueoDifferenceDisplay(diff: number | null): {
  text: string
  tone: "muted" | "positive" | "negative" | "neutral"
} {
  if (diff == null) {
    return { text: "—", tone: "muted" }
  }
  if (Math.abs(diff) < 0.005) {
    return { text: formatCashRegisterMoney(0), tone: "neutral" }
  }
  return {
    text: formatCashRegisterMoney(diff),
    tone: diff > 0 ? "positive" : "negative",
  }
}

function SessionMomentCell({
  primary,
  secondary,
}: {
  primary: ReactNode
  secondary: ReactNode
}) {
  return (
    <div className="min-w-0 py-0.5">
      <div className="text-sm leading-snug text-foreground">{primary}</div>
      <div className="mt-0.5 truncate text-xs text-muted-foreground">
        {secondary}
      </div>
    </div>
  )
}

export function CashRegisterClosedSessionsPanel({
  sessions,
  datePreset,
  customDateRange,
  dateBounds,
  onPresetChange,
  onCustomRangeChange,
  onViewArqueo,
}: Props) {
  const timeZone = usePopTimeZone()
  const filteredSessions = useMemo(
    () =>
      filterSessionsForArqueoTable(
        sessions,
        dateBounds.from,
        dateBounds.to,
        timeZone,
      ),
    [sessions, dateBounds.from, dateBounds.to, timeZone],
  )

  return (
    <article className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/15 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-5">
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
        <p className="text-xs text-muted-foreground lg:text-right">
          {filteredSessions.length}{" "}
          {filteredSessions.length === 1 ? "arqueo" : "arqueos"} en el período
        </p>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center px-4 py-10 text-center text-sm text-muted-foreground lg:px-5">
          No hay arqueos en el período seleccionado.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="w-16 px-4 py-2.5 lg:px-5">#</th>
                <th className="px-4 py-2.5 lg:px-5">Apertura</th>
                <th className="px-4 py-2.5 lg:px-5">Cierre</th>
                <th className="px-4 py-2.5 text-right lg:px-5">Total cobrado</th>
                <th className="px-4 py-2.5 text-right lg:px-5">Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => {
                const isOpenSession = session.status === "open"
                const difference = formatArqueoDifferenceDisplay(
                  session.cashArqueoDifference,
                )
                const arqueoLabel =
                  session.arqueoNumber > 0
                    ? `#${session.arqueoNumber}`
                    : "—"

                return (
                  <tr
                    key={session.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Ver arqueo ${arqueoLabel}`}
                    onClick={() => onViewArqueo(session.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        onViewArqueo(session.id)
                      }
                    }}
                    className={cn(
                      "cursor-pointer border-b border-border/60 text-foreground transition-colors duration-150 last:border-b-0",
                      isOpenSession
                        ? "sticky top-0 z-10 bg-emerald-50/90 shadow-[0_1px_0_0_var(--border)] hover:bg-emerald-50"
                        : "hover:bg-muted/30",
                    )}
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 text-sm font-medium tabular-nums text-muted-foreground lg:px-5">
                      {arqueoLabel}
                    </td>
                    <td className="px-4 py-2.5 lg:px-5">
                      <SessionMomentCell
                        primary={formatCashRegisterDateTime(
                          session.openedAt,
                          timeZone,
                        )}
                        secondary={session.openedByName ?? "—"}
                      />
                    </td>
                    <td className="px-4 py-2.5 lg:px-5">
                      <SessionMomentCell
                        primary={
                          isOpenSession ? (
                            <span className="inline-flex items-center rounded-full border border-emerald-200/90 bg-emerald-50/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-emerald-800">
                              En curso
                            </span>
                          ) : session.closedAt ? (
                            formatCashRegisterDateTime(
                              session.closedAt,
                              timeZone,
                            )
                          ) : (
                            "—"
                          )
                        }
                        secondary={
                          isOpenSession ? "—" : (session.closedByName ?? "—")
                        }
                      />
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right font-bold lg:px-5",
                        tdMoneyClass,
                      )}
                    >
                      {formatCashRegisterMoney(session.totalCobrado)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right lg:px-5",
                        tdMoneyClass,
                        difference.tone === "positive" && "text-emerald-700",
                        difference.tone === "negative" && "text-destructive",
                        difference.tone === "neutral" && "text-muted-foreground",
                        difference.tone === "muted" && "text-muted-foreground",
                      )}
                    >
                      {difference.text}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </article>
  )
}
