"use client"

import { getTypographyPageMeta } from "@/app/[siteId]/[popId]/library/typography/typographyLibraryNav"
import {
  AllTypographyStyles,
  CodeBlockDemo,
  TypographyDocLead,
  TypographyDocSection,
  TypographyManifestoHero,
  TypographyPrinciplesGrid,
  TypefacesGallery,
  VoiceComparisonDemo,
} from "@/app/[siteId]/[popId]/library/typography/TypographyDocPrimitives"
import {
  ROOTSY_TYPOGRAPHY_MANIFESTO,
  ROOTSY_TYPOGRAPHY_PRINCIPLES,
} from "@/app/[siteId]/[popId]/library/typography/rootsyTypographySystem"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function TypographyOverviewSection() {
  const meta = getTypographyPageMeta("typography")!

  return (
    <LibrarySection id="typography" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <TypographyManifestoHero />
        <TypographyDocLead>{ROOTSY_TYPOGRAPHY_MANIFESTO}</TypographyDocLead>
        <TypographyPrinciplesGrid principles={ROOTSY_TYPOGRAPHY_PRINCIPLES} />

        <TypographyDocSection
          id="typefaces"
          title="Familias Rootsy"
          description="Canopy, Stream, Ledger y Bark — cada una con un hábitat en el producto."
        >
          <TypefacesGallery />
        </TypographyDocSection>

        <TypographyDocSection
          id="voices"
          title="Tres voces en acción"
          description="UI, lectura y números — side by side."
        >
          <VoiceComparisonDemo />
        </TypographyDocSection>

        <TypographyDocSection
          id="text-styles"
          title="Estilos y tokens"
          description="Heading, body, metric y code — valores en rem alineados a Atlassian."
        >
          <AllTypographyStyles />
        </TypographyDocSection>

        <TypographyDocSection
          id="code-preview"
          title="Code · Bark"
          description="Monoespaciada para bloques — no para UI general."
        >
          <CodeBlockDemo />
        </TypographyDocSection>
      </div>
    </LibrarySection>
  )
}
