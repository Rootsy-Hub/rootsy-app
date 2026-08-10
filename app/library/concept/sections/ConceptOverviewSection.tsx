"use client"

import {
  ConceptBrandClosing,
  ConceptBrandHero,
  ConceptDesignPrinciplesGrid,
  ConceptDocLead,
  ConceptDocSection,
  ConceptExamplesGrid,
  ConceptValuesGrid,
} from "@/app/library/concept/ConceptDocPrimitives"
import { getConceptPageMeta } from "@/app/library/concept/conceptLibraryNav"
import {
  ROOTSY_BRAND_MANIFESTO,
  ROOTSY_BRAND_VALUES,
  ROOTSY_DESIGN_MANIFESTO,
  ROOTSY_DESIGN_PRINCIPLES,
} from "@/app/library/concept/rootsyConceptSystem"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function ConceptOverviewSection() {
  const meta = getConceptPageMeta("concept")!

  return (
    <LibrarySection id="concept" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <ConceptBrandHero />

        <ConceptDocSection
          id="concept-brand"
          title="Concepto de marca"
          description="Qué es Rootsy como producto y qué valores sostiene la marca."
        >
          <ConceptDocLead>{ROOTSY_BRAND_MANIFESTO}</ConceptDocLead>
          <ConceptBrandClosing />
          <ConceptValuesGrid principles={[...ROOTSY_BRAND_VALUES]} />
        </ConceptDocSection>

        <ConceptDocSection
          id="concept-design"
          title="Concepto de diseño"
          description="Cómo se traduce la marca en interfaz."
        >
          <ConceptDocLead>{ROOTSY_DESIGN_MANIFESTO}</ConceptDocLead>
          <ConceptDesignPrinciplesGrid principles={[...ROOTSY_DESIGN_PRINCIPLES]} />
        </ConceptDocSection>

        <ConceptDocSection
          id="concept-examples"
          title="Ejemplos"
          description="Formas claras, bruma de fondo y un verde que aparece solo donde importa."
        >
          <ConceptExamplesGrid />
        </ConceptDocSection>
      </div>
    </LibrarySection>
  )
}
