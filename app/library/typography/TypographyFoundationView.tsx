"use client"

import "./rootsyTypographySystem.css"
import {
  TYPOGRAPHY_RELATED_LINKS,
  getTypographyPageMeta,
} from "@/app/library/typography/typographyLibraryNav"
import { TypographyOverviewSection } from "@/app/library/typography/sections/TypographyOverviewSection"
import { TypographyApplyingSection } from "@/app/library/typography/sections/TypographyApplyingSection"
import { TypographyTypefacesSection } from "@/app/library/typography/sections/TypographyTypefacesSection"
import { TypographyRelatedLinks } from "@/app/library/typography/TypographyDocPrimitives"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
}

export function TypographyFoundationView({ sectionId }: Props) {
  let content: ReactNode = null
  switch (sectionId) {
    case "typography":
      content = <TypographyOverviewSection />
      break
    case "typography-applying":
      content = <TypographyApplyingSection />
      break
    case "typography-typefaces":
      content = <TypographyTypefacesSection />
      break
    default:
      return null
  }

  return (
    <div className="rootsy-typography-system space-y-10">
      {content}
      <div className="space-y-3 border-t border-border/60 pt-8">
        <p className="text-sm font-semibold text-foreground">Relacionado</p>
        <TypographyRelatedLinks
          excludeId={sectionId}
          links={TYPOGRAPHY_RELATED_LINKS}
        />
      </div>
    </div>
  )
}

export function getTypographyFoundationHeading(sectionId: string) {
  return getTypographyPageMeta(sectionId)?.title ?? "Tipografía"
}
