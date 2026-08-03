"use client"

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
      className="mb-8 inline-flex max-w-full items-center justify-between gap-2.5 rounded-xl border border-border bg-muted/80 px-3.5 py-1 backdrop-blur-xl sm:min-w-[12rem]"
    >
      <span className="truncate text-sm font-bold leading-none tracking-wide text-foreground">
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
                    ? "size-2 bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
                    : "size-1.5 bg-foreground/25",
                )}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
