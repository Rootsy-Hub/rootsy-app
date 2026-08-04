"use client"

import { getElevationPageMeta } from "@/app/[siteId]/[popId]/library/elevation/elevationLibraryNav"
import {
  ElevationDocLead,
  ElevationDocSection,
  ElevationGuidelinesGrid,
  ElevationInteractionDemo,
  ElevationInteractionTable,
  ElevationLevelsGallery,
  ElevationManifestoHero,
  ElevationModalPreview,
  ElevationOverflowDemo,
  ElevationPrinciplesGrid,
  ElevationShadowTokensTable,
  ElevationStackDemo,
  ElevationSurfacesCompare,
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
        <ElevationManifestoHero />
        <ElevationDocLead>{ROOTSY_ELEVATION_MANIFESTO}</ElevationDocLead>
        <ElevationPrinciplesGrid principles={ROOTSY_ELEVATION_PRINCIPLES} />

        <ElevationDocSection
          id="levels"
          title="Niveles de elevación"
          description="Sunken → default → raised → overlay · overflow como sombra de scroll."
        >
          <ElevationLevelsGallery />
          <ElevationStackDemo />
        </ElevationDocSection>

        <ElevationDocSection
          id="shadows"
          title="Sombras · tinte canopy"
          description="Raised y overlay siempre emparejados — valores oklch verdes, no gris plano."
        >
          <ElevationShadowTokensTable />
          <ElevationModalPreview />
          <ElevationOverflowDemo />
        </ElevationDocSection>

        <ElevationDocSection
          id="surfaces"
          title="Superficies light / dark"
          description="En dark las capas altas se aclaran — como luz filtrada entre hojas."
        >
          <ElevationSurfacesCompare />
        </ElevationDocSection>

        <ElevationDocSection
          id="sunken-neutral"
          title="Sunken vs neutral"
          description="Opaco para agrupar en la misma capa · transparente cuando el padre define el nivel."
        >
          <SunkenVsNeutralCard />
        </ElevationDocSection>

        <ElevationDocSection
          id="interaction"
          title="Estados hover / pressed"
          description="Cambio de color de superficie — preferido. Transiciones de nivel solo con moderación."
        >
          <ElevationInteractionDemo />
          <ElevationInteractionTable />
        </ElevationDocSection>

        <ElevationDocSection id="guidelines" title="Guías Do / Don't">
          <ElevationGuidelinesGrid />
        </ElevationDocSection>
      </div>
    </LibrarySection>
  )
}
