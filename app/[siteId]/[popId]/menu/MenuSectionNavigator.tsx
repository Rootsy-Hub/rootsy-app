"use client"

import {
  menuSectionRealmDividerClass,
  menuSectionRealmIndicatorClass,
  menuSectionRealmRailClass,
  menuSectionRealmSelectedWellClass,
  menuSectionRealmTabClass,
  menuSectionRealmTabDormantClass,
  menuSectionRealmTabIdleClass,
  menuSectionRealmTabSelectedClass,
} from "@/app/[siteId]/[popId]/menu/menuSectionRealmStyles"
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
  className?: string
  /** Sin colores de reinado — universo en reposo hasta la carga final. */
  dormant?: boolean
}

/** Selector de reinado — rail segmentado, sobrio y preciso. */
export function MenuSectionNavigator({
  sections,
  selectedIndex,
  onSelect,
  className,
  dormant = false,
}: Props) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-4xl shrink-0 justify-center px-4 pb-1 pt-0 sm:px-6",
        className,
      )}
    >
      <div
        role="tablist"
        aria-label="Secciones del menú"
        className={menuSectionRealmRailClass}
      >
        {sections.map((section, index) => {
          const selected = !dormant && selectedIndex === index
          const sectionKey = section.key as MenuSectionKey
          const isLast = index === sections.length - 1

          return (
            <div
              key={section.key}
              className="flex min-w-0 flex-1 items-stretch sm:flex-none"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={section.title}
                onClick={() => onSelect(index)}
                className={cn(
                  menuSectionRealmTabClass,
                  "border-0 bg-transparent",
                  dormant
                    ? menuSectionRealmTabDormantClass
                    : selected
                      ? cn(
                          menuSectionRealmTabSelectedClass,
                          menuSectionRealmSelectedWellClass,
                        )
                      : menuSectionRealmTabIdleClass,
                )}
              >
                <span className="block truncate">{section.title}</span>
                {selected ? (
                  <span
                    aria-hidden
                    className={menuSectionRealmIndicatorClass(sectionKey)}
                  />
                ) : null}
              </button>
              {!isLast ? <span aria-hidden className={menuSectionRealmDividerClass} /> : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
