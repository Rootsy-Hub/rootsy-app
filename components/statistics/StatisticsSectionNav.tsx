"use client"

import "@/app/library/libraryColorTheme.css"
import type { StatisticsSectionDef } from "@/lib/statisticsCatalog"
import { getRootsModuleIcon } from "@/lib/rootsyModuleIcons"
import {
  statisticsLosetaCardClass,
  statisticsNavIconWrapActiveClass,
  statisticsNavIconWrapClass,
  statisticsNavItemActiveClass,
  statisticsNavItemClass,
  statisticsNavLabelClass,
  statisticsNavLabelActiveClass,
  statisticsNavSurfaceClass,
  statisticsPlannedBadgeClass,
} from "@/components/statistics/statisticsWorkspaceStyles"
import {
  libraryNavItemIconClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"

export function StatisticsSectionNav({
  sections,
  activeSectionId,
  onSelect,
}: {
  sections: StatisticsSectionDef[]
  activeSectionId: string
  onSelect: (id: string) => void
}) {
  return (
    <nav
      className={cn(
        statisticsLosetaCardClass,
        statisticsNavSurfaceClass,
        "gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible lg:p-2.5",
      )}
      aria-label="Secciones de estadísticas"
    >
      {sections.map((section) => {
        const active = section.id === activeSectionId
        const Icon = getRootsModuleIcon(section.iconModuleKey)

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            aria-current={active ? "true" : undefined}
            aria-label={section.label}
            className={cn(
              statisticsNavItemClass,
              active && statisticsNavItemActiveClass,
            )}
          >
            <span
              className={cn(
                statisticsNavIconWrapClass,
                active && statisticsNavIconWrapActiveClass,
              )}
            >
              <Icon className={libraryNavItemIconClass} aria-hidden />
            </span>
            <span
              className={cn(
                statisticsNavLabelClass,
                active && statisticsNavLabelActiveClass,
              )}
            >
              {section.label}
            </span>
            {section.comingSoon ? (
              <span className={statisticsPlannedBadgeClass}>Próx.</span>
            ) : null}
          </button>
        )
      })}
    </nav>
  )
}
