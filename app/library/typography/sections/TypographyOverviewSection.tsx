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
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function TypographyOverviewSection() {
  const meta = getTypographyPageMeta("typography")!

  return (
    <LibrarySection id="typography" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <TypographyIntroHero />
        <TypographyDocLead>{ROOTSY_TYPOGRAPHY_MANIFESTO}</TypographyDocLead>
        <TypographyPrinciplesGrid principles={[...ROOTSY_TYPOGRAPHY_PRINCIPLES]} />

        <TypographyDocSection
          id="typography-voices"
          title="Tres voces"
          description="UI, lectura y números — cada una con un rol claro."
        >
          <TypographyVoicesRow />
        </TypographyDocSection>

        <TypographyDocSection
          id="typography-scale"
          title="Escala"
          description="Cinco niveles que cubren la mayoría de las pantallas."
        >
          <TypographyScalePreview />
        </TypographyDocSection>

        <TypographyDocSection
          id="typography-context"
          title="En contexto"
          description="Cómo conviven título, metadatos y montos en una sola vista."
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
