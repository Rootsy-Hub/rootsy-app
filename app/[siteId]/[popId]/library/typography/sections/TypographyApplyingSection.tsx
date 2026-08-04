"use client"

import { getTypographyPageMeta } from "@/app/[siteId]/[popId]/library/typography/typographyLibraryNav"
import {
  AccessibilityNotesList,
  ApplyingGuidelineCards,
  HierarchyDemo,
  MetricDemo,
  TypographyDocLead,
  TypographyDocSection,
} from "@/app/[siteId]/[popId]/library/typography/TypographyDocPrimitives"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function TypographyApplyingSection() {
  const meta = getTypographyPageMeta("typography-applying")!

  return (
    <LibrarySection
      id="typography-applying"
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-10">
        <TypographyDocLead>
          Tokens en código, estilos en Figma — mismos nombres, misma jerarquía. Combiná con
          color tokens y space tokens para experiencias coherentes.
        </TypographyDocLead>

        <TypographyDocSection
          id="apply-hierarchy"
          title="Jerarquía visual"
          description="Tamaño, peso y voz — heading, body y metric en una vista."
        >
          <HierarchyDemo />
        </TypographyDocSection>

        <TypographyDocSection
          id="apply-metric"
          title="Metric"
          description="Ledger bold en el número — body.small en la etiqueta."
        >
          <MetricDemo />
        </TypographyDocSection>

        <TypographyDocSection
          id="apply-guidelines"
          title="Guías de uso"
        >
          <ApplyingGuidelineCards />
        </TypographyDocSection>

        <TypographyDocSection
          id="apply-a11y"
          title="Accesibilidad"
          description="rem, contraste, headings semánticos y tamaños mínimos."
        >
          <AccessibilityNotesList />
        </TypographyDocSection>
      </div>
    </LibrarySection>
  )
}
