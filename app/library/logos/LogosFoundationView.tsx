"use client"

import "./rootsyLogoSystem.css"
import {
  LOGOS_RELATED_LINKS,
  getLogosPageMeta,
} from "@/app/library/logos/logosLibraryNav"
import { LogosOverviewSection } from "@/app/library/logos/sections/LogosOverviewSection"
import { LogosRelatedLinks } from "@/app/library/logos/LogosDocPrimitives"
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
      <div className="space-y-3 border-t border-border/60 pt-8">
        <p className="text-sm font-semibold text-foreground">Relacionado</p>
        <LogosRelatedLinks
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
