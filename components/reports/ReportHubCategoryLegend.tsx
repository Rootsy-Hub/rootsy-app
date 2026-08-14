"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  getReportHubCategorySummary,
  REPORT_CATALOG,
  type ReportCatalogCategoryId,
  type ReportHubCategoryFilter,
} from "@/lib/reportsCatalog"
import { getReportHubCategoryStyle } from "@/lib/reportHubCategoryStyles"
import { cn } from "@/lib/utils"

type Props = {
  selectedCategoryId: ReportHubCategoryFilter
  onSelectCategory: (categoryId: ReportHubCategoryFilter) => void
}

const legendTabButtonClass = cn(
  "group/legend inline-flex items-center gap-2 rounded-md px-1.5 py-1",
  "text-sm font-medium transition-[opacity,color,background-color] duration-200",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-500)_35%,transparent)] focus-visible:ring-offset-2",
)

function legendTabStateClass(isActive: boolean) {
  return isActive
    ? "text-[var(--rootsy-bruma-900)]"
    : "text-[var(--rootsy-bruma-400)] opacity-60 hover:opacity-100 hover:text-[var(--rootsy-bruma-800)]"
}

const reportHubCategorySummaryClass =
  "max-w-2xl text-sm leading-relaxed text-[var(--rootsy-bruma-700)] sm:text-[0.9375rem] sm:leading-6"

function CategoryLegendTab({
  categoryId,
  title,
  legendClass,
  isActive,
  onSelect,
}: {
  categoryId: ReportCatalogCategoryId
  title: string
  legendClass: string
  isActive: boolean
  onSelect: () => void
}) {
  const button = (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onSelect}
      className={cn(legendTabButtonClass, legendTabStateClass(isActive))}
    >
      <span
        className={cn(
          "size-2.5 shrink-0 rounded-full transition-opacity duration-200",
          legendClass,
          !isActive && "opacity-35 group-hover/legend:opacity-100",
        )}
        aria-hidden
      />
      {title}
    </button>
  )

  if (isActive) return button

  const summary = getReportHubCategorySummary(categoryId)
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="bottom"
        variant="dark"
        sideOffset={6}
        className="max-w-xs text-left"
      >
        {summary}
      </TooltipContent>
    </Tooltip>
  )
}

export function ReportHubCategoryLegend({
  selectedCategoryId,
  onSelectCategory,
}: Props) {
  const activeSummary = getReportHubCategorySummary(selectedCategoryId)

  return (
    <div className="px-1 pb-5">
      <div
        className="flex flex-wrap items-center gap-x-5 gap-y-2"
        role="tablist"
        aria-label="Categorías de reportes"
      >
        {REPORT_CATALOG.map((category) => {
          const style = getReportHubCategoryStyle(category.id)
          const isActive = selectedCategoryId === category.id
          return (
            <CategoryLegendTab
              key={category.id}
              categoryId={category.id}
              title={category.title}
              legendClass={style.legendClass}
              isActive={isActive}
              onSelect={() => onSelectCategory(category.id)}
            />
          )
        })}
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategoryId === "all"}
          onClick={() => onSelectCategory("all")}
          className={cn(
            legendTabButtonClass,
            legendTabStateClass(selectedCategoryId === "all"),
          )}
        >
          <span
            className={cn(
              "size-2.5 shrink-0 rounded-full bg-[var(--rootsy-bruma-400)] transition-opacity duration-200",
              selectedCategoryId !== "all" &&
                "opacity-35 group-hover/legend:opacity-100",
            )}
            aria-hidden
          />
          Todos
        </button>
      </div>
      <p
        className={cn(reportHubCategorySummaryClass, "mt-3.5 px-0.5 sm:mt-4")}
        role="tabpanel"
        aria-live="polite"
      >
        {activeSummary}
      </p>
    </div>
  )
}
