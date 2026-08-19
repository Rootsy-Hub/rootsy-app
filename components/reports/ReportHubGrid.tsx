"use client"

import { DataWorkspaceBlocksSection } from "@/components/data-workspace/DataWorkspaceBlocksSection"
import { dataWorkspaceBlocksEmptyStateClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { ReportHubCard, reportHubGridClass } from "@/components/reports/ReportHubCard"
import { RootsFormSegmentField } from "@/components/rootsy-form"
import {
  flattenReportCatalog,
  REPORT_CATALOG,
  supportsInlineReportDetail,
  type ReportHubCategoryFilter,
  type ReportCatalogItem,
} from "@/lib/reportsCatalog"
import { useMemo, useState } from "react"

const REPORT_HUB_FILTER_OPTIONS = [
  { value: "all", label: "Todos" },
  ...REPORT_CATALOG.map((category) => ({
    value: category.id,
    label: category.title,
  })),
] as const

type Props = {
  selectedReportId: string | null
  onSelectReport: (reportId: string) => void
  buildItemHref: (item: ReportCatalogItem) => string
}

export function ReportHubGrid({
  selectedReportId,
  onSelectReport,
  buildItemHref,
}: Props) {
  const [activeCategoryId, setActiveCategoryId] =
    useState<ReportHubCategoryFilter>("all")
  const entries = useMemo(() => {
    const all = flattenReportCatalog()
    if (activeCategoryId === "all") return all
    return all.filter((entry) => entry.categoryId === activeCategoryId)
  }, [activeCategoryId])

  return (
    <DataWorkspaceBlocksSection>
      <RootsFormSegmentField
        label="Ver reportes"
        aria-label="Filtrar reportes"
        layout="inline"
        className="[&>span:first-child]:sr-only"
        groupClassName="border-0"
        value={activeCategoryId}
        onValueChange={(value) =>
          setActiveCategoryId(value as ReportHubCategoryFilter)
        }
        options={REPORT_HUB_FILTER_OPTIONS}
      />

      {entries.length === 0 ? (
        <p className={dataWorkspaceBlocksEmptyStateClass}>
          No hay reportes en esta categoría.
        </p>
      ) : (
        <div className={reportHubGridClass}>
          {entries.map((entry) => {
            const inline = supportsInlineReportDetail(entry.id)
            if (entry.planned) {
              return (
                <ReportHubCard
                  key={entry.id}
                  title={entry.title}
                  description={entry.description}
                  icon={entry.icon}
                  planned
                />
              )
            }
            return (
              <ReportHubCard
                key={entry.id}
                title={entry.title}
                description={entry.description}
                icon={entry.icon}
                selected={selectedReportId === entry.id}
                {...(inline
                  ? { onSelect: () => onSelectReport(entry.id) }
                  : { href: buildItemHref(entry) })}
              />
            )
          })}
        </div>
      )}
    </DataWorkspaceBlocksSection>
  )
}
