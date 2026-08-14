"use client"

import { LibraryRelatedLinksSection } from "@/app/library/libraryDocPrimitives"
import "./rootsySpacingScale.css"
import {
  SPACING_RELATED_LINKS,
  getSpacingPageMeta,
} from "@/app/library/spacing/spacingLibraryNav"
import { SpacingOverviewSection } from "@/app/library/spacing/sections/SpacingOverviewSection"
import { SpacingPrimitivesSection } from "@/app/library/spacing/sections/SpacingPrimitivesSection"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
}

export function SpacingFoundationView({ sectionId }: Props) {
  let content: ReactNode = null
  switch (sectionId) {
    case "spacing":
      content = <SpacingOverviewSection />
      break
    case "spacing-primitives":
      content = <SpacingPrimitivesSection />
      break
    default:
      return null
  }

  return (
    <div className="rootsy-spacing-system space-y-10">
      {content}
      <LibraryRelatedLinksSection excludeId={sectionId} links={SPACING_RELATED_LINKS} />
    </div>
  )
}

export function getSpacingFoundationHeading(sectionId: string) {
  return getSpacingPageMeta(sectionId)?.title ?? "Espaciado"
}
