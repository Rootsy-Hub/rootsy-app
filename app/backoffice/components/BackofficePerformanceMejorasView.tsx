"use client"

import {
  PERFORMANCE_MEJORA_GROUPS,
  performanceMejoraIds,
} from "@/app/backoffice/performance/performanceMejoras"
import {
  libraryDocBodyClass,
  libraryDocMetaLabelClass,
  libraryDocSectionTitleClass,
} from "@/app/library/libraryColorTheme"
import {
  statisticsSectionPageSubtitleClass,
  statisticsSectionPageTitleClass,
} from "@/components/statistics/statisticsWorkspaceStyles"
import { RootsFormCheckboxChoiceRow } from "@/components/rootsy-form"
import { rootsFormCheckboxChoiceListClass } from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "uroboros-performance-mejoras-v1"

function readDone(): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object") return {}
    return parsed as Record<string, boolean>
  } catch {
    return {}
  }
}

export function BackofficePerformanceMejorasView() {
  const ids = useMemo(() => performanceMejoraIds(), [])
  const [done, setDone] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setDone(readDone())
  }, [])

  const shippedIds = useMemo(
    () =>
      new Set(
        PERFORMANCE_MEJORA_GROUPS.flatMap((group) =>
          group.items.filter((item) => item.doneNote).map((item) => item.id),
        ),
      ),
    [],
  )
  const doneCount = ids.filter((id) => shippedIds.has(id) || done[id]).length

  function toggle(id: string, checked: boolean) {
    if (shippedIds.has(id)) return
    setDone((current) => {
      const next = { ...current, [id]: checked }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <article className="mx-auto max-w-2xl space-y-12 pb-16 pt-2">
      <header className="space-y-3">
        <p className={libraryDocMetaLabelClass}>Performance</p>
        <h1 className={statisticsSectionPageTitleClass}>Mejoras</h1>
        <p className={cn(statisticsSectionPageSubtitleClass, "max-w-xl")}>
          Lo que hay que hacer para que la app vuele. Las marcamos acá cuando
          estén hechas.
        </p>
      </header>

      <p className={cn(libraryDocBodyClass, "max-w-none")}>
        {doneCount} de {ids.length} hechas. Impacto 1 es lo que más se siente.
        Complejidad 1 es lo más simple.
      </p>

      {PERFORMANCE_MEJORA_GROUPS.map((group) => (
        <section
          key={group.id}
          className="space-y-4 border-t border-rootsy-bruma-200 pt-10"
        >
          <h2 className={libraryDocSectionTitleClass}>{group.title}</h2>
          <div className={rootsFormCheckboxChoiceListClass}>
            {group.items.map((item) => {
              const shipped = Boolean(item.doneNote)
              const checked = shipped || Boolean(done[item.id])

              return (
                <div key={item.id} className="space-y-1">
                  <RootsFormCheckboxChoiceRow
                    id={`mejora-${item.id}`}
                    checked={checked}
                    disabled={shipped}
                    onCheckedChange={(value) => toggle(item.id, value)}
                    label={item.title}
                    description={`${item.description} Impacto ${item.impact} · complejidad ${item.complexity}.`}
                    className={checked ? "opacity-60" : undefined}
                  />
                  {item.doneNote ? (
                    <p className="pl-8 font-canopy text-xs leading-relaxed text-rootsy-bruma-500">
                      Hecho: {item.doneNote}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </article>
  )
}
