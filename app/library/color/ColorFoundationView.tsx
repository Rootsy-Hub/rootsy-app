"use client"

import { LibraryRelatedLinksSection } from "@/app/library/libraryDocPrimitives"
import "./rootsyNaturePalette.css"
import { COLOR_RELATED_LINKS } from "@/app/library/color/colorLibraryNav"
import { getColorPageMeta } from "@/app/library/color/colorLibraryNav"
import { ColorOverviewSection } from "@/app/library/color/sections/ColorOverviewSection"
import { ColorAccentsSection } from "@/app/library/color/sections/ColorAccentsSection"
import { ColorPickerSection } from "@/app/library/color/sections/ColorPickerSection"
import { ColorDataVizSection } from "@/app/library/color/sections/ColorDataVizSection"
import { ColorPaletteSection } from "@/app/library/color/sections/ColorPaletteSection"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
}

export function ColorFoundationView({ sectionId }: Props) {
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
      <LibraryRelatedLinksSection excludeId={sectionId} links={COLOR_RELATED_LINKS} />
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
