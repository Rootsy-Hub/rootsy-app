"use client"

import "@/app/library/libraryColorTheme.css"
import "@/components/statistics/statisticsNavRail.css"
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
import { useEffect, useRef } from "react"

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
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const item = navRef.current?.querySelector<HTMLElement>(
      "[aria-current=page]",
    )
    const scroller = navRef.current?.parentElement
    if (!item || !scroller) return
    const itemRect = item.getBoundingClientRect()
    const scrollerRect = scroller.getBoundingClientRect()
    const left =
      scroller.scrollLeft +
      (itemRect.left - scrollerRect.left) -
      scroller.clientWidth / 2 +
      itemRect.width / 2
    scroller.scrollTo({ left: Math.max(0, left), behavior: "instant" })
  }, [activeSectionId])

  return (
    <nav
      ref={navRef}
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
