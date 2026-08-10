"use client"

import { getTypographyPageMeta } from "@/app/library/typography/typographyLibraryNav"
import {
  TypographyAccessibilityCard,
  TypographyDocSection,
  TypographyGuidelinesGrid,
  TypographyMetricComparison,
  TypographyProductScreenDemo,
  TypographyReadingDemo,
} from "@/app/library/typography/TypographyDocPrimitives"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function TypographyApplyingSection() {
  const meta = getTypographyPageMeta("typography-applying")!

  return (
    <LibrarySection
      id="typography-applying"
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-10">
        <TypographyDocSection
          id="apply-screen"
          title="Pantalla de formulario"
          description="Título, ayuda, campo y monto — la jerarquía que se repite en el producto."
        >
          <TypographyProductScreenDemo />
        </TypographyDocSection>

        <TypographyDocSection
          id="apply-metric"
          title="Números"
          description="El monto destaca; la etiqueta acompaña sin competir."
        >
          <TypographyMetricComparison />
        </TypographyDocSection>

        <TypographyDocSection
          id="apply-reading"
          title="Lectura larga"
          description="Source Sans 3 solo cuando hay prosa — no en controles."
        >
          <TypographyReadingDemo />
        </TypographyDocSection>

        <TypographyDocSection id="apply-guidelines" title="Guías rápidas">
          <TypographyGuidelinesGrid />
        </TypographyDocSection>

        <TypographyDocSection
          id="apply-a11y"
          title="Accesibilidad"
          description="Tres reglas que cubren el 90% de los casos."
        >
          <TypographyAccessibilityCard />
        </TypographyDocSection>
      </div>
    </LibrarySection>
  )
}
