"use client"

import {
  getAccountingBalanceSheet,
  type BalanceSheetResult,
} from "@/app/[siteId]/[popId]/accounting/actions"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { ReportDetailHeaderCard } from "@/components/reports/ReportDetailHeaderCard"
import {
  dataWorkspaceDetailEmptyStateDescriptionClass,
  dataWorkspaceDetailFlushBottomCardClass,
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceEntityCardStatValueLargeClass,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  formatReportAsOfSummary,
  formatReportMoneyAr,
} from "@/lib/reportFormatters"
import {
  toISODateLocal,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import {
  buildBalanceSheetDisplayRows,
  hasBalanceSheetMovement,
  type BalanceSheetDisplayRow,
} from "@/lib/balanceSheetReportHierarchy"
import { cn } from "@/lib/utils"
import { Equal, EqualNot, Scale } from "lucide-react"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"
import "@/components/layouts-tables/rootsLayoutsTablesScope.css"

type Props = {
  popId: string
  preset: DataWorkspaceDatePreset
  customRange: DateRange | undefined
  bounds: { from: string | null; to: string | null }
  onPresetChange: (preset: DataWorkspaceDatePreset) => void
  onCustomRangeChange: (range: DateRange | undefined) => void
  onBack: () => void
}

function resolveBalanceSheetAsOf(bounds: {
  from: string | null
  to: string | null
}): string {
  return bounds.to ?? toISODateLocal(new Date())
}

function BalanceSheetAmount({
  amount,
  className,
}: {
  amount: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "shrink-0 text-right text-sm tabular-nums",
        workspaceTableNatureMoneyClass,
        className,
      )}
    >
      {formatReportMoneyAr(amount)}
    </span>
  )
}

function BalanceSheetRowView({
  row,
  showGroupAccounts,
}: {
  row: BalanceSheetDisplayRow
  showGroupAccounts: boolean
}) {
  if (row.kind === "section-header") {
    return (
      <div className="flex items-center justify-between gap-4 border-y border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] px-4 py-3 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-700)]">
          {row.label}
        </p>
      </div>
    )
  }

  if (row.kind === "group-header") {
    return (
      <div className="flex items-start justify-between gap-4 border-b border-[var(--rootsy-bruma-100)] px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="min-w-0 pl-2 sm:pl-3">
          <p className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
            {row.label}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-[var(--rootsy-bruma-500)]">
            {row.prefix}
          </p>
        </div>
        <BalanceSheetAmount amount={row.total} className="font-semibold" />
      </div>
    )
  }

  if (row.kind === "account") {
    if (!showGroupAccounts) return null

    return (
      <div className="flex items-start justify-between gap-4 border-b border-[var(--rootsy-bruma-100)] px-4 py-2 sm:px-6 lg:px-8">
        <div className="min-w-0 pl-6 sm:pl-10">
          <p className={cn("text-sm", workspaceTableNatureTextSecondaryClass)}>
            {row.line.accountName}
          </p>
          {row.line.accountCode !== "—" ? (
            <p className="mt-0.5 font-mono text-[11px] text-[var(--rootsy-bruma-500)]">
              {row.line.accountCode}
            </p>
          ) : null}
        </div>
        <BalanceSheetAmount amount={row.line.balance} />
      </div>
    )
  }

  if (row.kind === "section-total") {
    return (
      <div className="flex items-center justify-between gap-4 border-b-2 border-[var(--rootsy-bruma-200)] bg-[color-mix(in_srgb,var(--rootsy-bruma-100)_55%,white)] px-4 py-2.5 sm:px-6 lg:px-8">
        <p className="pl-2 text-sm font-semibold text-[var(--rootsy-bruma-900)] sm:pl-3">
          {row.label}
        </p>
        <BalanceSheetAmount amount={row.total} className="font-semibold" />
      </div>
    )
  }

  const cuadra = Math.abs(row.diferenciaCuadre) < 0.02

  return (
    <div className="mx-4 mt-4 space-y-3 sm:mx-6 lg:mx-8">
      <div className="rounded-xl border border-[color-mix(in_srgb,var(--rootsy-savia-600)_25%,var(--rootsy-bruma-200))] bg-[color-mix(in_srgb,var(--rootsy-savia-600)_6%,white)] px-4 py-4">
        <div className="flex flex-col items-center gap-3 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-x-4 sm:gap-y-0">
          <div className="flex w-full flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-sm sm:justify-end">
            <span className="font-semibold text-[var(--rootsy-bruma-900)]">
              Activo
            </span>
            <BalanceSheetAmount amount={row.totalActivo} className="font-bold" />
          </div>

          <div
            className={cn(
              "mx-auto flex size-10 shrink-0 items-center justify-center rounded-full border",
              cuadra
                ? "border-[color-mix(in_srgb,var(--rootsy-savia-600)_35%,var(--rootsy-bruma-200))] bg-[color-mix(in_srgb,var(--rootsy-savia-600)_14%,white)] text-[var(--rootsy-savia-700)]"
                : "border-amber-200 bg-amber-50 text-amber-700",
            )}
            aria-label={cuadra ? "Balance cuadrado" : "Balance con diferencia"}
          >
            {cuadra ? (
              <Equal className="size-5" strokeWidth={2.25} aria-hidden />
            ) : (
              <EqualNot className="size-5" strokeWidth={2.25} aria-hidden />
            )}
          </div>

          <div className="flex w-full flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-sm sm:justify-start">
            <span className="font-semibold text-[var(--rootsy-bruma-900)]">
              Pasivo + patrimonio neto
            </span>
            <BalanceSheetAmount
              amount={row.totalPasivoPatrimonioYResultado}
              className="font-bold"
            />
          </div>
        </div>
      </div>
      <p
        className={cn(
          "text-center text-sm tabular-nums",
          cuadra ? "text-[var(--rootsy-savia-700)]" : "text-amber-700",
        )}
      >
        Diferencia de cuadre: {formatReportMoneyAr(row.diferenciaCuadre)}
      </p>
    </div>
  )
}

