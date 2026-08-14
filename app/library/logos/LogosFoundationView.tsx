"use client"

import { LibraryRelatedLinksSection } from "@/app/library/libraryDocPrimitives"
import "./rootsyLogoSystem.css"
import {
  LOGOS_RELATED_LINKS,
  getLogosPageMeta,
} from "@/app/library/logos/logosLibraryNav"
import { LogosOverviewSection } from "@/app/library/logos/sections/LogosOverviewSection"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
}

export function LogosFoundationView({ sectionId }: Props) {
  let content: ReactNode = null
  switch (sectionId) {
    case "logos":
      content = <LogosOverviewSection />
      break
    default:
      return null
  }

  return (
    <div className="rootsy-logos-system space-y-10">
      {content}
      <LibraryRelatedLinksSection excludeId={sectionId} links={LOGOS_RELATED_LINKS} />
    </div>
  )
}

export function getLogosFoundationHeading(sectionId: string) {
  return getLogosPageMeta(sectionId)?.title ?? "Logotipos"
}
