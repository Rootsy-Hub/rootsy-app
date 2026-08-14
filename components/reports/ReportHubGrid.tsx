"use client"

import { ReportHubCard, reportHubGridClass } from "@/components/reports/ReportHubCard"
import { ReportHubCategoryLegend } from "@/components/reports/ReportHubCategoryLegend"
import {
  flattenReportCatalog,
  supportsInlineReportDetail,
  type ReportHubCategoryFilter,
  type ReportCatalogItem,
} from "@/lib/reportsCatalog"
import { useState } from "react"

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
    useState<ReportHubCategoryFilter>("operativo")
  const entries = flattenReportCatalog()
  const showAllCategories = activeCategoryId === "all"

  return (
    <div className="space-y-1">
      <ReportHubCategoryLegend
        selectedCategoryId={activeCategoryId}
        onSelectCategory={setActiveCategoryId}
      />
      <div className={reportHubGridClass}>
        {entries.map((entry) => {
          const inline = supportsInlineReportDetail(entry.id)
          const categoryActive =
            showAllCategories || entry.categoryId === activeCategoryId
          if (entry.planned) {
            return (
              <ReportHubCard
                key={entry.id}
                title={entry.title}
                description={entry.description}
                icon={entry.icon}
                categoryId={entry.categoryId}
                categoryActive={categoryActive}
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
              categoryId={entry.categoryId}
              categoryActive={categoryActive}
              selected={selectedReportId === entry.id}
              {...(inline
                ? { onSelect: () => onSelectReport(entry.id) }
                : { href: buildItemHref(entry) })}
            />
          )
        })}
      </div>
    </div>
  )
}
