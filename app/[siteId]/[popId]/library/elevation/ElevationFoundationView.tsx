"use client"

import "./rootsyElevationSystem.css"
import {
  ELEVATION_RELATED_LINKS,
  getElevationPageMeta,
} from "@/app/[siteId]/[popId]/library/elevation/elevationLibraryNav"
import { ElevationApplyingSection } from "@/app/[siteId]/[popId]/library/elevation/sections/ElevationApplyingSection"
import { ElevationOverviewSection } from "@/app/[siteId]/[popId]/library/elevation/sections/ElevationOverviewSection"
import { ElevationRelatedLinks } from "@/app/[siteId]/[popId]/library/elevation/ElevationDocPrimitives"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
  siteId: string
  popId: string
}

export function ElevationFoundationView({ sectionId, siteId, popId }: Props) {
  let content: ReactNode = null
  switch (sectionId) {
    case "elevation":
      content = <ElevationOverviewSection />
      break
    case "elevation-applying":
      content = <ElevationApplyingSection />
      break
    default:
      return null
  }

  return (
    <div className="rootsy-elevation-system space-y-10">
      {content}
      <div className="space-y-3 border-t border-border/60 pt-8">
        <p className="text-sm font-semibold text-foreground">Relacionado</p>
        <ElevationRelatedLinks
          siteId={siteId}
          popId={popId}
          excludeId={sectionId}
          links={ELEVATION_RELATED_LINKS}
        />
      </div>
    </div>
  )
}

export function getElevationFoundationHeading(sectionId: string) {
  return getElevationPageMeta(sectionId)?.title ?? "Elevación"
}
