"use client"

import "@/app/library/libraryColorTheme.css"
import type { StatisticsSectionDef } from "@/lib/statisticsCatalog"
import { getRootsModuleIcon } from "@/lib/rootsyModuleIcons"
import {
  statisticsNavItemMobileClass,
  statisticsNavListClass,
  statisticsNavShellClass,
  statisticsPlannedBadgeClass,
} from "@/components/statistics/statisticsWorkspaceStyles"
import {
  libraryNavItemActiveClass,
  libraryNavItemClass,
  libraryNavItemIconClass,
  libraryNavItemLabelClass,
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
      className={statisticsNavShellClass}
      aria-label="Secciones de estadísticas"
    >
      <ul className={statisticsNavListClass} role="list">
        {sections.map((section) => {
          const active = section.id === activeSectionId
          const Icon = getRootsModuleIcon(section.iconModuleKey)

          return (
            <li key={section.id} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => onSelect(section.id)}
                aria-current={active ? "true" : undefined}
                aria-label={section.label}
                className={cn(
                  libraryNavItemClass,
                  statisticsNavItemMobileClass,
                  active && libraryNavItemActiveClass,
                )}
              >
                <Icon className={libraryNavItemIconClass} aria-hidden />
                <span className={libraryNavItemLabelClass}>{section.label}</span>
                {section.comingSoon ? (
                  <span className={statisticsPlannedBadgeClass}>Próx.</span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
