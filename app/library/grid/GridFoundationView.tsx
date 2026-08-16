"use client"

import { LibraryRelatedLinksSection } from "@/app/library/libraryDocPrimitives"
import "./rootsyGridSystem.css"
import {
  GRID_RELATED_LINKS,
  getGridPageMeta,
} from "@/app/library/grid/gridLibraryNav"
import { GridOverviewSection } from "@/app/library/grid/sections/GridOverviewSection"
import { GridResponsiveSection } from "@/app/library/grid/sections/GridResponsiveSection"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
}

export function GridFoundationView({ sectionId }: Props) {
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
      <LibraryRelatedLinksSection excludeId={sectionId} links={GRID_RELATED_LINKS} />
    </div>
  )
}

export function getGridFoundationHeading(sectionId: string) {
  return getGridPageMeta(sectionId)?.title ?? "Grilla"
}
