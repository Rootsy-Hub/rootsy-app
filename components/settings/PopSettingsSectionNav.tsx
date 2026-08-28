"use client"

import "@/components/statistics/statisticsNavRail.css"
import { OperarSectionRail } from "@/components/layouts-module/OperarSectionRail"
import {
  statisticsNavItemMobileClass,
  statisticsNavListClass,
  statisticsNavShellClass,
} from "@/components/statistics/statisticsWorkspaceStyles"
import type {
  PopSettingsSectionDef,
  PopSettingsSectionId,
} from "@/lib/popSettingsCatalog"

type Props = {
  sections: PopSettingsSectionDef[]
  activeSectionId: PopSettingsSectionId
  onSectionSelect: (sectionId: PopSettingsSectionId) => void
}

export function PopSettingsSectionNav({
  sections,
  activeSectionId,
  onSectionSelect,
}: Props) {
  return (
    <OperarSectionRail
      embedded
      ariaLabel="Secciones de ajustes"
      activeId={activeSectionId}
      className={statisticsNavShellClass}
      listClassName={statisticsNavListClass}
      listItemClassName="w-auto shrink-0 lg:w-full lg:shrink"
      itemClassName={statisticsNavItemMobileClass}
      onSelect={(id) => onSectionSelect(id as PopSettingsSectionId)}
      items={sections.map((section) => ({
        id: section.id,
        label: section.label,
        icon: section.icon,
      }))}
    />
  )
}
