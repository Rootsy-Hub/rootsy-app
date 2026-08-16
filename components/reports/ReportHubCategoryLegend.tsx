"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  getReportHubCategorySummary,
  REPORT_CATALOG,
  type ReportHubCategoryFilter,
} from "@/lib/reportsCatalog"
import { cn } from "@/lib/utils"
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"

type Props = {
  selectedCategoryId: ReportHubCategoryFilter
  onSelectCategory: (categoryId: ReportHubCategoryFilter) => void
}

type LegendTab = {
  id: ReportHubCategoryFilter
  title: string
  summary: string
}

const legendTabButtonClass = cn(
  "relative z-10 inline-flex items-center rounded-lg px-3 py-2",
  "text-sm font-medium text-[var(--rootsy-bruma-900)]",
  "transition-colors duration-200",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-500)_35%,transparent)] focus-visible:ring-offset-2",
)

const reportHubCategorySummaryClass =
  "max-w-2xl text-sm leading-relaxed text-[var(--rootsy-bruma-700)] sm:text-[0.9375rem] sm:leading-6"

function LegendTabButton({
  tab,
  isActive,
  tabRef,
  onSelect,
}: {
  tab: LegendTab
  isActive: boolean
  tabRef: (el: HTMLButtonElement | null) => void
  onSelect: () => void
}) {
  const button = (
    <button
      ref={tabRef}
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onSelect}
      className={legendTabButtonClass}
    >
      {tab.title}
    </button>
  )

  if (isActive) return button

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="bottom"
        variant="dark"
        sideOffset={6}
        className="max-w-[16rem] text-left leading-snug"
      >
        {tab.summary}
      </TooltipContent>
    </Tooltip>
  )
}

export function ReportHubCategoryLegend({
  selectedCategoryId,
  onSelectCategory,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Partial<Record<ReportHubCategoryFilter, HTMLButtonElement | null>>>(
    {},
  )
  const [indicator, setIndicator] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ready: false,
  })

  const tabs = useMemo<LegendTab[]>(
    () => [
      ...REPORT_CATALOG.map((category) => ({
        id: category.id,
        title: category.title,
        summary: category.summary,
      })),
      {
        id: "all" as const,
        title: "Todos",
        summary: getReportHubCategorySummary("all"),
      },
    ],
    [],
  )

  const updateIndicator = useCallback(() => {
    const container = containerRef.current
    const tab = tabRefs.current[selectedCategoryId]
    if (!container || !tab) return

    const cRect = container.getBoundingClientRect()
    const tRect = tab.getBoundingClientRect()

    setIndicator({
      left: tRect.left - cRect.left,
      top: tRect.top - cRect.top,
      width: tRect.width,
      height: tRect.height,
      ready: true,
    })
  }, [selectedCategoryId])

  useLayoutEffect(() => {
    updateIndicator()
    const container = containerRef.current
    if (!container) return

    const ro = new ResizeObserver(updateIndicator)
    ro.observe(container)
    for (const tab of tabs) {
      const el = tabRefs.current[tab.id]
      if (el) ro.observe(el)
    }

    window.addEventListener("resize", updateIndicator)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", updateIndicator)
    }
  }, [updateIndicator, tabs])

  const activeSummary = getReportHubCategorySummary(selectedCategoryId)

  return (
    <div className="px-1 pb-5">
      <div
        ref={containerRef}
        className="relative flex flex-wrap items-center gap-2"
        role="tablist"
        aria-label="Categorías de reportes"
      >
        <span
          className={cn(
            "pointer-events-none absolute left-0 top-0 z-0 rounded-lg border border-[var(--rootsy-bruma-300)] bg-white shadow-sm",
            "transition-[transform,width,height,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
            indicator.ready ? "opacity-100" : "opacity-0",
          )}
          style={{
            width: indicator.width,
            height: indicator.height,
            transform: `translate(${indicator.left}px, ${indicator.top}px)`,
          }}
          aria-hidden
        />

        {tabs.map((tab) => (
          <LegendTabButton
            key={tab.id}
            tab={tab}
            isActive={selectedCategoryId === tab.id}
            tabRef={(el) => {
              tabRefs.current[tab.id] = el
            }}
            onSelect={() => onSelectCategory(tab.id)}
          />
        ))}
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
