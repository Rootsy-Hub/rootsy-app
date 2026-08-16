"use client"

import { LibraryRelatedLinksSection } from "@/app/library/libraryDocPrimitives"
import "./rootsyRadiusSystem.css"
import {
  RADIUS_RELATED_LINKS,
  getRadiusPageMeta,
} from "@/app/library/radius/radiusLibraryNav"
import { RadiusOverviewSection } from "@/app/library/radius/sections/RadiusOverviewSection"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
}

export function RadiusFoundationView({ sectionId }: Props) {
  let content: ReactNode = null
  if (sectionId === "radius") {
    content = <RadiusOverviewSection />
  } else {
    return null
  }

  return (
    <div className="rootsy-radius-system space-y-10">
      {content}
      <LibraryRelatedLinksSection excludeId={sectionId} links={RADIUS_RELATED_LINKS} />
    </div>
  )
}

export function getRadiusFoundationHeading(sectionId: string) {
  return getRadiusPageMeta(sectionId)?.title ?? "Radio"
}
