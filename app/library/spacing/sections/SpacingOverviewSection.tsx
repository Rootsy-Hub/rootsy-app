"use client"

import { getSpacingPageMeta } from "@/app/library/spacing/spacingLibraryNav"
import {
  BaseUnitDemo,
  NatureRhythmTiersGrid,
  NegativeSpacingDemo,
  ProximityDemo,
  SimilarityDemo,
  SpacingDocLead,
  SpacingDocSection,
  SpacingPrinciplesGrid,
  SpacingRangeOverview,
  SpacingSystemHero,
  SpacingTechnicalDetails,
  TokenUsageStrip,
} from "@/app/library/spacing/SpacingDocPrimitives"
import {
  ROOTSY_SPACING_MANIFESTO,
  ROOTSY_SPACING_PRINCIPLES,
} from "@/app/library/spacing/rootsySpacingScale"
import { HANDBOOK_DESIGN_SYSTEM_ROOT } from "@/app/handbook/handbookDesignSystem"
import { LibraryHandbookSource } from "@/app/library/libraryDocPrimitives"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function SpacingOverviewSection() {
  const meta = getSpacingPageMeta("spacing")!

  return (
    <LibrarySection id="spacing" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <SpacingSystemHero />
        <LibraryHandbookSource
          href={`${HANDBOOK_DESIGN_SYSTEM_ROOT}/espaciado-y-proporciones`}
          label="Espaciado y proporciones"
        />
        <SpacingDocLead className="font-canopy">{ROOTSY_SPACING_MANIFESTO}</SpacingDocLead>
        <SpacingPrinciplesGrid principles={[...ROOTSY_SPACING_PRINCIPLES]} />

        <SpacingDocSection
          id="nature-rhythm"
          title="Capas nature"
          description="Seis nombres del ritmo de espaciado. No es un diseño de tarjeta."
        >
          <NatureRhythmTiersGrid />
        </SpacingDocSection>

        <SpacingDocSection
          id="base-unit"
          title="Unidad base de 8 píxeles"
          description="space.100 = 8px — la savia. Todo token es múltiplo de esta unidad."
        >
          <BaseUnitDemo />
        </SpacingDocSection>

        <SpacingDocSection
          id="ranges"
          title="Rangos de uso"
          description="Pequeño, mediano y grande — tres bandas para decidir rápido."
        >
          <SpacingRangeOverview />
        </SpacingDocSection>

        <SpacingDocSection
          id="usage-examples"
          title="Ejemplos visuales"
          description="Mismo token, distintas densidades."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="library-doc-card rounded-xl p-4">
              <p className="font-mono text-xs text-[var(--rootsy-bruma-500)]">space.050 · Rocío</p>
              <TokenUsageStrip gapPx={4} />
            </div>
            <div className="library-doc-card rounded-xl p-4">
              <p className="font-mono text-xs text-[var(--rootsy-bruma-500)]">space.100 · Hoja</p>
              <TokenUsageStrip gapPx={8} />
            </div>
            <div className="library-doc-card rounded-xl p-4">
              <p className="font-mono text-xs text-[var(--rootsy-bruma-500)]">space.200 · Rama</p>
              <TokenUsageStrip gapPx={16} />
            </div>
          </div>
        </SpacingDocSection>

        <SpacingDocSection
          id="negative"
          title="Valores negativos"
          description="Romper el contenedor con intención — bleed, superposición, overlap."
        >
          <NegativeSpacingDemo />
        </SpacingDocSection>

        <SpacingDocSection id="similarity-demo" title="Agrupar por similitud">
          <SimilarityDemo />
        </SpacingDocSection>

        <SpacingDocSection id="proximity-demo" title="Agrupar por proximidad">
          <ProximityDemo />
        </SpacingDocSection>

        <SpacingDocSection
          id="spacing-technical"
          title="Detalles técnicos"
          description="Escala, roles semánticos, negativos y guías."
        >
          <SpacingTechnicalDetails />
        </SpacingDocSection>
      </div>
    </LibrarySection>
  )
}
