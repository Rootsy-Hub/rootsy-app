"use client"

import {
  getAccountingFinancialSummaries,
  type FinancialSummaryRow,
} from "@/app/[siteId]/[popId]/accounting/actions"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { ReportDetailHeaderCard } from "@/components/reports/ReportDetailHeaderCard"
import {
  dataWorkspaceDetailEmptyStateDescriptionClass,
  dataWorkspaceDetailFlushBottomCardClass,
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceEntityCardStatValueLargeClass,
  workspaceTableNatureMoneyClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  formatReportMoneyAr,
  formatReportPeriodSummary,
} from "@/lib/reportFormatters"
import type { DataWorkspaceDatePreset } from "@/lib/dataWorkspaceDateFilter"
import { cn } from "@/lib/utils"
import { PieChart } from "lucide-react"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"
import "@/components/layouts-tables/rootsLayoutsTablesScope.css"

type Props = {
  popId: string
  from: string | null
  to: string | null
  preset: DataWorkspaceDatePreset
  customRange: DateRange | undefined
  bounds: { from: string | null; to: string | null }
  onPresetChange: (preset: DataWorkspaceDatePreset) => void
  onCustomRangeChange: (range: DateRange | undefined) => void
  onBack: () => void
}

const SUMMARY_SECTIONS: Array<{
  title: string
  labels: string[]
}> = [
  {
    title: "Estructura patrimonial",
    labels: ["Activo (total)", "Pasivo (total)", "Patrimonio neto (total)"],
  },
  {
    title: "Cuentas de resultado",
    labels: ["Ingresos (total)", "Costos (total)", "Gastos (total)"],
  },
]

function summaryByLabel(
  summaries: FinancialSummaryRow[],
  label: string,
): FinancialSummaryRow | undefined {
  return summaries.find((row) => row.label === label)
}

function pickTotal(summaries: FinancialSummaryRow[], label: string): number {
  return summaryByLabel(summaries, label)?.total ?? 0
}

function hasSummaryMovement(summaries: FinancialSummaryRow[]): boolean {
  return summaries.some((row) => Math.abs(row.total) >= 0.01)
}

function SummaryAmount({
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

export function AccountSummariesReportView({
  popId,
  from,
  to,
  preset,
  customRange,
  bounds,
  onPresetChange,
  onCustomRangeChange,
  onBack,
}: Props) {
  const [summaries, setSummaries] = useState<FinancialSummaryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const periodSummary = useMemo(
    () => formatReportPeriodSummary(preset, { from, to }),
    [preset, from, to],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getAccountingFinancialSummaries(popId, from, to)
    setLoading(false)
    if (res.success) {
      setSummaries(res.summaries)
      return
    }
    setSummaries([])
    setError(res.error)
  }, [popId, from, to])

  useEffect(() => {
    void load()
  }, [load])

  const totals = useMemo(
    () => ({
      activo: pickTotal(summaries, "Activo (total)"),
      pasivo: pickTotal(summaries, "Pasivo (total)"),
      patrimonio: pickTotal(summaries, "Patrimonio neto (total)"),
      ingresos: pickTotal(summaries, "Ingresos (total)"),
      costos: pickTotal(summaries, "Costos (total)"),
      gastos: pickTotal(summaries, "Gastos (total)"),
    }),
    [summaries],
  )

  const resultadoNeto = useMemo(
    () => totals.ingresos - totals.costos - totals.gastos,
    [totals],
  )

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div className="flex min-h-full flex-1 flex-col gap-6 px-4 pt-6 pb-0 sm:px-6 lg:px-8">
        <ReportDetailHeaderCard
          eyebrow="Reporte de gestión"
          title="Resúmenes por rubro"
          icon={PieChart}
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
                  {loading ? "…" : formatReportMoneyAr(totals.activo)}
                </p>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Pasivo</p>
                <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
                  {loading ? "…" : formatReportMoneyAr(totals.pasivo)}
                </p>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Patrimonio neto</p>
                <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
                  {loading ? "…" : formatReportMoneyAr(totals.patrimonio)}
                </p>
              </div>
              <div className="min-w-[8.5rem]">
                <p className={dataWorkspaceEntityCardStatLabelClass}>Resultado neto</p>
                <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
                  {loading ? "…" : formatReportMoneyAr(resultadoNeto)}
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
              {periodSummary}
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
                <RootsSpinner size="default" label="Cargando resúmenes por rubro" />
                <p className="text-sm text-rootsy-bruma-500">
                  Cargando resúmenes por rubro…
                </p>
              </div>
            ) : !hasSummaryMovement(summaries) ? (
              <DataWorkspaceDetailEmptyState
                icon={PieChart}
                title="Sin movimientos en el período"
                className="min-h-52"
              />
            ) : (
              <div className="space-y-0">
                {SUMMARY_SECTIONS.map((section) => (
                  <div key={section.title}>
                    <div className="flex items-center justify-between gap-4 border-y border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] px-4 py-3 sm:px-6 lg:px-8">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-700)]">
                        {section.title}
                      </p>
                    </div>
                    {section.labels.map((label) => {
                      const row = summaryByLabel(summaries, label)
                      const displayLabel = label.replace(" (total)", "")
                      return (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-4 border-b border-[var(--rootsy-bruma-100)] px-4 py-2.5 sm:px-6 lg:px-8"
                        >
                          <p className="text-sm font-medium text-[var(--rootsy-bruma-900)]">
                            {displayLabel}
                          </p>
                          <SummaryAmount
                            amount={row?.total ?? 0}
                            className="font-semibold"
                          />
                        </div>
                      )
                    })}
                  </div>
                ))}

                <div className="mx-4 mt-4 rounded-xl border border-[color-mix(in_srgb,var(--rootsy-savia-600)_25%,var(--rootsy-bruma-200))] bg-[color-mix(in_srgb,var(--rootsy-savia-600)_6%,white)] px-4 py-4 sm:mx-6 lg:mx-8">
                  <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-center">
                    <p className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
                      Resultado neto del período
                    </p>
                    <SummaryAmount amount={resultadoNeto} className="text-base font-bold" />
                  </div>
                </div>

                <p
                  className={cn(
                    dataWorkspaceDetailEmptyStateDescriptionClass,
                    "mx-4 mt-3 text-center sm:mx-6 lg:mx-8",
                  )}
                >
                  Totales del período agrupados por tipo de cuenta. Saldo = debe − haber
                  ajustado por naturaleza contable.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
