"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { dataWorkspaceShellCard } from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

export const layoutPreviewShellCard = dataWorkspaceShellCard

const shellCard = layoutPreviewShellCard

const SALES_BY_DAY = [
  { dia: "Lun", monto: 42 },
  { dia: "Mar", monto: 58 },
  { dia: "Mié", monto: 51 },
  { dia: "Jue", monto: 67 },
  { dia: "Vie", monto: 72 },
  { dia: "Sáb", monto: 89 },
  { dia: "Dom", monto: 64 },
]

const REVENUE_TREND = [
  { mes: "Sep", ingresos: 118 },
  { mes: "Oct", ingresos: 132 },
  { mes: "Nov", ingresos: 126 },
  { mes: "Dic", ingresos: 151 },
  { mes: "Ene", ingresos: 168 },
  { mes: "Feb", ingresos: 174 },
]

const CATEGORY_SHARE = [
  { rubro: "Alimentos", valor: 38 },
  { rubro: "Bebidas", valor: 24 },
  { rubro: "Limpieza", valor: 18 },
  { rubro: "Otros", valor: 20 },
]

const barConfig = {
  monto: { label: "Miles ARS", color: "var(--chart-1)" },
} satisfies ChartConfig

const areaConfig = {
  ingresos: { label: "Ingresos", color: "var(--chart-3)" },
} satisfies ChartConfig

const flowConfig = {
  monto: { label: "Miles ARS", color: "var(--chart-1)" },
} satisfies ChartConfig

const pieColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
]

const chartAxisMono =
  "[&_.recharts-cartesian-axis-tick_text]:font-numeric [&_.recharts-cartesian-axis-tick_text]:tabular-nums"

export function LayoutPreviewReportsDashboard() {
  return (
    <div className="relative flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Ventas 7 días",
            value: "$ 482.300",
            hint: "vs. semana anterior",
            delta: "+8,2%",
            up: true,
          },
          {
            label: "Ticket promedio",
            value: "$ 12.840",
            hint: "últimos 30 días",
            delta: "+1,4%",
            up: true,
          },
          {
            label: "Facturas emitidas",
            value: "186",
            hint: "mes en curso",
            delta: "−3,1%",
            up: false,
          },
          {
            label: "Margen bruto",
            value: "34,6 %",
            hint: "estimado",
            delta: "+0,6 pp",
            up: true,
          },
        ].map((k) => (
          <div
            key={k.label}
            className={cn(shellCard, "px-4 py-3")}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {k.label}
            </p>
            <p className="mt-1 font-numeric text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {k.value}
            </p>
            <div className="mt-2 flex items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground">{k.hint}</span>
              <span
                className={cn(
                  "font-numeric font-medium tabular-nums",
                  k.up ? "text-emerald-600" : "text-amber-700",
                )}
              >
                {k.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className={cn(shellCard, "p-4 lg:col-span-3")}>
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Ventas por día
            </h3>
            <span className="text-[11px] text-muted-foreground">
              Miles ARS · demo
            </span>
          </div>
          <ChartContainer
            config={barConfig}
            className={cn("aspect-21/9 min-h-[200px] w-full", chartAxisMono)}
          >
            <BarChart data={SALES_BY_DAY} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="dia" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={36}
                tickFormatter={(v) => `${v}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="monto"
                fill="var(--color-monto)"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ChartContainer>
        </div>

        <div className={cn(shellCard, "p-4 lg:col-span-2")}>
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-foreground">
              Rubros
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Distribución del período
            </p>
          </div>
          <ChartContainer
            config={{}}
            className={cn("aspect-square max-h-[220px] w-full", chartAxisMono)}
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={CATEGORY_SHARE}
                dataKey="valor"
                nameKey="rubro"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={2}
              >
                {CATEGORY_SHARE.map((c, i) => (
                  <Cell key={c.rubro} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <ul className="mt-2 grid gap-1 text-[11px] text-muted-foreground">
            {CATEGORY_SHARE.map((c, i) => (
              <li key={c.rubro} className="flex justify-between gap-2">
                <span className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-sm"
                    style={{ backgroundColor: pieColors[i % pieColors.length] }}
                  />
                  {c.rubro}
                </span>
                <span className="font-numeric font-medium tabular-nums text-foreground">
                  {c.valor}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={cn(shellCard, "p-4")}>
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            Tendencia de ingresos
          </h3>
          <span className="text-[11px] text-muted-foreground">
            Miles ARS · últimos 6 meses
          </span>
        </div>
        <ChartContainer
          config={areaConfig}
          className={cn("aspect-21/8 min-h-[180px] w-full", chartAxisMono)}
        >
          <AreaChart data={REVENUE_TREND} margin={{ left: 0, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="fillIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="mes" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={36} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="ingresos"
              stroke="var(--color-ingresos)"
              fill="url(#fillIngresos)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  )
}

const SUMMARY_KPIS = [
  { label: "Saldo proyectado", value: "$ 1,24 M", sub: "fin de mes" },
  { label: "Órdenes abiertas", value: "14", sub: "requieren acción" },
  { label: "Cobranzas hoy", value: "$ 38.200", sub: "3 comprobantes" },
]

const GOALS = [
  { name: "Ventas vs. objetivo", pct: 78 },
  { name: "Stock crítico resuelto", pct: 62 },
  { name: "Facturas timbradas", pct: 91 },
]

export function LayoutPreviewSummaryDashboard() {
  return (
    <div className="relative flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        {SUMMARY_KPIS.map((k) => (
          <div
            key={k.label}
            className={cn(shellCard, "px-5 py-4")}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {k.label}
            </p>
            <p className="mt-2 font-numeric text-3xl font-bold tabular-nums tracking-tight text-foreground">
              {k.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {k.label === "Cobranzas hoy" ? (
                <>
                  <span className="tabular-nums">3</span> comprobantes
                </>
              ) : (
                k.sub
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cn(shellCard, "p-5")}>
          <h3 className="text-sm font-semibold text-foreground">
            Flujo semanal
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Ingresos netos · miles ARS
          </p>
          <ChartContainer
            config={flowConfig}
            className={cn("mt-4 aspect-video min-h-[200px] w-full", chartAxisMono)}
          >
            <AreaChart data={SALES_BY_DAY} margin={{ left: 0, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="fillWeek" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="dia" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="monto"
                stroke="var(--color-monto)"
                fill="url(#fillWeek)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className={cn(shellCard, "flex flex-col p-5")}>
          <h3 className="text-sm font-semibold text-foreground">
            Objetivos
          </h3>
          <p className="text-[11px] text-muted-foreground">Avance · demo</p>
          <ul className="mt-5 flex flex-1 flex-col justify-center gap-5">
            {GOALS.map((g) => (
              <li key={g.name}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-foreground">{g.name}</span>
                  <span className="font-numeric font-medium tabular-nums text-primary">
                    {g.pct}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted/80">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${g.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
