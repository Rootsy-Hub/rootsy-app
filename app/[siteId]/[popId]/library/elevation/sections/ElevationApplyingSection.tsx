"use client"

import { getElevationPageMeta } from "@/app/[siteId]/[popId]/library/elevation/elevationLibraryNav"
import {
  ElevationDocLead,
  ElevationDocSection,
  SemanticTokensTable,
  ZIndexTable,
} from "@/app/[siteId]/[popId]/library/elevation/ElevationDocPrimitives"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function ElevationApplyingSection() {
  const meta = getElevationPageMeta("elevation-applying")!

  return (
    <LibrarySection
      id="elevation-applying"
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-10">
        <ElevationDocLead className="font-canopy">
          Empezá por el nivel semántico — elevation.card.library, elevation.dialog.article.
          Cada overlay necesita su z-index aunque comparta el mismo estilo de sombra.
        </ElevationDocLead>

        <ElevationDocSection
          id="semantic-tokens"
          title="Tokens semánticos"
          description="Mapeo a componentes reales del producto Rootsy."
        >
          <SemanticTokensTable />
        </ElevationDocSection>

        <ElevationDocSection
          id="z-index"
          title="Z-index"
          description="Orden de apilamiento — modales, dropdowns, tooltips."
        >
          <ZIndexTable />
        </ElevationDocSection>
      </div>
    </LibrarySection>
  )
}
