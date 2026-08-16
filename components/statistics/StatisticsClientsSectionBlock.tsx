"use client"

import type { StatisticsSectionData } from "@/app/[siteId]/[popId]/statistics/actions"
import { StatisticsRankTable } from "@/components/statistics/StatisticsRankTable"
import { StatisticsTrendDetailPanel } from "@/components/statistics/StatisticsTrendDetailPanel"
import { useEffect, useMemo, useRef, useState } from "react"

export const STATISTICS_CLIENT_TREND_PANEL_ID = "statistics-client-trend-panel"

type Props = {
  data: StatisticsSectionData | null
  loading?: boolean
}

export function StatisticsClientsSectionBlock({ data, loading }: Props) {
  const sectionData = data?.sectionId === "clients" ? data : null
  const trendPanelRef = useRef<HTMLElement>(null)
  const [selectedClientKey, setSelectedClientKey] = useState<string | null>(null)

  useEffect(() => {
    if (!sectionData) return
    setSelectedClientKey(sectionData.defaultClientTrendKey ?? null)
  }, [sectionData?.defaultClientTrendKey, sectionData?.sectionId])

  const topArticles = useMemo(() => {
    if (!selectedClientKey || !sectionData?.clientTopArticlesByKey) return []
    return sectionData.clientTopArticlesByKey[selectedClientKey] ?? []
  }, [sectionData?.clientTopArticlesByKey, selectedClientKey])

  const topCategories = useMemo(() => {
    if (!selectedClientKey || !sectionData?.clientTopCategoriesByKey) return []
    return sectionData.clientTopCategoriesByKey[selectedClientKey] ?? []
  }, [sectionData?.clientTopCategoriesByKey, selectedClientKey])

  const selectedClientLabel = useMemo(() => {
    if (!selectedClientKey) return null
    return (
      sectionData?.clientTrendOptions?.find(
        (option) => option.key === selectedClientKey,
      )?.label ?? null
    )
  }, [sectionData?.clientTrendOptions, selectedClientKey])

  return (
    <>
      <StatisticsTrendDetailPanel
        panelId={STATISTICS_CLIENT_TREND_PANEL_ID}
        panelRef={trendPanelRef}
        title="Evolución diaria"
        description="Ventas al cliente por día operativo en el período"
        searchLabel="Cliente"
        searchPlaceholder="Buscar cliente…"
        options={sectionData?.clientTrendOptions ?? []}
        trendByKey={sectionData?.clientTrendByKey ?? {}}
        defaultKey={sectionData?.defaultClientTrendKey ?? null}
        loading={loading}
        emptyMessage="Sin ventas a este cliente en el período"
        emptyNoSelectionMessage="Seleccioná un cliente para ver su evolución"
        selectedKey={selectedClientKey}
        onSelectedKeyChange={(key) => setSelectedClientKey(key)}
        dualSeries={{
          primaryLabel: "Importe",
          secondaryLabel: "Cantidad de ventas",
          secondaryFormat: "number",
        }}
      />

      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <section>
          <StatisticsRankTable
            title="Artículos más vendidos al cliente"
            description={
              selectedClientLabel
                ? `Top 10 para ${selectedClientLabel}`
                : "Seleccioná un cliente arriba para ver sus artículos"
            }
            rows={topArticles}
            loading={loading && Boolean(selectedClientKey)}
            valueFormat="number"
            className="h-full"
            scrollableList
          />
        </section>
        <section>
          <StatisticsRankTable
            title="Categorías más vendidas al cliente"
            description={
              selectedClientLabel
                ? `Top 10 para ${selectedClientLabel}`
                : "Seleccioná un cliente arriba para ver sus categorías"
            }
            rows={topCategories}
            loading={loading && Boolean(selectedClientKey)}
            valueFormat="number"
            className="h-full"
            scrollableList
          />
        </section>
      </div>
    </>
  )
}
