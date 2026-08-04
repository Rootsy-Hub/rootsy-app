"use client"

import "./rootsyLogoSystem.css"
import {
  LOGOS_RELATED_LINKS,
  getLogosPageMeta,
} from "@/app/[siteId]/[popId]/library/logos/logosLibraryNav"
import { LogosOverviewSection } from "@/app/[siteId]/[popId]/library/logos/sections/LogosOverviewSection"
import { LogosRelatedLinks } from "@/app/[siteId]/[popId]/library/logos/LogosDocPrimitives"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
  siteId: string
  popId: string
}

export function LogosFoundationView({ sectionId, siteId, popId }: Props) {
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
      <div className="space-y-3 border-t border-border/60 pt-8">
        <p className="text-sm font-semibold text-foreground">Relacionado</p>
        <LogosRelatedLinks
          siteId={siteId}
          popId={popId}
          excludeId={sectionId}
          links={LOGOS_RELATED_LINKS}
        />
      </div>
    </div>
  )
}

export function getLogosFoundationHeading(sectionId: string) {
  return getLogosPageMeta(sectionId)?.title ?? "Logotipos"
}
