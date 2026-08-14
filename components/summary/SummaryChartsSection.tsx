"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { dataWorkspaceShellCard } from "@/components/data-workspace/dataWorkspaceListStyles"
import type {
  SummaryChannelShare,
  SummaryChartPoint,
} from "@/app/[siteId]/[popId]/summary/actions"
import { cn } from "@/lib/utils"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

const chartAxisMono =
  "[&_.recharts-cartesian-axis-tick_text]:font-numeric [&_.recharts-cartesian-axis-tick_text]:tabular-nums"

const salesConfig = {
  ventas: { label: "Ventas", color: "var(--chart-1)" },
} satisfies ChartConfig

const flowConfig = {
  ingresos: { label: "Ingresos", color: "var(--chart-3)" },
  egresos: { label: "Egresos", color: "var(--chart-4)" },
} satisfies ChartConfig

const pieColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
]

export function SummaryChartsSection({
  salesChart,
  channelShares,
  loading,
}: {
  salesChart: SummaryChartPoint[]
  channelShares: SummaryChannelShare[] | null
  loading?: boolean
}) {
  const hasSalesData = salesChart.some((p) => p.ventas > 0)
  const hasFlowData = salesChart.some((p) => p.ingresos > 0 || p.egresos > 0)

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-5">
        {[0, 1].map((i) => (
          <div
            key={i}
            className={cn(
              dataWorkspaceShellCard,
              "min-h-[240px] animate-pulse bg-[var(--rootsy-bruma-50)]",
              i === 0 ? "lg:col-span-3" : "lg:col-span-2",
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className={cn(dataWorkspaceShellCard, "p-4 lg:col-span-3")}>
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
            Evolución de ventas
          </h3>
        </div>
        {hasSalesData ? (
          <ChartContainer
            config={salesConfig}
            className={cn("aspect-21/9 min-h-[200px] w-full", chartAxisMono)}
          >
            <AreaChart data={salesChart} margin={{ left: 0, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="fillVentas" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="ventas"
                stroke="var(--color-ventas)"
                fill="url(#fillVentas)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <p className="flex min-h-[200px] items-center justify-center text-sm text-[var(--rootsy-bruma-500)]">
            —
          </p>
        )}
      </div>

      <div className={cn(dataWorkspaceShellCard, "p-4 lg:col-span-2")}>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-[var(--rootsy-bruma-900)]">
            Ingresos vs. egresos
          </h3>
        </div>
        {hasFlowData ? (
          <ChartContainer
            config={flowConfig}
            className={cn("aspect-square max-h-[220px] w-full", chartAxisMono)}
          >
            <BarChart data={salesChart.slice(-7)} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="ingresos" fill="var(--color-ingresos)" radius={4} />
              <Bar dataKey="egresos" fill="var(--color-egresos)" radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="flex min-h-[200px] items-center justify-center text-sm text-[var(--rootsy-bruma-500)]">
            —
          </p>
        )}

        {channelShares && channelShares.length > 0 ? (
          <div className="mt-4 border-t border-[var(--rootsy-bruma-100)] pt-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
              Ventas por tipo de operación
            </p>
            <ul className="mt-2 grid gap-1.5">
              {channelShares.map((item, i) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="flex items-center gap-2 text-[var(--rootsy-bruma-700)]">
                    <span
                      className="size-2 rounded-sm"
                      style={{ backgroundColor: pieColors[i % pieColors.length] }}
                    />
                    {item.label}
                  </span>
                  <span className="font-numeric font-medium tabular-nums text-[var(--rootsy-bruma-900)]">
                    {item.percent.toLocaleString("es-AR")}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
