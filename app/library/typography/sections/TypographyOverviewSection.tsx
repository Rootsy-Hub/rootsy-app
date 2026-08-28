"use client"

import { getTypographyPageMeta } from "@/app/library/typography/typographyLibraryNav"
import {
  TypographyDocLead,
  TypographyDocSection,
  TypographyInContextDemo,
  TypographyIntroHero,
  TypographyPrinciplesGrid,
  TypographyScalePreview,
  TypographyVoicesRow,
} from "@/app/library/typography/TypographyDocPrimitives"
import { TypographyTechnicalDetails } from "@/app/library/typography/TypographyTechnicalDetails"
import {
  ROOTSY_TYPOGRAPHY_MANIFESTO,
  ROOTSY_TYPOGRAPHY_PRINCIPLES,
} from "@/app/library/typography/rootsyTypographySystem"
import { HANDBOOK_DESIGN_SYSTEM_ROOT } from "@/app/handbook/handbookDesignSystem"
import { LibraryHandbookSource } from "@/app/library/libraryDocPrimitives"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function TypographyOverviewSection() {
  const meta = getTypographyPageMeta("typography")!

  return (
    <LibrarySection id="typography" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <TypographyIntroHero />
        <LibraryHandbookSource
          href={`${HANDBOOK_DESIGN_SYSTEM_ROOT}/tipografia`}
          label="Tipografía"
        />
        <TypographyDocLead>{ROOTSY_TYPOGRAPHY_MANIFESTO}</TypographyDocLead>
        <TypographyPrinciplesGrid principles={[...ROOTSY_TYPOGRAPHY_PRINCIPLES]} />

        <TypographyDocSection
          id="typography-voices"
          title="Familias tipográficas"
          description="Inter en chrome y montos. Nunito Sans en la prosa."
        >
          <TypographyVoicesRow />
        </TypographyDocSection>

        <TypographyDocSection
          id="typography-scale"
          title="Escalas"
          description="Corta y parte de 16px. Si hace falta más énfasis, se sube o se baja un nivel."
        >
          <TypographyScalePreview />
        </TypographyDocSection>

        <TypographyDocSection
          id="typography-context"
          title="Jerarquías"
          description="Título, contexto, cuerpo, dato. Cómo conviven en una sola vista."
        >
          <TypographyInContextDemo />
        </TypographyDocSection>

        <TypographyDocSection
          id="typography-technical"
          title="Detalles técnicos"
          description="Tokens, escala completa, pesos y guías de implementación — referencia del manual."
        >
          <TypographyTechnicalDetails />
        </TypographyDocSection>
      </div>
    </LibrarySection>
  )
}
