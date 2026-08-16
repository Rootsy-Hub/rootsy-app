"use client"

import { LibraryRelatedLinksSection } from "@/app/library/libraryDocPrimitives"
import {
  CONCEPT_RELATED_LINKS,
  getConceptPageMeta,
} from "@/app/library/concept/conceptLibraryNav"
import { ConceptOverviewSection } from "@/app/library/concept/sections/ConceptOverviewSection"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
}

export function ConceptFoundationView({ sectionId }: Props) {
  let content: ReactNode = null
  if (sectionId === "concept") {
    content = <ConceptOverviewSection />
  } else {
    return null
  }

  return (
    <div className="rootsy-concept-system space-y-10">
      {content}
      <LibraryRelatedLinksSection excludeId={sectionId} links={CONCEPT_RELATED_LINKS} />
    </div>
  )
}

export function getConceptFoundationHeading(sectionId: string) {
  return getConceptPageMeta(sectionId)?.title ?? "Concepto"
}
