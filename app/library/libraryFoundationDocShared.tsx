"use client"

import { CONCEPT_TOKENS } from "@/app/library/concept/rootsyConceptSystem"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export { CONCEPT_TOKENS }

export function FoundationSpecCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("library-spec-card rounded-2xl border p-5 sm:p-6", className)}>
      {children}
    </div>
  )
}

export function FoundationBrumaStage({
  caption,
  children,
  className,
  clip = true,
}: {
  caption?: string
  children: ReactNode
  className?: string
  /** false = no recortar sombras de overlays (modales, dropdowns). */
  clip?: boolean
}) {
  return (
    <div
      className={cn(clip ? "overflow-hidden" : "overflow-visible", "rounded-2xl border")}
      style={{
        backgroundColor: CONCEPT_TOKENS.bruma100,
        borderColor: CONCEPT_TOKENS.bruma200,
      }}
    >
      <div className={cn("p-5 sm:p-6", className)}>{children}</div>
      {caption ? (
        <p
          className="border-t px-4 py-3 font-canopy text-[11px] leading-relaxed"
          style={{
            borderColor: CONCEPT_TOKENS.bruma200,
            color: CONCEPT_TOKENS.bruma500,
          }}
        >
          {caption}
        </p>
      ) : null}
    </div>
  )
}

export function FoundationExampleLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-canopy text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </p>
  )
}

export function FoundationConceptHero({
  eyebrow,
  concept,
  stage,
}: {
  eyebrow: string
  concept: {
    title: string
    lead: string
    why: readonly string[]
    closing: string
  }
  stage?: ReactNode
}) {
  return (
    <FoundationSpecCard className="space-y-6">
      <div className="space-y-3">
        <p
          className="font-canopy text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: CONCEPT_TOKENS.bruma500 }}
        >
          {eyebrow}
        </p>
        <p
          className="font-canopy text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ color: CONCEPT_TOKENS.bruma900 }}
        >
          {concept.title}
        </p>
        <p
          className="max-w-2xl font-canopy text-sm leading-relaxed"
          style={{ color: CONCEPT_TOKENS.bruma900 }}
        >
          {concept.lead}
        </p>
      </div>

      <div className="space-y-2">
        <p
          className="font-canopy text-xs font-semibold uppercase tracking-wide"
          style={{ color: CONCEPT_TOKENS.bruma500 }}
        >
          Por qué
        </p>
        <ul className="max-w-2xl space-y-2">
          {concept.why.map((line) => (
            <li
              key={line}
              className="font-canopy text-sm leading-relaxed"
              style={{ color: CONCEPT_TOKENS.bruma600 }}
            >
              {line}
            </li>
          ))}
        </ul>
      </div>

      {stage}

      <p
        className="border-t pt-4 font-stream text-sm leading-relaxed"
        style={{
          borderColor: CONCEPT_TOKENS.bruma200,
          color: CONCEPT_TOKENS.bruma500,
        }}
      >
        {concept.closing}
      </p>
    </FoundationSpecCard>
  )
}
