"use client"

import { getBorderPageMeta } from "@/app/[siteId]/[popId]/library/border/borderLibraryNav"
import {
  BorderColorTokensTable,
  BorderDocLead,
  BorderDocSection,
  BorderGuidelinesGrid,
  BorderManifestoHero,
  BorderPairingGallery,
  BorderPairingsTable,
  BorderPrinciplesGrid,
  BorderSegmentDemo,
  BorderSemanticTable,
  BorderWidthTable,
} from "@/app/[siteId]/[popId]/library/border/BorderDocPrimitives"
import {
  ROOTSY_BORDER_MANIFESTO,
  ROOTSY_BORDER_PRINCIPLES,
} from "@/app/[siteId]/[popId]/library/border/rootsyBorderSystem"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function BorderOverviewSection() {
  const meta = getBorderPageMeta("border")!

  return (
    <LibrarySection id="border" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <BorderManifestoHero />
        <BorderDocLead>{ROOTSY_BORDER_MANIFESTO}</BorderDocLead>
        <BorderPrinciplesGrid principles={ROOTSY_BORDER_PRINCIPLES} />

        <BorderDocSection
          id="width"
          title="Ancho de borde"
          description="border.width · border.width.selected · border.width.focused"
        >
          <BorderWidthTable />
          <BorderPairingGallery />
        </BorderDocSection>

        <BorderDocSection
          id="color"
          title="Color de borde"
          description="Emparejar con ancho — canopy en selección y foco."
        >
          <BorderColorTokensTable />
          <BorderPairingsTable />
        </BorderDocSection>

        <BorderDocSection
          id="states"
          title="Estados en producto"
          description="Segment, focus ring y validación — demos interactivos visuales."
        >
          <BorderSegmentDemo />
        </BorderDocSection>

        <BorderDocSection
          id="semantic"
          title="Mapeo semántico"
          description="Formularios, librería y modales."
        >
          <BorderSemanticTable />
        </BorderDocSection>

        <BorderDocSection id="guidelines" title="Guías Do / Don't">
          <BorderGuidelinesGrid />
        </BorderDocSection>
      </div>
    </LibrarySection>
  )
}
