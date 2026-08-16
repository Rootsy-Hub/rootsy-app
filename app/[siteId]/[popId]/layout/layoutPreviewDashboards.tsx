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

export function LayoutPreviewSummaryDashboard() {
  const demoPeriodResults = [
    { label: "Ventas", value: "$ 1.250.000", delta: "+8,2%", up: true },
    { label: "Costo de ventas", value: "$ 480.000", delta: "+3,1%", up: false },
    { label: "Ganancia bruta", value: "$ 770.000", delta: "+11,4%", up: true },
    { label: "Gastos", value: "$ 230.000", delta: "−2,0%", up: false },
    { label: "Resultado", value: "$ 540.000", delta: "+15,3%", up: true, emphasize: true },
  ]

  const demoActivity = [
    { label: "Ventas realizadas", value: "327" },
    { label: "Ticket promedio", value: "$ 3.823" },
    { label: "Compras realizadas", value: "42" },
    { label: "Compras", value: "$ 380.000" },
    { label: "Gastos registrados", value: "27" },
  ]

  const demoFinancial = [
    { label: "Cajas", value: "$ 425.000" },
    { label: "Cuentas / Bancos", value: "$ 2.150.000" },
    { label: "Por cobrar", value: "$ 185.000" },
    { label: "Por pagar", value: "$ 240.000" },
    { label: "Cheques pendientes", value: "$ 580.000 · 7" },
  ]

  const demoStock = [
    { label: "Valor del stock", value: "$ 8.450.000" },
    { label: "Stock bajo", value: "18" },
    { label: "Sin stock", value: "7" },
    { label: "Próximos a vencer", value: "12" },
  ]

  return (
    <div className="relative flex flex-col gap-6">
      <div className={cn(shellCard, "flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5")}>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Período
          </p>
          <p className="mt-0.5 text-sm font-medium text-foreground">Este mes</p>
        </div>
        <span className="rounded-lg border border-border/80 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
          Hoy · Ayer · Esta semana · Este mes · Este año · Personalizado
        </span>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Resultado del período
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {demoPeriodResults.map((k) => (
            <div
              key={k.label}
              className={cn(
                shellCard,
                "px-5 py-4",
                k.emphasize && "ring-1 ring-primary/25",
              )}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {k.label}
              </p>
              <p className="mt-1 font-numeric text-2xl font-bold tabular-nums tracking-tight text-foreground">
                {k.value}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                <span
                  className={cn(
                    "font-numeric font-medium tabular-nums",
                    k.up ? "text-emerald-600" : "text-amber-700",
                  )}
                >
                  {k.delta}
                </span>{" "}
                vs. período anterior
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Actividad</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {demoActivity.map((k) => (
            <div key={k.label} className={cn(shellCard, "px-4 py-3")}>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {k.label}
              </p>
              <p className="mt-1 font-numeric text-2xl font-semibold tabular-nums text-foreground">
                {k.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Situación financiera actual
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {demoFinancial.map((k) => (
            <div key={k.label} className={cn(shellCard, "px-4 py-3")}>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {k.label}
              </p>
              <p className="mt-1 font-numeric text-2xl font-semibold tabular-nums text-foreground">
                {k.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Estado del stock
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {demoStock.map((k) => (
            <div key={k.label} className={cn(shellCard, "px-4 py-3")}>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {k.label}
              </p>
              <p className="mt-1 font-numeric text-2xl font-semibold tabular-nums text-foreground">
                {k.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className={cn(shellCard, "p-4 lg:col-span-3")}>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Evolución de ventas
          </h3>
          <ChartContainer
            config={areaConfig}
            className={cn("aspect-21/9 min-h-[200px] w-full", chartAxisMono)}
          >
            <AreaChart data={SALES_BY_DAY} margin={{ left: 0, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="fillSummaryVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="dia" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={36} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="monto"
                stroke="var(--color-monto)"
                fill="url(#fillSummaryVentas)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className={cn(shellCard, "p-4 lg:col-span-2")}>
          <h3 className="text-sm font-semibold text-foreground">
            Ingresos vs. egresos
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Mostrador 45% · Mesas 35% · Servicios 20%
          </p>
          <ChartContainer
            config={flowConfig}
            className={cn("mt-4 aspect-square max-h-[220px] w-full", chartAxisMono)}
          >
            <BarChart data={SALES_BY_DAY.slice(0, 5)} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="dia" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="monto" fill="var(--color-monto)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  )
}
