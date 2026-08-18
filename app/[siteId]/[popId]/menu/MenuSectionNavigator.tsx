"use client"

import { menuFloatingPillShellClass } from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import {
  menuRealmLightStaticClass,
  menuSectionPlanetDotClass,
} from "@/lib/menu/menuHoloStyles"
import type { MenuSectionKey } from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"

export type MenuSectionNavItem = {
  key: string
  title: string
}

type Props = {
  sections: MenuSectionNavItem[]
  selectedIndex: number
  onSelect: (index: number) => void
}

export function MenuSectionNavigator({
  sections,
  selectedIndex,
  onSelect,
}: Props) {
  const currentTitle = sections[selectedIndex]?.title ?? ""

  return (
    <div
      role="tablist"
      aria-label="Secciones del menú"
      className={cn(
        "mb-8 inline-flex max-w-full items-center justify-between gap-2.5 px-3.5 py-1 sm:min-w-48",
        menuFloatingPillShellClass,
      )}
    >
      <span
        className={cn(
          "truncate text-sm font-normal leading-none tracking-[0.02em] antialiased",
          menuRealmLightStaticClass,
        )}
      >
        {currentTitle}
      </span>

      <div className="flex shrink-0 items-center -space-x-1">
        {sections.map((section, index) => {
          const selected = selectedIndex === index
          const sectionKey = section.key as MenuSectionKey
          return (
            <button
              key={section.key}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={section.title}
              onClick={() => onSelect(index)}
              className={cn(
                "flex size-7 items-center justify-center rounded-full transition-colors",
                "hover:bg-white/[0.06] active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,255,255,0.22)]",
              )}
            >
              <span
                aria-hidden
                className={menuSectionPlanetDotClass(sectionKey, selected)}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
