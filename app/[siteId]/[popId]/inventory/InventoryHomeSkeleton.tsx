"use client"

import type { InventoryClearingId } from "@/app/[siteId]/[popId]/inventory/workspaceUrl"
import { InventoryOnHandKpi } from "@/app/[siteId]/[popId]/inventory/InventoryOnHandKpi"
import { formatInventoryMoneyShort } from "@/app/[siteId]/[popId]/inventory/inventoryFormat"
import { DataWorkspaceBlocksSection } from "@/components/data-workspace/DataWorkspaceBlocksSection"
import {
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
  dataWorkspaceEntityCardStatValueLargeClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { ReportHubCard, reportHubGridClass } from "@/components/reports/ReportHubCard"
import { cn } from "@/lib/utils"
import type { InventoryUnitStock } from "@/app/[siteId]/[popId]/inventory/actions"
import {
  ArrowRightLeft,
  ClipboardList,
  Layers,
  Package,
  ShoppingCart,
  Sparkles,
  Timer,
  TriangleAlert,
  Warehouse,
} from "lucide-react"

type InventoryHomeMetrics = {
  inventoryValue: number
  articlesWithStock: number
  articleCount: number
  redCount: number
  overstockCount: number
  purchaseCount: number
  unitsByMeasure: InventoryUnitStock[]
}

type InventoryHomeExpiry = {
  expiredCount: number
  soonCount: number
  total: number
}

export function InventoryKpiCard({
  eyebrow,
  value,
  hint,
}: {
  eyebrow: string
  value: string
  hint: string
}) {
  return (
    <div className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "p-5")}>
      <p className={dataWorkspaceEntityCardEyebrowClass}>{eyebrow}</p>
      <p className={cn(dataWorkspaceEntityCardStatValueLargeClass, "mt-3")}>
        {value}
      </p>
      <p className="mt-2 font-canopy text-xs leading-relaxed text-[var(--rootsy-bruma-500)]">
        {hint}
      </p>
    </div>
  )
}

export function InventoryHomeHub({
  metrics,
  locationsCount,
  expiry,
  onSelectClearing,
  onTransfer,
}: {
  metrics: InventoryHomeMetrics
  locationsCount: number
  expiry: InventoryHomeExpiry
  onSelectClearing?: (id: Exclude<InventoryClearingId, "home">) => void
  onTransfer?: () => void
}) {
  const select = (id: Exclude<InventoryClearingId, "home">) => {
    onSelectClearing?.(id)
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-4 md:grid-cols-3">
        <InventoryKpiCard
          eyebrow="Lo que vale"
          value={formatInventoryMoneyShort(metrics.inventoryValue)}
          hint={
            metrics.articlesWithStock === 1
              ? "1 artículo con valor"
              : `${metrics.articlesWithStock} artículos valorizados`
          }
        />
        <InventoryOnHandKpi
          units={metrics.unitsByMeasure}
          articleCount={metrics.articleCount}
        />
        <InventoryKpiCard
          eyebrow="Lo que pide"
          value={String(metrics.redCount)}
          hint={
            metrics.redCount === 0
              ? "Nada en falta"
              : metrics.redCount === 1
                ? "1 artículo pide reposición"
                : `${metrics.redCount} piden reposición`
          }
        />
      </section>

      <DataWorkspaceBlocksSection
        title="Por dónde empezar"
        description="Listas cortas. Un sendero cada vez."
      >
        <div className={reportHubGridClass}>
          <ReportHubCard
            title="En rojo"
            description={
              metrics.redCount === 0
                ? "Nada en falta"
                : `${metrics.redCount} piden reposición`
            }
            icon={TriangleAlert}
            onSelect={() => select("red")}
          />
          <ReportHubCard
            title="Sobre stock"
            description={
              metrics.overstockCount === 0
                ? "Sin excedente"
                : `${metrics.overstockCount} por encima del techo`
            }
            icon={Package}
            onSelect={() => select("overstock")}
          />
          <ReportHubCard
            title="Para comprar"
            description={
              metrics.purchaseCount === 0
                ? "Nada para reponer"
                : `${metrics.purchaseCount} para la lista`
            }
            icon={ShoppingCart}
            onSelect={() => select("purchase")}
          />
          <ReportHubCard
            title="Despensa"
            description="El stock de este punto"
            icon={Warehouse}
            onSelect={() => select("pantry")}
          />
          <ReportHubCard
            title="Recomendaciones"
            description="Mínimos sugeridos según las ventas"
            icon={Sparkles}
            onSelect={() => select("recommend")}
          />
          <ReportHubCard
            title="Movimientos"
            description="Entradas y salidas recientes"
            icon={ClipboardList}
            onSelect={() => select("movements")}
          />
          <ReportHubCard
            title="Libro"
            description="Capas FIFO e imputaciones"
            icon={Layers}
            onSelect={() => select("ledger")}
          />
          <ReportHubCard
            title="Más depósitos"
            description={
              locationsCount === 1
                ? "Una despensa. Podés sumar otra."
                : `${locationsCount} depósitos en este punto`
            }
            icon={Warehouse}
            onSelect={() => select("locations")}
          />
          <ReportHubCard
            title="Traslados"
            description="Mover stock de un depósito a otro"
            icon={ArrowRightLeft}
            onSelect={() => onTransfer?.()}
          />
          <ReportHubCard
            title="Vencimientos"
            description={
              expiry.total === 0
                ? "Nada vence en los próximos 30 días"
                : expiry.expiredCount > 0 && expiry.soonCount > 0
                  ? `${expiry.expiredCount} vencidos · ${expiry.soonCount} por vencer`
                  : expiry.expiredCount > 0
                    ? `${expiry.expiredCount} vencidos`
                    : `${expiry.soonCount} por vencer`
            }
            icon={Timer}
            onSelect={() => select("expiry")}
          />
        </div>
      </DataWorkspaceBlocksSection>
    </div>
  )
}

const EMPTY_HOME_METRICS: InventoryHomeMetrics = {
  inventoryValue: 0,
  articlesWithStock: 0,
  articleCount: 0,
  redCount: 0,
  overstockCount: 0,
  purchaseCount: 0,
  unitsByMeasure: [],
}

export function InventoryHomeSkeleton() {
  return (
    <InventoryHomeHub
      metrics={EMPTY_HOME_METRICS}
      locationsCount={0}
      expiry={{ expiredCount: 0, soonCount: 0, total: 0 }}
    />
  )
}
