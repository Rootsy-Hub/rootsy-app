"use client"

import "./rootsyNaturePalette.css"
import { COLOR_RELATED_LINKS } from "@/app/[siteId]/[popId]/library/color/colorLibraryNav"
import { getColorPageMeta } from "@/app/[siteId]/[popId]/library/color/colorLibraryNav"
import { ColorOverviewSection } from "@/app/[siteId]/[popId]/library/color/sections/ColorOverviewSection"
import { ColorAccentsSection } from "@/app/[siteId]/[popId]/library/color/sections/ColorAccentsSection"
import { ColorPickerSection } from "@/app/[siteId]/[popId]/library/color/sections/ColorPickerSection"
import { ColorDataVizSection } from "@/app/[siteId]/[popId]/library/color/sections/ColorDataVizSection"
import { ColorPaletteSection } from "@/app/[siteId]/[popId]/library/color/sections/ColorPaletteSection"
import { ColorRelatedLinks } from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
  siteId: string
  popId: string
}

export function ColorFoundationView({ sectionId, siteId, popId }: Props) {
  let content: ReactNode = null
  switch (sectionId) {
    case "colors":
      content = <ColorOverviewSection />
      break
    case "colors-accents":
      content = <ColorAccentsSection />
      break
    case "colors-picker":
      content = <ColorPickerSection />
      break
    case "colors-data-viz":
      content = <ColorDataVizSection />
      break
    case "colors-palette":
      content = <ColorPaletteSection />
      break
    default:
      return null
  }

  return (
    <div className="rootsy-nature-palette space-y-10">
      {content}
      <div className="space-y-3 border-t border-border/60 pt-8">
        <p className="text-sm font-semibold text-foreground">Relacionado</p>
        <ColorRelatedLinks
          siteId={siteId}
          popId={popId}
          excludeId={sectionId}
          links={COLOR_RELATED_LINKS}
        />
      </div>
    </div>
  )
}

/** Título de página para el workspace cuando estamos en color. */
export function getColorFoundationHeading(sectionId: string) {
  return getColorPageMeta(sectionId)?.title ?? "Color"
}

export function getColorFoundationDescription(sectionId: string) {
  return getColorPageMeta(sectionId)?.description ?? ""
}
