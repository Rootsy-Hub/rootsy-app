"use client"

import { getBorderPageMeta } from "@/app/library/border/borderLibraryNav"
import {
  BorderDocLead,
  BorderDocSection,
  BorderPairingGallery,
  BorderPrinciplesGrid,
  BorderSegmentDemo,
  BorderSystemHero,
  BorderTechnicalDetails,
} from "@/app/library/border/BorderDocPrimitives"
import {
  ROOTSY_BORDER_MANIFESTO,
  ROOTSY_BORDER_PRINCIPLES,
} from "@/app/library/border/rootsyBorderSystem"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function BorderOverviewSection() {
  const meta = getBorderPageMeta("border")!

  return (
    <LibrarySection id="border" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <BorderSystemHero />
        <BorderDocLead className="font-canopy">{ROOTSY_BORDER_MANIFESTO}</BorderDocLead>
        <BorderPrinciplesGrid principles={[...ROOTSY_BORDER_PRINCIPLES]} />

        <BorderDocSection
          id="width-color"
          title="Ancho y color"
          description="Vena 1px · selección 2px · foco ring savia 400."
        >
          <BorderPairingGallery />
        </BorderDocSection>

        <BorderDocSection
          id="states"
          title="Estados en producto"
          description="Segment, selección y foco — demos visuales."
        >
          <BorderSegmentDemo />
        </BorderDocSection>

        <BorderDocSection
          id="border-technical"
          title="Detalles técnicos"
          description="Tokens, pairings, semántica y guías."
        >
          <BorderTechnicalDetails />
        </BorderDocSection>
      </div>
    </LibrarySection>
  )
}
