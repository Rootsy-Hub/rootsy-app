"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  dataWorkspaceBlocksSkeletonTone,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  statisticsEmptyTextClass,
  statisticsLosetaCardBodyClass,
  statisticsLosetaCardClass,
  statisticsSectionHeadingClassNames,
} from "@/components/statistics/statisticsWorkspaceStyles"
import type { StatisticsEvolutionPoint } from "@/app/[siteId]/[popId]/statistics/actions"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

const chartConfig = {
  value: { label: "Valor", color: "var(--chart-1)" },
} satisfies ChartConfig

const chartAxisMono =
  "[&_.recharts-cartesian-axis-tick_text]:font-numeric [&_.recharts-cartesian-axis-tick_text]:tabular-nums"

export function StatisticsEvolutionChart({
  title = "Evolución",
  description,
  points,
  loading,
  valueFormat = "money",
}: {
  title?: string
  description?: string
  points: StatisticsEvolutionPoint[]
  loading?: boolean
  valueFormat?: "money" | "number"
}) {
  const hasData = points.some((p) => p.value !== 0)
  const { title: titleClass, description: descriptionClass } =
    statisticsSectionHeadingClassNames()

  const formatTick = (value: number) => {
    if (valueFormat === "money") {
      if (Math.abs(value) >= 1_000_000) {
        return `$${(value / 1_000_000).toLocaleString("es-AR", { maximumFractionDigits: 1 })}M`
      }
      if (Math.abs(value) >= 1_000) {
        return `$${(value / 1_000).toLocaleString("es-AR", { maximumFractionDigits: 0 })}k`
      }
      return formatReportMoneyAr(value)
    }
    return value.toLocaleString("es-AR")
  }

  return (
    <div className={cn(statisticsLosetaCardClass, statisticsLosetaCardBodyClass)}>
      <div>
        <h3 className={titleClass}>{title}</h3>
        {description ? <p className={descriptionClass}>{description}</p> : null}
      </div>
      {loading ? (
        <div
          className={cn(
            "mt-4 min-h-[220px] rounded-xl",
            dataWorkspaceBlocksSkeletonTone.box,
          )}
        />
      ) : hasData ? (
        <ChartContainer
          config={chartConfig}
          className={cn("mt-4 aspect-21/9 min-h-[220px] w-full", chartAxisMono)}
        >
          <AreaChart data={points} margin={{ left: 0, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="fillStatsEvolution" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              tickFormatter={formatTick}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    valueFormat === "money"
                      ? formatReportMoneyAr(Number(value))
                      : Number(value).toLocaleString("es-AR")
                  }
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              fill="url(#fillStatsEvolution)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <p
          className={cn(
            statisticsEmptyTextClass,
            "mt-4 flex min-h-[220px] items-center justify-center text-center",
          )}
        >
          Sin datos de evolución en este período
        </p>
      )}
    </div>
  )
}
