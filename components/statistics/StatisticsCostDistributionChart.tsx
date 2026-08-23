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
import type { StatisticsSegment } from "@/app/[siteId]/[popId]/statistics/actions"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"
import { useMemo } from "react"
import { Cell, Pie, PieChart, type PieLabelRenderProps } from "recharts"

const pieColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

function topSegmentLabelIndices(
  chartData: Array<{ percent: number }>,
  limit = 3,
): Set<number> {
  return new Set(
    chartData
      .map((item, index) => ({ index, percent: item.percent }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, limit)
      .map((item) => item.index),
  )
}

function renderExternalPieLabel(
  chartData: Array<{ label: string; value: number; percent: number }>,
  colors: string[],
  options: {
    showAmount?: boolean
    labelIndices?: Set<number>
    formatValue?: (value: number) => string
  } = {},
) {
  const {
    showAmount = false,
    labelIndices,
    formatValue = formatReportMoneyAr,
  } = options

  return ({
    cx,
    cy,
    midAngle,
    outerRadius,
    index,
  }: PieLabelRenderProps) => {
    const segmentIndex = index ?? -1
    const segment = chartData[segmentIndex]
    const color = colors[segmentIndex % colors.length]
    if (
      !segment ||
      cx == null ||
      cy == null ||
      midAngle == null ||
      outerRadius == null
    ) {
      return null
    }

    if (labelIndices) {
      if (!labelIndices.has(segmentIndex)) return null
    } else if (segment.percent < 3) {
      return null
    }

    const RADIAN = Math.PI / 180
    const angle = -Number(midAngle) * RADIAN
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)
    const centerX = Number(cx)
    const centerY = Number(cy)
    const radius = Number(outerRadius)
    const sx = centerX + radius * cos
    const sy = centerY + radius * sin
    const mx = centerX + (radius + 8) * cos
    const my = centerY + (radius + 8) * sin
    const ex = mx + (cos >= 0 ? 1 : -1) * 14
    const ey = my
    const textAnchor = cos >= 0 ? "start" : "end"
    const labelX = ex + (cos >= 0 ? 4 : -4)
    const percentLabel = `${segment.percent.toLocaleString("es-AR", {
      maximumFractionDigits: 1,
    })}%`

    return (
      <g aria-hidden>
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={color}
          strokeWidth={1.25}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x={labelX}
          y={ey}
          textAnchor={textAnchor}
          dominantBaseline="central"
          fill="var(--rootsy-bruma-800)"
          className="font-numeric text-[11px] font-semibold tabular-nums"
        >
          {showAmount ? (
            <>
              <tspan x={labelX} dy={showAmount ? -6 : 0}>
                {percentLabel}
              </tspan>
              <tspan
                x={labelX}
                dy={14}
                className="text-[10px] font-medium text-rootsy-bruma-600"
              >
                {formatValue(segment.value)}
              </tspan>
            </>
          ) : (
            percentLabel
          )}
        </text>
      </g>
    )
  }
}

const chartConfig = {
  value: { label: "Costo", color: "var(--chart-1)" },
} satisfies ChartConfig

const chartShellClass = cn(
  statisticsChartAreaClass,
  "overflow-visible [&_.recharts-surface]:overflow-visible",
)

const chartShellCompactClass = cn(
  chartShellClass,
  "!mt-0 h-[180px] shrink-0 !aspect-auto [&_.recharts-responsive-container]:!h-full",
)

