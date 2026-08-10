"use client"

import { getRadiusPageMeta } from "@/app/library/radius/radiusLibraryNav"
import {
  RadiusDocLead,
  RadiusDocSection,
  RadiusExamplesRow,
  RadiusFocusDemo,
  RadiusPrinciplesGrid,
  RadiusScaleGallery,
  RadiusSystemHero,
  RadiusTechnicalDetails,
} from "@/app/library/radius/RadiusDocPrimitives"
import {
  ROOTSY_RADIUS_MANIFESTO,
  ROOTSY_RADIUS_PRINCIPLES,
} from "@/app/library/radius/rootsyRadiusSystem"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function RadiusOverviewSection() {
  const meta = getRadiusPageMeta("radius")!

  return (
    <LibrarySection id="radius" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <RadiusSystemHero />

        <RadiusDocLead className="font-canopy">{ROOTSY_RADIUS_MANIFESTO}</RadiusDocLead>
        <RadiusPrinciplesGrid principles={[...ROOTSY_RADIUS_PRINCIPLES]} />

        <RadiusDocSection
          id="scale"
          title="Escala completa"
          description="De semilla (2px) a copa (22px) — preview en bruma stage."
        >
          <RadiusScaleGallery />
        </RadiusDocSection>

        <RadiusDocSection
          id="focus"
          title="Focus ring"
          description="Radio +2px · savia 400 · offset 2px."
        >
          <RadiusFocusDemo />
        </RadiusDocSection>

        <RadiusDocSection
          id="examples"
          title="En producto"
          description="Input, modal y avatar POP."
        >
          <RadiusExamplesRow />
        </RadiusDocSection>

        <RadiusDocSection
          id="radius-technical"
          title="Detalles técnicos"
          description="Tokens, theme CSS, semántica y guías."
        >
          <RadiusTechnicalDetails />
        </RadiusDocSection>
      </div>
    </LibrarySection>
  )
}
