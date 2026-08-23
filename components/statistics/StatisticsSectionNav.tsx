"use client"

import "@/app/library/libraryColorTheme.css"
import type {
  StatisticsSectionDef,
  StatisticsSectionId,
} from "@/lib/statisticsCatalog"
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
import Link from "next/link"

export function StatisticsSectionNav({
  sections,
  activeSectionId,
  getSectionHref,
  onSectionClick,
}: {
  sections: StatisticsSectionDef[]
  activeSectionId: string
  getSectionHref: (sectionId: StatisticsSectionId) => string
  onSectionClick?: (sectionId: StatisticsSectionId) => void
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
              <Link
                href={getSectionHref(section.id)}
                scroll={false}
                aria-current={active ? "page" : undefined}
                aria-label={section.label}
                onClick={(event) => {
                  if (
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey ||
                    event.button !== 0
                  ) {
                    return
                  }
                  event.preventDefault()
                  onSectionClick?.(section.id)
                }}
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
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
