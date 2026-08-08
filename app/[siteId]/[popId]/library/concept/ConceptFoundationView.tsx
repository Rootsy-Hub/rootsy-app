"use client"

import {
  CONCEPT_RELATED_LINKS,
  getConceptPageMeta,
} from "@/app/[siteId]/[popId]/library/concept/conceptLibraryNav"
import { ConceptOverviewSection } from "@/app/[siteId]/[popId]/library/concept/sections/ConceptOverviewSection"
import { LibraryRelatedLinks } from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
  siteId: string
  popId: string
}

export function ConceptFoundationView({ sectionId, siteId, popId }: Props) {
  let content: ReactNode = null
  if (sectionId === "concept") {
    content = <ConceptOverviewSection />
  } else {
    return null
  }

  return (
    <div className="rootsy-concept-system space-y-10">
      {content}
      <div className="space-y-3 border-t border-border/60 pt-8">
        <p className="text-sm font-semibold text-foreground">Relacionado</p>
        <LibraryRelatedLinks
          siteId={siteId}
          popId={popId}
          excludeId={sectionId}
          links={CONCEPT_RELATED_LINKS}
        />
      </div>
    </div>
  )
}

export function getConceptFoundationHeading(sectionId: string) {
  return getConceptPageMeta(sectionId)?.title ?? "Concepto"
}
