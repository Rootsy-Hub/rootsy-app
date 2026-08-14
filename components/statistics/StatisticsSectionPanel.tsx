"use client"

import type { StatisticsSectionData } from "@/app/[siteId]/[popId]/statistics/actions"
import { StatisticsCompareKpiRow } from "@/components/statistics/StatisticsCompareKpiRow"
import { StatisticsEvolutionChart } from "@/components/statistics/StatisticsEvolutionChart"
import { StatisticsRankTable } from "@/components/statistics/StatisticsRankTable"
import { StatisticsSegmentList } from "@/components/statistics/StatisticsSegmentList"
import { dataWorkspaceShellCard } from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"

export function StatisticsSectionPanel({
  data,
  loading,
  compareEnabled,
}: {
  data: StatisticsSectionData | null
  loading?: boolean
  compareEnabled: boolean
}) {
  const valueFormat =
    data?.sectionId === "inventory" || data?.sectionId === "clients"
      ? data?.comparison.some((m) => m.format === "number")
        ? ("number" as const)
        : ("money" as const)
      : ("money" as const)

  const rankFormat =
    data?.sectionId === "inventory" ? ("number" as const) : ("money" as const)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--rootsy-bruma-900)]">
          {data?.title ?? "—"}
        </h2>
        <p className="mt-1 text-sm text-[var(--rootsy-bruma-500)]">
          {data?.description ?? ""}
        </p>
      </div>

      <section>
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
          Comparar
        </h3>
        <StatisticsCompareKpiRow
          metrics={data?.comparison ?? []}
          loading={loading}
          compareEnabled={compareEnabled}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <StatisticsEvolutionChart
            title="Evolucionar"
            points={data?.evolution ?? []}
            loading={loading}
          />
        </section>
        <section>
          <StatisticsSegmentList
            title="Segmentar"
            segments={data?.segments ?? []}
            loading={loading}
            valueFormat={rankFormat}
          />
        </section>
      </div>

      <section>
        <StatisticsRankTable
          title="Rankear"
          rows={data?.rankings ?? []}
          loading={loading}
          valueFormat={rankFormat}
        />
      </section>

      {data?.unavailable.length ? (
        <div className={cn(dataWorkspaceShellCard, "px-4 py-3 sm:px-5")}>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
            Pendiente de implementar
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {data.unavailable.map((item) => (
              <li
                key={item}
                className="rounded-full bg-[var(--rootsy-bruma-50)] px-2.5 py-1 text-xs text-[var(--rootsy-bruma-600)]"
              >
                {item} · —
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
