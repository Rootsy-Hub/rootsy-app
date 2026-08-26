"use client"

import { getTypographyPageMeta } from "@/app/library/typography/typographyLibraryNav"
import {
  TypographyDocSection,
  TypographyScaleLadder,
  TypographyTokensReference,
  TypographyTypefacesDetail,
  TypographyWeightsDemo,
} from "@/app/library/typography/TypographyDocPrimitives"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function TypographyTypefacesSection() {
  const meta = getTypographyPageMeta("typography-typefaces")!

  return (
    <LibrarySection
      id="typography-typefaces"
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-10">
        <TypographyDocSection
          id="typeface-families"
          title="Familias"
          description="Inter para la UI y los números. Nunito Sans para leer de corrido."
        >
          <TypographyTypefacesDetail />
        </TypographyDocSection>

        <TypographyDocSection
          id="type-scale"
          title="Escala visual"
          description="Los cinco tamaños del día a día, con token al lado."
        >
          <TypographyScaleLadder />
        </TypographyDocSection>

        <TypographyDocSection
          id="font-weights"
          title="Pesos"
          description="Regular, medium, semibold y bold — medium junto a íconos."
        >
          <TypographyWeightsDemo />
        </TypographyDocSection>

        <TypographyDocSection
          id="tokens"
          title="Tokens"
          description="Referencia técnica compacta — heading, body y metric."
        >
          <TypographyTokensReference />
        </TypographyDocSection>
      </div>
    </LibrarySection>
  )
}
