"use client"

import "./rootsySpacingScale.css"
import {
  SPACING_RELATED_LINKS,
  getSpacingPageMeta,
} from "@/app/[siteId]/[popId]/library/spacing/spacingLibraryNav"
import { SpacingOverviewSection } from "@/app/[siteId]/[popId]/library/spacing/sections/SpacingOverviewSection"
import { SpacingPrimitivesSection } from "@/app/[siteId]/[popId]/library/spacing/sections/SpacingPrimitivesSection"
import { SpacingRelatedLinks } from "@/app/[siteId]/[popId]/library/spacing/SpacingDocPrimitives"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
  siteId: string
  popId: string
}

export function SpacingFoundationView({ sectionId, siteId, popId }: Props) {
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
      <div className="space-y-3 border-t border-border/60 pt-8">
        <p className="text-sm font-semibold text-foreground">Relacionado</p>
        <SpacingRelatedLinks
          siteId={siteId}
          popId={popId}
          excludeId={sectionId}
          links={SPACING_RELATED_LINKS}
        />
      </div>
    </div>
  )
}

export function getSpacingFoundationHeading(sectionId: string) {
  return getSpacingPageMeta(sectionId)?.title ?? "Espaciado"
}
