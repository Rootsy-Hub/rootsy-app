"use client"

import { getSummaryDashboardData } from "@/app/[siteId]/[popId]/summary/actions"
import { SummaryAlertsSection } from "@/components/summary/SummaryAlertsSection"
import { SummaryChartsSection } from "@/components/summary/SummaryChartsSection"
import {
  SummaryKpiCard,
  SummaryMetricTile,
  SummarySectionHeading,
} from "@/components/summary/SummaryKpiCard"
import { SummaryPeriodToolbar } from "@/components/summary/SummaryPeriodToolbar"
import {
  computeSummaryDateBounds,
  type SummaryDatePreset,
} from "@/lib/summaryDateFilter"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"
import type { SummaryDashboardData } from "@/app/[siteId]/[popId]/summary/actions"

type Props = {
  popId: string
  enabledModuleKeys: string[]
}

export function SummaryDashboardView({ popId, enabledModuleKeys }: Props) {
  const [preset, setPreset] = useState<SummaryDatePreset>("this_month")
  const [customRange, setCustomRange] = useState<DateRange | undefined>(
    undefined,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SummaryDashboardData | null>(null)

  const bounds = useMemo(
    () => computeSummaryDateBounds(preset, customRange),
    [preset, customRange],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getSummaryDashboardData({
      popId,
      preset,
      from: bounds.from,
      to: bounds.to,
      enabledModuleKeys,
    })
    if (!res.success) {
      setError(res.error)
      setData(null)
    } else {
      setData(res.data)
    }
    setLoading(false)
  }, [popId, preset, bounds.from, bounds.to, enabledModuleKeys])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="flex flex-col gap-6">
      <SummaryPeriodToolbar
        preset={preset}
        customRange={customRange}
        onPresetChange={setPreset}
        onCustomRangeChange={setCustomRange}
        bounds={bounds}
      />

      {error ? (
        <p className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </p>
      ) : null}

      <section>
        <SummarySectionHeading
          title="Resultado del período"
          description="Rendimiento estimado del negocio en el período seleccionado"
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryKpiCard
            label="Ventas"
            metric={data?.periodResults.ventas ?? { value: 0, deltaPercent: null }}
            loading={loading}
          />
          <SummaryKpiCard
            label="Costo de ventas"
            metric={data?.periodResults.costoVentas ?? { value: 0, deltaPercent: null }}
            loading={loading}
          />
          <SummaryKpiCard
            label="Ganancia bruta"
            metric={data?.periodResults.gananciaBruta ?? { value: 0, deltaPercent: null }}
            loading={loading}
          />
          <SummaryKpiCard
            label="Gastos"
            metric={data?.periodResults.gastos ?? { value: 0, deltaPercent: null }}
            loading={loading}
          />
          <SummaryKpiCard
            label="Resultado"
            metric={data?.periodResults.resultado ?? { value: 0, deltaPercent: null }}
            loading={loading}
            emphasize
          />
        </div>
      </section>

      <section>
        <SummarySectionHeading
          title="Actividad"
          description="Movimiento operativo en cantidades"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {(loading
            ? Array.from({ length: 5 }).map((_, i) => ({
                label: "—",
                value: "—",
                key: `sk-${i}`,
              }))
            : (data?.activity ?? []).map((item) => ({
                ...item,
                key: item.label,
              }))
          ).map((item) => (
            <SummaryMetricTile
              key={item.key}
              label={item.label}
              value={item.value}
              loading={loading}
              formatAsMoney={
                item.label === "Ticket promedio" || item.label === "Compras"
              }
            />
          ))}
        </div>
      </section>

      <section>
        <SummarySectionHeading
          title="Situación financiera del período"
          description="Saldos al cierre del período seleccionado"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {(loading
            ? Array.from({ length: 5 }).map((_, i) => ({
                label: "—",
                value: "—",
                key: `fin-${i}`,
              }))
            : (data?.financial ?? []).map((item) => ({
                ...item,
                key: item.label,
              }))
          ).map((item) => (
            <SummaryMetricTile
              key={item.key}
              label={item.label}
              value={
                "hint" in item && item.hint && item.hint !== "—"
                  ? `${item.value} · ${item.hint}`
                  : item.value
              }
              loading={loading}
              formatAsMoney={
                item.label !== "Cheques pendientes" &&
                (item.label.includes("Cajas") ||
                  item.label.includes("Bancos") ||
                  item.label.includes("cobrar") ||
                  item.label.includes("pagar"))
              }
            />
          ))}
        </div>
      </section>

      <section>
        <SummarySectionHeading
          title="Estado del stock del período"
          description="Inventario al cierre del período seleccionado"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(loading
            ? Array.from({ length: 4 }).map((_, i) => ({
                label: "—",
                value: "—",
                key: `stk-${i}`,
              }))
            : (data?.stock ?? []).map((item) => ({
                ...item,
                key: item.label,
              }))
          ).map((item) => (
            <SummaryMetricTile
              key={item.key}
              label={item.label}
              value={item.value}
              loading={loading}
              formatAsMoney={item.label === "Valor del stock"}
            />
          ))}
        </div>
      </section>

      <section>
        <SummarySectionHeading title="Gráficos rápidos" />
        <SummaryChartsSection
          salesChart={data?.salesChart ?? []}
          channelShares={data?.channelShares ?? null}
          loading={loading}
        />
      </section>

      <SummaryAlertsSection alerts={data?.alerts ?? []} loading={loading} />
    </div>
  )
}
