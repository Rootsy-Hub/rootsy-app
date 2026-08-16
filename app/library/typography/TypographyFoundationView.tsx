"use client"

import { LibraryRelatedLinksSection } from "@/app/library/libraryDocPrimitives"
import "./rootsyTypographySystem.css"
import {
  TYPOGRAPHY_RELATED_LINKS,
  getTypographyPageMeta,
} from "@/app/library/typography/typographyLibraryNav"
import { TypographyOverviewSection } from "@/app/library/typography/sections/TypographyOverviewSection"
import { TypographyApplyingSection } from "@/app/library/typography/sections/TypographyApplyingSection"
import { TypographyTypefacesSection } from "@/app/library/typography/sections/TypographyTypefacesSection"
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
      <LibraryRelatedLinksSection excludeId={sectionId} links={TYPOGRAPHY_RELATED_LINKS} />
    </div>
  )
}

export function getTypographyFoundationHeading(sectionId: string) {
  return getTypographyPageMeta(sectionId)?.title ?? "Tipografía"
}
