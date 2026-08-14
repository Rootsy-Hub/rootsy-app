"use client"

import { LibraryRelatedLinksSection } from "@/app/library/libraryDocPrimitives"
import "./rootsyIconographySystem.css"
import {
  ICONOGRAPHY_RELATED_LINKS,
  getIconographyPageMeta,
} from "@/app/library/iconography/iconographyLibraryNav"
import { IconographyOverviewSection } from "@/app/library/iconography/sections/IconographyOverviewSection"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
}

export function IconographyFoundationView({ sectionId }: Props) {
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
      <LibraryRelatedLinksSection excludeId={sectionId} links={ICONOGRAPHY_RELATED_LINKS} />
    </div>
  )
}

export function getIconographyFoundationHeading(sectionId: string) {
  return getIconographyPageMeta(sectionId)?.title ?? "Iconografía"
}
