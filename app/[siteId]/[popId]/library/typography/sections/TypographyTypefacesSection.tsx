"use client"

import { getTypographyPageMeta } from "@/app/[siteId]/[popId]/library/typography/typographyLibraryNav"
import {
  FontWeightsTable,
  TypeScaleDiagram,
  TypefacesGallery,
  TypographyDocLead,
  TypographyDocSection,
} from "@/app/[siteId]/[popId]/library/typography/TypographyDocPrimitives"
import { TYPE_SCALE_NOTES } from "@/app/[siteId]/[popId]/library/typography/rootsyTypographySystem"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function TypographyTypefacesSection() {
  const meta = getTypographyPageMeta("typography-typefaces")!

  return (
    <LibrarySection
      id="typography-typefaces"
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-10">
        <TypographyDocLead>
          Escala minor third (×{TYPE_SCALE_NOTES.ratio}) sobre base {TYPE_SCALE_NOTES.basePx}px —
          line-heights redondeados al múltiplo de 4px, alineados con espaciado e iconografía.
        </TypographyDocLead>

        <TypographyDocSection
          id="typeface-detail"
          title="Familias en detalle"
        >
          <TypefacesGallery />
        </TypographyDocSection>

        <TypographyDocSection
          id="type-scale"
          title="Escala tipográfica"
        >
          <TypeScaleDiagram />
        </TypographyDocSection>

        <TypographyDocSection
          id="font-weights"
          title="Pesos"
          description="Regular, medium, semibold y bold — medium junto a íconos."
        >
          <FontWeightsTable />
        </TypographyDocSection>
      </div>
    </LibrarySection>
  )
}
