"use client"

import {
  menuFloatingPillDotIdleClass,
  menuFloatingPillDotSelectedClass,
  menuFloatingPillShellClass,
} from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
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
      <span className="truncate text-sm font-semibold leading-none tracking-wide text-foreground/95">
        {currentTitle}
      </span>

      <div className="flex shrink-0 items-center -space-x-1">
        {sections.map((section, index) => {
          const selected = selectedIndex === index
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
                "hover:bg-foreground/6 active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "rounded-full transition-all duration-300",
                  selected
                    ? menuFloatingPillDotSelectedClass
                    : menuFloatingPillDotIdleClass,
                )}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
