"use client"

import { LibraryRelatedLinksSection } from "@/app/library/libraryDocPrimitives"
import "./rootsyElevationSystem.css"
import {
  ELEVATION_RELATED_LINKS,
  getElevationPageMeta,
} from "@/app/library/elevation/elevationLibraryNav"
import { ElevationApplyingSection } from "@/app/library/elevation/sections/ElevationApplyingSection"
import { ElevationOverviewSection } from "@/app/library/elevation/sections/ElevationOverviewSection"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
}

export function ElevationFoundationView({ sectionId }: Props) {
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
      <LibraryRelatedLinksSection excludeId={sectionId} links={ELEVATION_RELATED_LINKS} />
    </div>
  )
}

export function getElevationFoundationHeading(sectionId: string) {
  return getElevationPageMeta(sectionId)?.title ?? "Elevación"
}
