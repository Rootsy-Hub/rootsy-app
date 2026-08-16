"use client"

import type { StatisticsSectionData } from "@/app/[siteId]/[popId]/statistics/actions"
import { StatisticsRankTable } from "@/components/statistics/StatisticsRankTable"
import { StatisticsTrendDetailPanel } from "@/components/statistics/StatisticsTrendDetailPanel"
import { useEffect, useMemo, useRef, useState } from "react"

export const STATISTICS_SUPPLIER_TREND_PANEL_ID = "statistics-supplier-trend-panel"

type Props = {
  data: StatisticsSectionData | null
  loading?: boolean
}

export function StatisticsSuppliersSectionBlock({ data, loading }: Props) {
  const sectionData = data?.sectionId === "suppliers" ? data : null
  const trendPanelRef = useRef<HTMLElement>(null)
  const [selectedSupplierKey, setSelectedSupplierKey] = useState<string | null>(
    null,
  )

  useEffect(() => {
    if (!sectionData) return
    setSelectedSupplierKey(sectionData.defaultSupplierTrendKey ?? null)
  }, [sectionData?.defaultSupplierTrendKey, sectionData?.sectionId])

  const topArticles = useMemo(() => {
    if (!selectedSupplierKey || !sectionData?.supplierTopArticlesByKey) return []
    return sectionData.supplierTopArticlesByKey[selectedSupplierKey] ?? []
  }, [sectionData?.supplierTopArticlesByKey, selectedSupplierKey])

  const topCategories = useMemo(() => {
    if (!selectedSupplierKey || !sectionData?.supplierTopCategoriesByKey) {
      return []
    }
    return sectionData.supplierTopCategoriesByKey[selectedSupplierKey] ?? []
  }, [sectionData?.supplierTopCategoriesByKey, selectedSupplierKey])

  const selectedSupplierLabel = useMemo(() => {
    if (!selectedSupplierKey) return null
    return (
      sectionData?.supplierTrendOptions?.find(
        (option) => option.key === selectedSupplierKey,
      )?.label ?? null
    )
  }, [sectionData?.supplierTrendOptions, selectedSupplierKey])

  return (
    <>
      <StatisticsTrendDetailPanel
        panelId={STATISTICS_SUPPLIER_TREND_PANEL_ID}
        panelRef={trendPanelRef}
        title="Evolución diaria"
        description="Compras al proveedor por día operativo en el período"
        searchLabel="Proveedor"
        searchPlaceholder="Buscar proveedor…"
        options={sectionData?.supplierTrendOptions ?? []}
        trendByKey={sectionData?.supplierTrendByKey ?? {}}
        defaultKey={sectionData?.defaultSupplierTrendKey ?? null}
        loading={loading}
        emptyMessage="Sin compras a este proveedor en el período"
        emptyNoSelectionMessage="Seleccioná un proveedor para ver su evolución"
        selectedKey={selectedSupplierKey}
        onSelectedKeyChange={(key) => setSelectedSupplierKey(key)}
        dualSeries={{
          primaryLabel: "Importe",
          secondaryLabel: "Cantidad de compras",
          secondaryFormat: "number",
        }}
      />

      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <section>
          <StatisticsRankTable
            title="Artículos más comprados al proveedor"
            description={
              selectedSupplierLabel
                ? `Top 10 para ${selectedSupplierLabel}`
                : "Seleccioná un proveedor arriba para ver sus artículos"
            }
            rows={topArticles}
            loading={loading && Boolean(selectedSupplierKey)}
            valueFormat="number"
            className="h-full"
            scrollableList
          />
        </section>
        <section>
          <StatisticsRankTable
            title="Categorías más compradas al proveedor"
            description={
              selectedSupplierLabel
                ? `Top 10 para ${selectedSupplierLabel}`
                : "Seleccioná un proveedor arriba para ver sus categorías"
            }
            rows={topCategories}
            loading={loading && Boolean(selectedSupplierKey)}
            valueFormat="number"
            className="h-full"
            scrollableList
          />
        </section>
      </div>
    </>
  )
}
