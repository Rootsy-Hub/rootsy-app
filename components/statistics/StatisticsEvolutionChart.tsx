"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { dataWorkspaceShellCard } from "@/components/data-workspace/dataWorkspaceListStyles"
import type { StatisticsEvolutionPoint } from "@/app/[siteId]/[popId]/statistics/actions"
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
  points,
  loading,
}: {
  title?: string
  points: StatisticsEvolutionPoint[]
  loading?: boolean
}) {
  const hasData = points.some((p) => p.value !== 0)

  return (
    <div className={cn(dataWorkspaceShellCard, "p-4 sm:p-5")}>
      <h3 className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
        {title}
      </h3>
      {loading ? (
        <div className="mt-4 min-h-[220px] animate-pulse rounded-xl bg-[var(--rootsy-bruma-50)]" />
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
            <YAxis tickLine={false} axisLine={false} width={48} />
            <ChartTooltip content={<ChartTooltipContent />} />
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
        <p className="mt-4 flex min-h-[220px] items-center justify-center text-sm text-[var(--rootsy-bruma-500)]">
          Sin datos de evolución en este período
        </p>
      )}
    </div>
  )
}
