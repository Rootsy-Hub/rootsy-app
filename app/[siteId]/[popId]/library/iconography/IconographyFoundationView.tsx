"use client"

import "./rootsyIconographySystem.css"
import {
  ICONOGRAPHY_RELATED_LINKS,
  getIconographyPageMeta,
} from "@/app/[siteId]/[popId]/library/iconography/iconographyLibraryNav"
import { IconographyOverviewSection } from "@/app/[siteId]/[popId]/library/iconography/sections/IconographyOverviewSection"
import { IconographyRelatedLinks } from "@/app/[siteId]/[popId]/library/iconography/IconographyDocPrimitives"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
  siteId: string
  popId: string
}

export function IconographyFoundationView({ sectionId, siteId, popId }: Props) {
  let content: ReactNode = null
  switch (sectionId) {
    case "iconography":
      content = <IconographyOverviewSection />
      break
    default:
      return null
  }

  return (
    <div className="rootsy-iconography-system space-y-10">
      {content}
      <div className="space-y-3 border-t border-border/60 pt-8">
        <p className="text-sm font-semibold text-foreground">Relacionado</p>
        <IconographyRelatedLinks
          siteId={siteId}
          popId={popId}
          excludeId={sectionId}
          links={ICONOGRAPHY_RELATED_LINKS}
        />
      </div>
    </div>
  )
}

export function getIconographyFoundationHeading(sectionId: string) {
  return getIconographyPageMeta(sectionId)?.title ?? "Iconografía"
}
