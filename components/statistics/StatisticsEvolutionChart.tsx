"use client"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  dataWorkspaceBlocksSkeletonTone,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  statisticsChartAreaClass,
  statisticsEmptyTextClass,
  statisticsLosetaCardBodyClass,
  statisticsLosetaCardClass,
  statisticsSectionHeadingClassNames,
} from "@/components/statistics/statisticsWorkspaceStyles"
import type {
  StatisticsEvolutionDualSeries,
  StatisticsEvolutionPoint,
} from "@/app/[siteId]/[popId]/statistics/actions"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"
import { useId, useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

const singleChartConfig = {
  value: { label: "Valor", color: "var(--chart-1)" },
} satisfies ChartConfig

const chartShellClass = cn(
  statisticsChartAreaClass,
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

function formatSecondaryTick(
  value: number,
  format: "number" | "percent" | "money",
): string {
  if (format === "percent") {
    return `${value.toLocaleString("es-AR", {
      maximumFractionDigits: 0,
    })}%`
  }
  if (format === "money") return formatChartTick(value, "money")
  return Number(value).toLocaleString("es-AR")
}

function formatSecondaryValue(
  value: number,
  format: "number" | "percent" | "money",
): string {
  if (format === "percent") {
    return `${value.toLocaleString("es-AR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} %`
  }
  if (format === "money") return formatReportMoneyAr(value)
  return Number(value).toLocaleString("es-AR")
}

export function StatisticsEvolutionChart({
  title = "Evolución",
  description,
  points,
  loading,
  valueFormat = "money",
  dualSeries,
  axisLabelInterval,
  emptyMessage = "Sin datos de evolución en este período",
  hideHeader = false,
  embedded = false,
}: {
  title?: string
  description?: string
  points: StatisticsEvolutionPoint[]
  loading?: boolean
  valueFormat?: "money" | "number"
  dualSeries?: StatisticsEvolutionDualSeries
  axisLabelInterval?: number
  emptyMessage?: string
  hideHeader?: boolean
  embedded?: boolean
}) {
  const isMobile = useIsMobile()
  const valueGradientId = useId().replace(/:/g, "")
  const countGradientId = useId().replace(/:/g, "")
  const profitGradientId = useId().replace(/:/g, "")
  const showDualSeries =
    Boolean(dualSeries) && points.some((point) => typeof point.count === "number")
  const showTertiarySeries =
    Boolean(dualSeries?.tertiaryLabel) &&
    points.some((point) => typeof point.profit === "number")
  const chartConfig = useMemo<ChartConfig>(() => {
    if (!showDualSeries || !dualSeries) return singleChartConfig
    const config: ChartConfig = {
      value: { label: dualSeries.primaryLabel, color: "var(--chart-1)" },
      count: { label: dualSeries.secondaryLabel, color: "var(--chart-2)" },
    }
    if (dualSeries.tertiaryLabel) {
      config.profit = { label: dualSeries.tertiaryLabel, color: "var(--chart-3)" }
    }
    return config
  }, [dualSeries, showDualSeries])
  const hasData = points.some(
    (point) =>
      point.value !== 0 ||
      (showDualSeries && (point.count ?? 0) !== 0) ||
      (showTertiarySeries && (point.profit ?? 0) !== 0),
  )
  const { title: titleClass, description: descriptionClass } =
    statisticsSectionHeadingClassNames()

  return (
      <div
        className={cn(
          !embedded && statisticsLosetaCardClass,
          !embedded && statisticsLosetaCardBodyClass,
          embedded && "flex w-full flex-col overflow-visible",
          !embedded && hideHeader ? "pt-0" : "",
          !embedded && "flex h-full w-full flex-col overflow-visible",
        )}
      >
      {!hideHeader ? (
      <div>
        <h3 className={titleClass}>{title}</h3>
        {description ? <p className={descriptionClass}>{description}</p> : null}
      </div>
      ) : null}
      {loading ? (
        <div
          className={cn(
            statisticsChartAreaClass,
            "rounded-xl",
            dataWorkspaceBlocksSkeletonTone.box,
          )}
        />
      ) : hasData ? (
        <ChartContainer config={chartConfig} className={chartShellClass}>
          <AreaChart
            data={points}
            margin={{
              top: 8,
              right: showDualSeries ? (isMobile ? 28 : 44) : isMobile ? 4 : 12,
              bottom: showDualSeries ? 0 : 4,
              left: isMobile ? 0 : 4,
            }}
          >
            <defs>
              <linearGradient id={valueGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
              {showDualSeries ? (
                <linearGradient id={countGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              ) : null}
              {showTertiarySeries ? (
                <linearGradient id={profitGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
                </linearGradient>
              ) : null}
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
              yAxisId="value"
              tickLine={false}
              axisLine={false}
              width={isMobile ? 40 : 56}
              tickFormatter={(value) => formatChartTick(value, valueFormat)}
              tick={{ fontSize: 11 }}
            />
            {showDualSeries && dualSeries ? (
              <YAxis
                yAxisId="count"
                orientation="right"
                tickLine={false}
                axisLine={false}
                width={isMobile ? 28 : 40}
                allowDecimals={dualSeries.secondaryFormat === "percent"}
                tickFormatter={(value) =>
                  formatSecondaryTick(Number(value), dualSeries.secondaryFormat)
                }
                tick={{ fontSize: 11 }}
              />
            ) : null}
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => String(label)}
                  formatter={(value, name, item) => {
                    const seriesName = String(name)
                    const isSecondary = seriesName === "count"
                    const isProfit = seriesName === "profit"
                    const label = isSecondary
                      ? chartConfig.count?.label ?? "Valor"
                      : isProfit
                        ? chartConfig.profit?.label ?? "Ganancia"
                        : chartConfig.value?.label ?? "Valor"
                    const formatted = isSecondary
                      ? formatSecondaryValue(
                          Number(value),
                          dualSeries?.secondaryFormat ?? "number",
                        )
                      : formatChartValue(Number(value), valueFormat)
                    const indicatorColor =
                      item.color ||
                      (isSecondary
                        ? "var(--color-count)"
                        : isProfit
                          ? "var(--color-profit)"
                          : "var(--color-value)")

                    return (
                      <>
                        <div
                          className="size-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: indicatorColor }}
                        />
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 leading-none sm:min-w-40 sm:gap-4">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-numeric font-medium tabular-nums">
                            {formatted}
                          </span>
                        </div>
                      </>
                    )
                  }}
                />
              }
            />
            {showDualSeries ? (
              <ChartLegend content={<ChartLegendContent />} />
            ) : null}
            <Area
              yAxisId="value"
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              fill={`url(#${valueGradientId})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--color-value)" }}
            />
            {showDualSeries ? (
              <Area
                yAxisId="count"
                type="monotone"
                dataKey="count"
                stroke="var(--color-count)"
                fill={`url(#${countGradientId})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "var(--color-count)" }}
              />
            ) : null}
            {showTertiarySeries ? (
              <Area
                yAxisId="value"
                type="monotone"
                dataKey="profit"
                stroke="var(--color-profit)"
                fill={`url(#${profitGradientId})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "var(--color-profit)" }}
              />
            ) : null}
          </AreaChart>
        </ChartContainer>
      ) : (
        <p
          className={cn(
            statisticsEmptyTextClass,
            statisticsChartAreaClass,
            "flex items-center justify-center text-center",
          )}
        >
          {emptyMessage}
        </p>
      )}
    </div>
  )
}
