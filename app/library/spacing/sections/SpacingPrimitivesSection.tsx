"use client"

import { getSpacingPageMeta } from "@/app/library/spacing/spacingLibraryNav"
import {
  BoxPrimitiveDemo,
  CombinedPrimitivesDemo,
  FigmaAutoLayoutComparison,
  InlinePrimitiveDemo,
  PrimitiveMetaCards,
  SpacingDocLead,
  SpacingDocSection,
  StackPrimitiveDemo,
} from "@/app/library/spacing/SpacingDocPrimitives"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function SpacingPrimitivesSection() {
  const meta = getSpacingPageMeta("spacing-primitives")!

  return (
    <LibrarySection
      id="spacing-primitives"
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-10">
        <SpacingDocLead>
          Los primitivos resuelven padding, gap y dirección con tokens del sistema.
          Box envuelve la superficie; Inline o Stack organizan adentro — capas separadas,
          como en código, no un solo frame genérico.
        </SpacingDocLead>

        <SpacingDocSection
          id="primitives-overview"
          title="Tres primitivos"
          description="Box, Inline y Stack — building blocks del layout Rootsy."
        >
          <PrimitiveMetaCards />
        </SpacingDocSection>

        <SpacingDocSection
          id="primitive-box"
          title="Box"
          description="Contenedor genérico con acceso a tokens de espaciado y superficie."
        >
          <BoxPrimitiveDemo />
        </SpacingDocSection>

        <SpacingDocSection
          id="primitive-inline"
          title="Inline"
          description="Hijos en fila horizontal con gap uniforme."
        >
          <InlinePrimitiveDemo />
        </SpacingDocSection>

        <SpacingDocSection
          id="primitive-stack"
          title="Stack"
          description="Hijos apilados verticalmente — formularios, secciones, headers."
        >
          <StackPrimitiveDemo />
        </SpacingDocSection>

        <SpacingDocSection
          id="primitive-combined"
          title="Composición"
          description="En código las capas están separadas; en Figma suele verse un solo frame con auto layout."
        >
          <CombinedPrimitivesDemo />
        </SpacingDocSection>

        <SpacingDocSection
          id="figma-handover"
          title="Figma Auto Layout"
          description="Para diseñadores: mapeo directo entre primitivos y frames con auto layout."
        >
          <FigmaAutoLayoutComparison />
          <p className="max-w-3xl text-sm text-muted-foreground">
            Usá tokens de espacio en Figma donde sea posible. El handover mejora cuando
            el gap del diseño coincide con{" "}
            <code className="font-mono text-xs">space.200</code> en código — no 15px
            arbitrarios.
          </p>
        </SpacingDocSection>
      </div>
    </LibrarySection>
  )
}
