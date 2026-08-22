"use client"

import { LibraryRelatedLinksSection } from "@/app/library/libraryDocPrimitives"
import {
  COLOR_NEW_RELATED_LINKS,
  resolveColorNewSectionId,
  getColorNewPageMeta,
} from "@/app/library/color/colorNewLibraryNav"
import { ColorNewAccentsSection } from "@/app/library/color/sections/ColorNewAccentsSection"
import { ColorNewContrastSection } from "@/app/library/color/sections/ColorNewContrastSection"
import { ColorNewDataVizSection } from "@/app/library/color/sections/ColorNewDataVizSection"
import { ColorNewExamplesSection } from "@/app/library/color/sections/ColorNewExamplesSection"
import { ColorNewFamilySection } from "@/app/library/color/sections/ColorNewFamilySection"
import { ColorNewOverviewSection } from "@/app/library/color/sections/ColorNewOverviewSection"
import { ColorNewPairingsSection } from "@/app/library/color/sections/ColorNewPairingsSection"
import { ColorNewMundosSection } from "@/app/library/color/sections/ColorNewMundosSection"
import { ColorNewPalettesSection } from "@/app/library/color/sections/ColorNewPalettesSection"
import { ColorNewSemanticSection } from "@/app/library/color/sections/ColorNewSemanticSection"
import { ColorNewThemesSection } from "@/app/library/color/sections/ColorNewThemesSection"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
}

export function ColorNewFoundationView({ sectionId }: Props) {
  const resolvedSectionId = resolveColorNewSectionId(sectionId)
  let content: ReactNode = null
  switch (resolvedSectionId) {
    case "colors-new":
      content = <ColorNewOverviewSection />
      break
    case "colors-new-semantic":
      content = <ColorNewSemanticSection />
      break
    case "colors-new-themes":
      content = <ColorNewThemesSection />
      break
    case "colors-new-pairings":
      content = <ColorNewPairingsSection />
      break
    case "colors-new-mundos":
      content = <ColorNewMundosSection />
      break
    case "colors-new-contrast":
      content = <ColorNewContrastSection />
      break
    case "colors-new-accents":
      content = <ColorNewAccentsSection />
      break
    case "colors-new-palettes":
      content = <ColorNewPalettesSection />
      break
    case "colors-new-data-viz":
      content = <ColorNewDataVizSection />
      break
    case "colors-new-examples":
      content = <ColorNewExamplesSection />
      break
    case "colors-new-sombra":
    case "colors-new-bruma":
    case "colors-new-savia":
    case "colors-new-atmosphere":
    case "colors-new-landing":
      content = <ColorNewFamilySection sectionId={sectionId} />
      break
    default:
      return null
  }

  return (
    <div className="space-y-10">
      {content}
      <LibraryRelatedLinksSection excludeId={sectionId} links={COLOR_NEW_RELATED_LINKS} />
    </div>
  )
}

export function getColorNewFoundationHeading(sectionId: string) {
  return getColorNewPageMeta(sectionId)?.title ?? "Color"
}
