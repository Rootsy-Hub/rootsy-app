"use client"

import type {
  StatisticsRankRow,
  StatisticsSectionData,
} from "@/app/[siteId]/[popId]/statistics/actions"
import { StatisticsCostDistributionChart } from "@/components/statistics/StatisticsCostDistributionChart"
import { StatisticsRankTable } from "@/components/statistics/StatisticsRankTable"
import {
  StatisticsTrendDetailPanel,
} from "@/components/statistics/StatisticsTrendDetailPanel"
import { useCallback, useEffect, useRef, useState } from "react"

export const STATISTICS_PRODUCT_TREND_PANEL_ID = "statistics-product-trend-panel"
export const STATISTICS_CATEGORY_TREND_PANEL_ID = "statistics-category-trend-panel"

type Props = {
  data: StatisticsSectionData | null
  loading?: boolean
}

export function StatisticsProductsSectionBlock({ data, loading }: Props) {
  const sectionData = data?.sectionId === "products" ? data : null
  const productTrendPanelRef = useRef<HTMLElement>(null)
  const categoryTrendPanelRef = useRef<HTMLElement>(null)
  const [selectedProductKey, setSelectedProductKey] = useState<string | null>(null)
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(
    null,
  )

  useEffect(() => {
    if (!sectionData) return
    setSelectedProductKey(sectionData.defaultProductTrendKey ?? null)
  }, [sectionData?.defaultProductTrendKey, sectionData?.sectionId])

  useEffect(() => {
    if (!sectionData) return
    setSelectedCategoryKey(sectionData.defaultCategoryTrendKey ?? null)
  }, [sectionData?.defaultCategoryTrendKey, sectionData?.sectionId])

  const selectProduct = useCallback((key: string, label: string) => {
    setSelectedProductKey(key)
    requestAnimationFrame(() => {
      productTrendPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })
  }, [])

  const handleRankSelect = useCallback(
    (row: StatisticsRankRow) => {
      if (!row.id) return
      selectProduct(row.id, row.label)
    },
    [selectProduct],
  )

  const selectCategory = useCallback((key: string, _label: string) => {
    setSelectedCategoryKey(key)
    requestAnimationFrame(() => {
      categoryTrendPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })
  }, [])

  return (
    <>
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <section>
          <StatisticsRankTable
            title="Top productos por ganancia"
            description="Los 10 productos con mayor ganancia bruta en el período"
            rows={sectionData?.rankings ?? []}
            loading={loading}
            valueFormat="money"
            className="flex h-full min-h-0 flex-col lg:min-h-[420px]"
            scrollableList
            selectedRowId={selectedProductKey}
            onRowSelect={handleRankSelect}
          />
        </section>
        <section>
          <StatisticsRankTable
            title="Top productos por porcentaje de ventas"
            description="Los 10 productos que más explican las ventas del período"
            rows={sectionData?.productSalesRankings ?? []}
            loading={loading}
            valueFormat="percent"
            className="flex h-full min-h-0 flex-col lg:min-h-[420px]"
            scrollableList
            selectedRowId={selectedProductKey}
            onRowSelect={handleRankSelect}
          />
        </section>
      </div>

      <StatisticsTrendDetailPanel
        panelId={STATISTICS_PRODUCT_TREND_PANEL_ID}
        panelRef={productTrendPanelRef}
        title="Detalle de tendencia del producto"
        description="Cantidad, importe y ganancia por día operativo"
        searchLabel="Buscar producto"
        searchPlaceholder="Buscar producto…"
        options={sectionData?.productTrendOptions ?? []}
        trendByKey={sectionData?.productTrendByKey ?? {}}
        defaultKey={sectionData?.defaultProductTrendKey ?? null}
        loading={loading}
        emptyMessage="Sin ventas diarias para este producto en el período"
        emptyNoSelectionMessage="Elegí un producto para ver su tendencia"
        selectedKey={selectedProductKey}
        onSelectedKeyChange={(key) => setSelectedProductKey(key)}
      />

      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <section className="flex min-h-0 h-full">
          <StatisticsCostDistributionChart
            title="Categorías por ganancia"
            description="Participación de cada categoría en la ganancia bruta"
            segments={sectionData?.categoryProfitDistribution ?? []}
            loading={loading}
            emptyMessage="Sin ganancia por categoría en este período"
            externalLabelShowsAmount
            selectedSegmentId={selectedCategoryKey}
            onSegmentSelect={selectCategory}
          />
        </section>
        <section className="flex min-h-0 h-full">
          <StatisticsCostDistributionChart
            title="Categorías por ventas"
            description="Participación de cada categoría en las ventas"
            segments={sectionData?.categorySalesDistribution ?? []}
            loading={loading}
            emptyMessage="Sin ventas por categoría en este período"
            externalLabelShowsAmount
            selectedSegmentId={selectedCategoryKey}
            onSegmentSelect={selectCategory}
          />
        </section>
      </div>

      <StatisticsTrendDetailPanel
        panelId={STATISTICS_CATEGORY_TREND_PANEL_ID}
        panelRef={categoryTrendPanelRef}
        title="Detalle de tendencia de la categoría"
        description="Cantidad, importe y ganancia por día operativo"
        searchLabel="Buscar categoría"
        searchPlaceholder="Buscar categoría…"
        options={sectionData?.categoryTrendOptions ?? []}
        trendByKey={sectionData?.categoryTrendByKey ?? {}}
        defaultKey={sectionData?.defaultCategoryTrendKey ?? null}
        loading={loading}
        emptyMessage="Sin ventas diarias para esta categoría en el período"
        emptyNoSelectionMessage="Elegí una categoría para ver su tendencia"
        selectedKey={selectedCategoryKey}
        onSelectedKeyChange={(key) => setSelectedCategoryKey(key)}
      />
    </>
  )
}
