"use client"

import "./rootsyGridSystem.css"
import {
  GRID_RELATED_LINKS,
  getGridPageMeta,
} from "@/app/[siteId]/[popId]/library/grid/gridLibraryNav"
import { GridOverviewSection } from "@/app/[siteId]/[popId]/library/grid/sections/GridOverviewSection"
import { GridResponsiveSection } from "@/app/[siteId]/[popId]/library/grid/sections/GridResponsiveSection"
import { GridRelatedLinks } from "@/app/[siteId]/[popId]/library/grid/GridDocPrimitives"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
  siteId: string
  popId: string
}

export function GridFoundationView({ sectionId, siteId, popId }: Props) {
  let content: ReactNode = null
  switch (sectionId) {
    case "grid":
      content = <GridOverviewSection />
      break
    case "grid-responsive":
      content = <GridResponsiveSection />
      break
    default:
      return null
  }

  return (
    <div className="rootsy-grid-system space-y-10">
      {content}
      <div className="space-y-3 border-t border-border/60 pt-8">
        <p className="text-sm font-semibold text-foreground">Relacionado</p>
        <GridRelatedLinks
          siteId={siteId}
          popId={popId}
          excludeId={sectionId}
          links={GRID_RELATED_LINKS}
        />
      </div>
    </div>
  )
}

export function getGridFoundationHeading(sectionId: string) {
  return getGridPageMeta(sectionId)?.title ?? "Grilla"
}
