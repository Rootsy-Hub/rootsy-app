"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { dataWorkspaceBlocksSkeletonTone } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  statisticsChartAreaClass,
  statisticsEmptyTextClass,
  statisticsLosetaCardBodyClass,
  statisticsLosetaCardClass,
  statisticsSectionHeadingClassNames,
} from "@/components/statistics/statisticsWorkspaceStyles"
import type { StatisticsRankRow } from "@/app/[siteId]/[popId]/statistics/actions"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"
import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

const chartConfig = {
  value: { label: "Valor", color: "var(--chart-1)" },
} satisfies ChartConfig

const chartShellClass = cn(
  statisticsChartAreaClass,
  "!mt-0 min-h-[360px] shrink-0 !aspect-auto [&_.recharts-responsive-container]:!h-full",
  "[&_.recharts-cartesian-axis-tick_text]:font-numeric [&_.recharts-cartesian-axis-tick_text]:tabular-nums",
)

export function StatisticsHorizontalRankBarChart({
  title,
  description,
  rows,
  loading,
  emptyMessage = "Sin datos para armar el ranking",
}: {
  title: string
  description?: string
  rows: StatisticsRankRow[]
  loading?: boolean
  emptyMessage?: string
}) {
  const { title: titleClass, description: descriptionClass } =
    statisticsSectionHeadingClassNames()

  const chartData = useMemo(
    () =>
      [...rows]
        .sort((a, b) => b.value - a.value)
        .map((row) => ({
          id: row.id ?? String(row.rank),
          label: row.label,
          value: row.value,
          units: row.secondaryValue ?? null,
        })),
    [rows],
  )

  return (
    <div
      className={cn(
        statisticsLosetaCardClass,
        statisticsLosetaCardBodyClass,
        "flex h-full w-full flex-col",
      )}
    >
      <div>
        <h3 className={titleClass}>{title}</h3>
        {description ? <p className={descriptionClass}>{description}</p> : null}
      </div>
      {loading ? (
        <div
          className={cn(
            statisticsChartAreaClass,
            "min-h-[360px] rounded-xl",
            dataWorkspaceBlocksSkeletonTone.box,
          )}
        />
      ) : chartData.length > 0 ? (
        <ChartContainer config={chartConfig} className={chartShellClass}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatReportMoneyAr(Number(value))}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={132}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => {
                    const row = item.payload as {
                      label: string
                      value: number
                      units: number | null
                    }
                    return (
                      <>
                        <div
                          className="size-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: "var(--chart-1)" }}
                        />
                        <div className="flex min-w-40 flex-1 items-center justify-between gap-4 leading-none">
                          <span className="text-muted-foreground">{row.label}</span>
                          <span className="font-numeric font-medium tabular-nums">
                            {formatReportMoneyAr(Number(value))}
                          </span>
                        </div>
                        {row.units != null ? (
                          <div className="col-span-2 mt-1 text-xs text-muted-foreground">
                            {row.units.toLocaleString("es-AR")} unidades
                          </div>
                        ) : null}
                      </>
                    )
                  }}
                />
              }
            />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={[0, 4, 4, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ChartContainer>
      ) : (
        <p
          className={cn(
            statisticsEmptyTextClass,
            statisticsChartAreaClass,
            "flex min-h-[360px] items-center justify-center text-center",
          )}
        >
          {emptyMessage}
        </p>
      )}
    </div>
  )
}
