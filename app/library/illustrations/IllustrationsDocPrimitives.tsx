"use client"

import {
  ILLUSTRATION_CATEGORIES,
  ROOTSY_ILLUSTRATIONS_CONCEPT,
} from "@/app/library/illustrations/rootsyIllustrationsSystem"
import {
  CONCEPT_TOKENS,
  FoundationBrumaStage,
  FoundationConceptHero,
  FoundationExampleLabel,
} from "@/app/library/libraryFoundationDocShared"
import { cn } from "@/lib/utils"

export {
  LibraryDocLead as IllustrationsDocLead,
  LibraryDocSection as IllustrationsDocSection,
  LibraryPrinciplesGrid as IllustrationsPrinciplesGrid,
} from "@/app/library/libraryDocPrimitives"

const STATUS_LABEL: Record<
  (typeof ILLUSTRATION_CATEGORIES)[number]["status"],
  string
> = {
  defined: "Definido",
  "in-progress": "En curso",
  planned: "Planificado",
}

export function IllustrationsSystemHero() {
  return (
    <div className="space-y-4">
      <FoundationConceptHero
        eyebrow="Rootsy · Ilustraciones"
        concept={ROOTSY_ILLUSTRATIONS_CONCEPT}
      />
      <FoundationBrumaStage caption="Tres familias — spots, mascota y patrones ambient.">
        <div className="grid gap-3 sm:grid-cols-3">
          {ILLUSTRATION_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="rounded-xl border p-4"
              style={{
                backgroundColor: CONCEPT_TOKENS.white,
                borderColor: CONCEPT_TOKENS.bruma200,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <FoundationExampleLabel>{category.label}</FoundationExampleLabel>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 font-canopy text-[10px] font-semibold uppercase tracking-wide",
                  )}
                  style={{
                    backgroundColor: CONCEPT_TOKENS.savia50,
                    color: CONCEPT_TOKENS.savia800,
                  }}
                >
                  {STATUS_LABEL[category.status]}
                </span>
              </div>
              <p
                className="mt-2 font-canopy text-sm leading-relaxed"
                style={{ color: CONCEPT_TOKENS.bruma600 }}
              >
                {category.detail}
              </p>
            </div>
          ))}
        </div>
      </FoundationBrumaStage>
    </div>
  )
}

export function IllustrationsRoadmapPanel() {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] px-6 py-10 text-center">
      <p className="font-canopy text-xs font-bold uppercase tracking-[0.16em] text-[var(--rootsy-bruma-500)]">
        Roadmap
      </p>
      <p className="mt-3 font-canopy text-lg font-semibold tracking-tight text-[var(--rootsy-bruma-900)]">
        Assets en preparación
      </p>
      <p className="mx-auto mt-2 max-w-md font-canopy text-sm text-[var(--rootsy-bruma-500)]">
        Los spots iniciales y la guía de mascota se publicarán en esta sección a medida que
        estén listos para producto.
      </p>
    </div>
  )
}
