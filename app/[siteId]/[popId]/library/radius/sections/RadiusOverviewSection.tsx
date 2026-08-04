"use client"

import { getRadiusPageMeta } from "@/app/[siteId]/[popId]/library/radius/radiusLibraryNav"
import {
  RadiusDocLead,
  RadiusDocSection,
  RadiusExamplesRow,
  RadiusFocusDemo,
  RadiusGuidelinesGrid,
  RadiusManifestoHero,
  RadiusPrinciplesGrid,
  RadiusScaleGallery,
  RadiusSemanticTable,
  RadiusThemeNote,
  RadiusTokensTable,
} from "@/app/[siteId]/[popId]/library/radius/RadiusDocPrimitives"
import {
  ROOTSY_RADIUS_MANIFESTO,
  ROOTSY_RADIUS_PRINCIPLES,
} from "@/app/[siteId]/[popId]/library/radius/rootsyRadiusSystem"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function RadiusOverviewSection() {
  const meta = getRadiusPageMeta("radius")!

  return (
    <LibrarySection id="radius" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <RadiusManifestoHero />
        <RadiusDocLead>{ROOTSY_RADIUS_MANIFESTO}</RadiusDocLead>
        <RadiusPrinciplesGrid principles={ROOTSY_RADIUS_PRINCIPLES} />

        <RadiusDocSection
          id="scale"
          title="Escala de radios"
          description="De radius.xsmall (2px) a radius.full — preview visual."
        >
          <RadiusScaleGallery />
          <RadiusTokensTable />
        </RadiusDocSection>

        <RadiusDocSection
          id="focus"
          title="Focus ring"
          description="Offset 2px · radio del anillo = radio del elemento + 2px."
        >
          <RadiusFocusDemo />
        </RadiusDocSection>

        <RadiusDocSection
          id="examples"
          title="Ejemplos en producto"
          description="Input, modal y avatar POP."
        >
          <RadiusExamplesRow />
        </RadiusDocSection>

        <RadiusDocSection id="theme" title="Theme CSS">
          <RadiusThemeNote />
        </RadiusDocSection>

        <RadiusDocSection id="semantic" title="Mapeo semántico">
          <RadiusSemanticTable />
        </RadiusDocSection>

        <RadiusDocSection id="guidelines" title="Guías Do / Don't">
          <RadiusGuidelinesGrid />
        </RadiusDocSection>
      </div>
    </LibrarySection>
  )
}
