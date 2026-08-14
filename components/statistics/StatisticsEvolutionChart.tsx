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
import { useId } from "react"
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

const chartShellClass = cn(
  "mt-4 h-[220px] w-full !aspect-auto",
  "[&_.recharts-responsive-container]:!h-full",
  "[&_.recharts-cartesian-axis-tick_text]:fill-[var(--rootsy-bruma-500)]",
  "[&_.recharts-cartesian-axis-tick_text]:font-numeric",
  "[&_.recharts-cartesian-axis-tick_text]:tabular-nums",
)

function formatChartTick(
  value: number,
  valueFormat: "money" | "number",
): string {
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

function formatChartValue(
  value: number,
  valueFormat: "money" | "number",
): string {
  if (valueFormat === "money") return formatReportMoneyAr(value)
  return value.toLocaleString("es-AR")
}

export function StatisticsEvolutionChart({
  title = "Evolución",
  description,
  points,
  loading,
  valueFormat = "money",
  axisLabelInterval,
  emptyMessage = "Sin datos de evolución en este período",
}: {
  title?: string
  description?: string
  points: StatisticsEvolutionPoint[]
  loading?: boolean
  valueFormat?: "money" | "number"
  axisLabelInterval?: number
  emptyMessage?: string
}) {
  const gradientId = useId().replace(/:/g, "")
  const hasData = points.some((p) => p.value !== 0)
  const { title: titleClass, description: descriptionClass } =
    statisticsSectionHeadingClassNames()

  return (
    <div
      className={cn(
        statisticsLosetaCardClass,
        statisticsLosetaCardBodyClass,
        "flex h-full w-full flex-col overflow-visible",
      )}
    >
      <div>
        <h3 className={titleClass}>{title}</h3>
        {description ? <p className={descriptionClass}>{description}</p> : null}
      </div>
      {loading ? (
        <div
          className={cn(
            "mt-4 h-[220px] rounded-xl",
            dataWorkspaceBlocksSkeletonTone.box,
          )}
        />
      ) : hasData ? (
        <ChartContainer config={chartConfig} className={chartShellClass}>
          <AreaChart
            data={points}
            margin={{ top: 8, right: 12, bottom: 4, left: 4 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={axisLabelInterval}
              tick={{ fontSize: 11 }}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(value) => formatChartTick(value, valueFormat)}
              tick={{ fontSize: 11 }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => String(label)}
                  formatter={(value) =>
                    formatChartValue(Number(value), valueFormat)
                  }
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              fill={`url(#${gradientId})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--color-value)" }}
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <p
          className={cn(
            statisticsEmptyTextClass,
            "mt-4 flex h-[220px] items-center justify-center text-center",
          )}
        >
          {emptyMessage}
        </p>
      )}
    </div>
  )
}
