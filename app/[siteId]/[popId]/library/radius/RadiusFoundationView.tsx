"use client"

import "./rootsyRadiusSystem.css"
import {
  RADIUS_RELATED_LINKS,
  getRadiusPageMeta,
} from "@/app/[siteId]/[popId]/library/radius/radiusLibraryNav"
import { RadiusOverviewSection } from "@/app/[siteId]/[popId]/library/radius/sections/RadiusOverviewSection"
import { RadiusRelatedLinks } from "@/app/[siteId]/[popId]/library/radius/RadiusDocPrimitives"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
  siteId: string
  popId: string
}

export function RadiusFoundationView({ sectionId, siteId, popId }: Props) {
  let content: ReactNode = null
  if (sectionId === "radius") {
    content = <RadiusOverviewSection />
  } else {
    return null
  }

  return (
    <div className="rootsy-radius-system space-y-10">
      {content}
      <div className="space-y-3 border-t border-border/60 pt-8">
        <p className="text-sm font-semibold text-foreground">Relacionado</p>
        <RadiusRelatedLinks
          siteId={siteId}
          popId={popId}
          excludeId={sectionId}
          links={RADIUS_RELATED_LINKS}
        />
      </div>
    </div>
  )
}

export function getRadiusFoundationHeading(sectionId: string) {
  return getRadiusPageMeta(sectionId)?.title ?? "Radio"
}
