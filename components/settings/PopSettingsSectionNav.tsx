"use client"

import "@/app/library/libraryColorTheme.css"
import "@/components/statistics/statisticsNavRail.css"
import {
  statisticsNavItemMobileClass,
  statisticsNavListClass,
  statisticsNavShellClass,
} from "@/components/statistics/statisticsWorkspaceStyles"
import type { PopSettingsSectionDef, PopSettingsSectionId } from "@/lib/popSettingsCatalog"
import {
  libraryNavItemActiveClass,
  libraryNavItemClass,
  libraryNavItemIconClass,
  libraryNavItemLabelClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"

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
    <nav
      className={statisticsNavShellClass}
      aria-label="Secciones de ajustes"
    >
      <ul className={statisticsNavListClass} role="list">
        {sections.map((section) => {
          const active = section.id === activeSectionId
          const Icon = section.icon

          return (
            <li key={section.id} className="shrink-0 lg:shrink">
              <button
                type="button"
                aria-current={active ? "page" : undefined}
                aria-label={section.label}
                onClick={() => onSectionSelect(section.id)}
                className={cn(
                  libraryNavItemClass,
                  statisticsNavItemMobileClass,
                  "w-full text-left",
                  active && libraryNavItemActiveClass,
                )}
              >
                <Icon className={libraryNavItemIconClass} aria-hidden />
                <span className={libraryNavItemLabelClass}>{section.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
