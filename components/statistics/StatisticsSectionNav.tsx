"use client"

import "@/components/statistics/statisticsNavRail.css"
import { OperarSectionRail } from "@/components/layouts-module/OperarSectionRail"
import {
  statisticsNavItemMobileClass,
  statisticsNavListClass,
  statisticsNavShellClass,
  statisticsPlannedBadgeClass,
} from "@/components/statistics/statisticsWorkspaceStyles"
import type {
  StatisticsSectionDef,
  StatisticsSectionId,
} from "@/lib/statisticsCatalog"
import { getRootsModuleIcon } from "@/lib/rootsyModuleIcons"
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
    <OperarSectionRail
      ref={navRef}
      embedded
      ariaLabel="Secciones de estadísticas"
      activeId={activeSectionId}
      className={statisticsNavShellClass}
      listClassName={statisticsNavListClass}
      listItemClassName="w-auto shrink-0 lg:w-full lg:shrink"
      itemClassName={statisticsNavItemMobileClass}
      onSelect={
        onSectionClick
          ? (id) => onSectionClick(id as StatisticsSectionId)
          : undefined
      }
      items={sections.map((section) => ({
        id: section.id,
        label: section.label,
        href: getSectionHref(section.id),
        icon: getRootsModuleIcon(section.iconModuleKey),
        trailing: section.comingSoon ? (
          <span className={statisticsPlannedBadgeClass}>Próx.</span>
        ) : null,
      }))}
    />
  )
}
