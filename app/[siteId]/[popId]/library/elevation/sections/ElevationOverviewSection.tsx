"use client"

import { getElevationPageMeta } from "@/app/[siteId]/[popId]/library/elevation/elevationLibraryNav"
import {
  ElevationDocLead,
  ElevationDocSection,
  ElevationInteractionDemo,
  ElevationLevelsGallery,
  ElevationModalPreview,
  ElevationOverflowDemo,
  ElevationPrinciplesGrid,
  ElevationStackDemo,
  ElevationSurfacesCompare,
  ElevationSystemHero,
  ElevationTechnicalDetails,
  SunkenVsNeutralCard,
} from "@/app/[siteId]/[popId]/library/elevation/ElevationDocPrimitives"
import {
  ROOTSY_ELEVATION_MANIFESTO,
  ROOTSY_ELEVATION_PRINCIPLES,
} from "@/app/[siteId]/[popId]/library/elevation/rootsyElevationSystem"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function ElevationOverviewSection() {
  const meta = getElevationPageMeta("elevation")!

  return (
    <LibrarySection id="elevation" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <ElevationSystemHero />
        <ElevationDocLead className="font-canopy">{ROOTSY_ELEVATION_MANIFESTO}</ElevationDocLead>
        <ElevationPrinciplesGrid principles={[...ROOTSY_ELEVATION_PRINCIPLES]} />

        <ElevationDocSection
          id="levels"
          title="Niveles"
          description="Sunken → default → raised → overlay — profundidad con bruma y sombra."
        >
          <ElevationLevelsGallery />
          <ElevationStackDemo />
        </ElevationDocSection>

        <ElevationDocSection
          id="shadows"
          title="Sombras y overlay"
          description="Matiz bosque — raised y overlay siempre emparejados."
        >
          <ElevationModalPreview />
          <ElevationOverflowDemo />
        </ElevationDocSection>

        <ElevationDocSection
          id="surfaces"
          title="Superficies claro / oscuro"
          description="Workspace sube hacia blanco; POS separa capas con sombra."
        >
          <ElevationSurfacesCompare />
        </ElevationDocSection>

        <ElevationDocSection
          id="sunken-neutral"
          title="Sunken vs transparente"
          description="Opaco para agrupar · transparente cuando hereda del padre."
        >
          <SunkenVsNeutralCard />
        </ElevationDocSection>

        <ElevationDocSection
          id="interaction"
          title="Hover y pressed"
          description="Cambio de superficie antes que subir de nivel."
        >
          <ElevationInteractionDemo />
        </ElevationDocSection>

        <ElevationDocSection
          id="elevation-technical"
          title="Detalles técnicos"
          description="Sombras, estados, tokens semánticos, z-index y guías."
        >
          <ElevationTechnicalDetails />
        </ElevationDocSection>
      </div>
    </LibrarySection>
  )
}
