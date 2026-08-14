"use client"

import type { StatisticsSectionDef } from "@/lib/statisticsCatalog"
import { dataWorkspaceShellCard } from "@/components/data-workspace/dataWorkspaceListStyles"
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
      className={cn(
        dataWorkspaceShellCard,
        "flex gap-1 overflow-x-auto p-2 lg:block lg:overflow-visible lg:p-3",
      )}
      aria-label="Secciones de estadísticas"
    >
      {sections.map((section) => {
        const active = section.id === activeSectionId
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            className={cn(
              "min-w-[9.5rem] shrink-0 rounded-xl px-3 py-2.5 text-left transition-colors lg:min-w-0 lg:w-full",
              active
                ? "bg-[var(--rootsy-savia-600)] text-white"
                : "text-[var(--rootsy-bruma-700)] hover:bg-[var(--rootsy-bruma-50)]",
            )}
          >
            <span className="block text-sm font-semibold">{section.label}</span>
            <span
              className={cn(
                "mt-0.5 block text-[11px] leading-snug",
                active ? "text-white/80" : "text-[var(--rootsy-bruma-500)]",
              )}
            >
              {section.description}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
