"use client"

import {
  getSalesPeriodStats,
  rebuildSalesDailyStats,
} from "@/app/[siteId]/[popId]/operations/salesStatsActions"
import type { SalesPeriodStats } from "@/lib/saleDailyStats"
import { cn } from "@/lib/utils"
import { BarChart3, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

function StatCell({
  label,
  value,
  emphasize = false,
}: {
  label: string
  value: string
  emphasize?: boolean
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border/70 bg-card px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 truncate tabular-nums text-foreground",
          emphasize ? "text-base font-semibold text-primary" : "text-sm font-medium",
        )}
      >
        {value}
      </p>
    </div>
  )
}

export function OperationsSalesStatsSummary({
  popId,
  dateFrom,
  dateTo,
  enabled,
}: {
  popId: string
  dateFrom: string | null
  dateTo: string | null
  enabled: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<SalesPeriodStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !popId || !dateFrom || !dateTo) {
      setStats(null)
      setError(null)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        let res = await getSalesPeriodStats(popId, dateFrom!, dateTo!)
        if (cancelled) return

        if (!res.success) {
          setError(res.error)
          setStats(null)
          return
        }

        if (res.needsRebuild) {
          const rebuilt = await rebuildSalesDailyStats(popId, dateFrom!, dateTo!)
          if (cancelled) return
          if (!rebuilt.success) {
            setError(rebuilt.error)
            setStats(null)
            return
          }
          res = await getSalesPeriodStats(popId, dateFrom!, dateTo!)
          if (cancelled) return
          if (!res.success) {
            setError(res.error)
            setStats(null)
            return
          }
        }

        setStats(res.stats)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [popId, dateFrom, dateTo, enabled])

  if (!enabled || !dateFrom || !dateTo) return null

  return (
    <section className="mb-4 rounded-xl border border-border/60 bg-muted/15 p-4">
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 className="size-4 text-muted-foreground" aria-hidden />
        <h2 className="text-sm font-semibold text-foreground">
          Resumen del período
        </h2>
        {loading ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : stats ? (
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <StatCell label="Ventas" value={String(stats.saleCount)} />
            <StatCell label="Total facturado" value={fmt.format(stats.total)} emphasize />
            <StatCell
              label="Desc. promos"
              value={stats.discountPromotions > 0 ? fmt.format(stats.discountPromotions) : "—"}
            />
            <StatCell
              label="Desc. general"
              value={stats.discountGeneral > 0 ? fmt.format(stats.discountGeneral) : "—"}
            />
          </div>

          {stats.topPromotions.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Top promociones
              </p>
              <ul className="space-y-1 text-sm">
                {stats.topPromotions.map((promo) => (
                  <li
                    key={promo.promotionKey}
                    className="flex items-baseline justify-between gap-3"
                  >
                    <span className="truncate text-foreground">{promo.promotionName}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {fmt.format(promo.revenueAmount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : loading ? null : (
        <p className="text-sm text-muted-foreground">Sin datos en el período.</p>
      )}
    </section>
  )
}