export function BalanceSheetReportView({
  popId,
  preset,
  customRange,
  bounds,
  onPresetChange,
  onCustomRangeChange,
  onBack,
}: Props) {
  const [data, setData] = useState<BalanceSheetResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const asOf = useMemo(() => resolveBalanceSheetAsOf(bounds), [bounds])

  const asOfSummary = useMemo(
    () => formatReportAsOfSummary(preset, bounds, asOf),
    [preset, bounds, asOf],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getAccountingBalanceSheet(popId, asOf)
    setLoading(false)
    if (res.success) {
      setData(res.data)
      return
    }
    setData(null)
    setError(res.error)
  }, [popId, asOf])

  useEffect(() => {
    void load()
  }, [load])

  const displayRows = useMemo(
    () => (data ? buildBalanceSheetDisplayRows(data) : []),
    [data],
  )

  const showGroupAccounts = useMemo(
    () =>
      displayRows.some(
        (row) => row.kind === "group-header" || row.kind === "account",
      ) && displayRows.some((row) => row.kind === "account"),
    [displayRows],
  )

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="flex min-h-full flex-1 flex-col gap-6 px-4 pt-6 pb-0 sm:px-6 lg:px-8">
        <ReportDetailHeaderCard
          eyebrow="Reporte de gestión"
          title="Balance general"
          icon={Scale}
          onBack={onBack}
          preset={preset}
          customRange={customRange}
          bounds={bounds}
          onPresetChange={onPresetChange}
          onCustomRangeChange={onCustomRangeChange}
          stats={
            <>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Activo</p>
                <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
                  {loading ? "…" : formatReportMoneyAr(data?.totalActivo ?? 0)}
                </p>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Pasivo</p>
                <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
                  {loading ? "…" : formatReportMoneyAr(data?.totalPasivo ?? 0)}
                </p>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>
                  Patrimonio neto
                </p>
                <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
                  {loading
                    ? "…"
                    : formatReportMoneyAr(
                        data?.sections.find((section) => section.key === "patrimonio")
                          ?.sectionTotal ?? 0,
                      )}
                </p>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>
                  Diferencia de cuadre
                </p>
                <p
                  className={cn(
                    "mt-1.5",
                    dataWorkspaceEntityCardStatValueLargeClass,
                    !loading &&
                      data &&
                      Math.abs(data.diferenciaCuadre) >= 0.02 &&
                      "text-amber-700",
                  )}
                >
                  {loading ? "…" : formatReportMoneyAr(data?.diferenciaCuadre ?? 0)}
                </p>
              </div>
            </>
          }
        />

        <section
          className={cn(
            dataWorkspaceDetailFlushBottomCardClass,
            "flex min-h-0 flex-1 flex-col",
          )}
        >
          <div className="border-b border-[var(--rootsy-bruma-200)] px-4 py-3 sm:px-6 lg:px-8">
            <p className={dataWorkspaceDetailEmptyStateDescriptionClass}>
              {asOfSummary}
            </p>
          </div>

          {error ? (
            <div
              role="alert"
              className="mx-4 mt-4 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-6 lg:mx-8"
            >
              {error}
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-auto py-4">
            {loading ? (
              <div
                className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-10"
                aria-busy="true"
              >
                <RootsSpinner size="default" label="Cargando balance general" />
                <p className="text-sm text-rootsy-bruma-500">
                  Cargando balance general…
                </p>
              </div>
            ) : !data || !hasBalanceSheetMovement(data) ? (
              <DataWorkspaceDetailEmptyState
                icon={Scale}
                title="Sin saldos a la fecha de corte"
                className="min-h-52"
              />
            ) : (
              <div className="space-y-0">
                {displayRows.map((row, index) => {
                  if (row.kind === "balance-equation") {
                    return (
                      <div key="balance-equation">
                        <BalanceSheetRowView
                          row={row}
                          showGroupAccounts={showGroupAccounts}
                        />
                        <p
                          className={cn(
                            dataWorkspaceDetailEmptyStateDescriptionClass,
                            "mx-4 mt-3 text-center sm:mx-6 lg:mx-8",
                          )}
                        >
                          Saldos acumulados hasta la fecha de corte. Incluye resultado
                          acumulado (ingresos − costos − gastos) para cuadrar con el
                          plan sin asientos de cierre.
                        </p>
                      </div>
                    )
                  }

                  const key =
                    row.kind === "section-header"
                      ? `section-${row.section}`
                      : row.kind === "group-header"
                        ? `group-${row.section}-${row.prefix}`
                        : row.kind === "account"
                          ? `account-${row.line.accountCode}-${row.line.accountName}`
                          : `total-${row.section}`

                  return (
                    <BalanceSheetRowView
                      key={`${key}-${index}`}
                      row={row}
                      showGroupAccounts={showGroupAccounts}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