export function StatisticsCostDistributionChart({
  title = "Distribución de costos",
  description,
  segments,
  loading,
  emptyMessage = "Sin costos de venta clasificados en este período",
  externalLabelShowsAmount = false,
  segmentValueFormat = "money",
  preserveSegmentOrder = false,
  selectedSegmentId,
  onSegmentSelect,
}: {
  title?: string
  description?: string
  segments: StatisticsSegment[]
  loading?: boolean
  emptyMessage?: string
  /** Tortas de categorías: detalle abajo y flechas solo en el top 3. */
  externalLabelShowsAmount?: boolean
  segmentValueFormat?: "money" | "number"
  preserveSegmentOrder?: boolean
  selectedSegmentId?: string | null
  onSegmentSelect?: (segmentId: string, label: string) => void
}) {
  const isMobile = useIsMobile()
  const chartData = useMemo(
    () => {
      const mapped = segments.map((segment) => ({
        id: segment.id,
        label: segment.label,
        value: segment.value,
        percent: segment.percent,
      }))
      if (preserveSegmentOrder) return mapped
      return [...mapped].sort((a, b) => b.percent - a.percent)
    },
    [preserveSegmentOrder, segments],
  )
  const topLabelIndices = useMemo(
    () => (externalLabelShowsAmount ? topSegmentLabelIndices(chartData, 3) : null),
    [chartData, externalLabelShowsAmount],
  )
  const { title: titleClass, description: descriptionClass } =
    statisticsSectionHeadingClassNames()

  const formatSegmentValue = (value: number) =>
    segmentValueFormat === "number"
      ? value.toLocaleString("es-AR")
      : formatReportMoneyAr(value)

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
            statisticsChartAreaClass,
            "rounded-xl",
            dataWorkspaceBlocksSkeletonTone.box,
          )}
        />
      ) : chartData.length > 0 ? (
        <>
          <ChartContainer
            config={chartConfig}
            className={externalLabelShowsAmount ? chartShellCompactClass : chartShellClass}
          >
            <PieChart
              margin={
                isMobile
                  ? { top: 4, right: 4, bottom: 4, left: 4 }
                  : { top: 12, right: 28, bottom: 12, left: 28 }
              }
            >
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, item) => {
                      const row = item.payload as {
                        label: string
                        value: number
                        percent: number
                      }
                      return (
                        <>
                          <div
                            className="size-2.5 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: item.payload.fill }}
                          />
                          <div className="flex min-w-0 flex-1 items-center justify-between gap-3 leading-none sm:min-w-40 sm:gap-4">
                            <span className="text-muted-foreground">{row.label}</span>
                            <span className="font-numeric font-medium tabular-nums">
                              {formatSegmentValue(Number(value))} (
                              {row.percent.toLocaleString("es-AR", {
                                maximumFractionDigits: 1,
                              })}
                              %)
                            </span>
                          </div>
                        </>
                      )
                    }}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius="48%"
                outerRadius="62%"
                paddingAngle={2}
                strokeWidth={0}
                label={
                  isMobile
                    ? false
                    : renderExternalPieLabel(chartData, pieColors, {
                        showAmount: externalLabelShowsAmount,
                        labelIndices: topLabelIndices ?? undefined,
                        formatValue: formatSegmentValue,
                      })
                }
                labelLine={false}
              >
                {chartData.map((segment, index) => (
                  <Cell
                    key={segment.id ?? segment.label}
                    fill={pieColors[index % pieColors.length]}
                    className={cn(
                      onSegmentSelect && segment.id
                        ? "cursor-pointer transition-opacity hover:opacity-80"
                        : undefined,
                    )}
                    onClick={
                      onSegmentSelect && segment.id
                        ? () => onSegmentSelect(segment.id!, segment.label)
                        : undefined
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          {externalLabelShowsAmount ? (
            <ul className="mt-4 space-y-2 border-t border-rootsy-bruma-200 pt-4">
              {chartData.map((segment, index) => {
                const color = pieColors[index % pieColors.length]
                const isSelected =
                  Boolean(segment.id) && segment.id === selectedSegmentId
                const isInteractive = Boolean(onSegmentSelect && segment.id)
                return (
                  <li key={segment.id ?? segment.label}>
                    <button
                      type="button"
                      disabled={!isInteractive}
                      onClick={
                        isInteractive
                          ? () => onSegmentSelect!(segment.id!, segment.label)
                          : undefined
                      }
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                        isInteractive
                          ? "cursor-pointer hover:bg-rootsy-bruma-50"
                          : "cursor-default",
                        isSelected && "bg-rootsy-bruma-100",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2 text-rootsy-bruma-700">
                        <span
                          className="size-2 shrink-0 rounded-sm"
                          style={{ backgroundColor: color }}
                          aria-hidden
                        />
                        <span className="truncate">{segment.label}</span>
                      </span>
                      <span className="shrink-0 font-numeric tabular-nums text-rootsy-bruma-800">
                        <span className="font-medium">
                          {segment.percent.toLocaleString("es-AR", {
                            maximumFractionDigits: 1,
                          })}
                          %
                        </span>
                        <span className="mx-1.5 text-rootsy-bruma-400">·</span>
                        <span className="text-rootsy-bruma-600">
                          {formatSegmentValue(segment.value)}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </>
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
