"use client"

import { getGridPageMeta } from "@/app/library/grid/gridLibraryNav"
import {
  GridAlignmentDemo,
  GridAnatomyDiagram,
  GridCenteredSpanDemo,
  GridDocLead,
  GridDocSection,
  GridPrinciplesGrid,
  GridSpanGallery,
  GridSystemHero,
  GridTechnicalDetails,
  LayoutShellDiagram,
  NestedGridDemo,
} from "@/app/library/grid/GridDocPrimitives"
import {
  ROOTSY_GRID_MANIFESTO,
  ROOTSY_GRID_PRINCIPLES,
} from "@/app/library/grid/rootsyGridSystem"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function GridOverviewSection() {
  const meta = getGridPageMeta("grid")!

  return (
    <LibrarySection id="grid" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <GridSystemHero />
        <GridDocLead className="font-canopy">{ROOTSY_GRID_MANIFESTO}</GridDocLead>
        <GridPrinciplesGrid principles={[...ROOTSY_GRID_PRINCIPLES]} />

        <GridDocSection
          id="grid-shell"
          title="Grilla en el layout"
          description="Solo el claro principal — nav, panel y overlays quedan fuera."
        >
          <LayoutShellDiagram />
        </GridDocSection>

        <GridDocSection
          id="grid-anatomy"
          title="Anatomía"
          description="Surcos, sendas y orillas — tres elementos que definen la estructura horizontal."
        >
          <GridAnatomyDiagram />
        </GridDocSection>

        <GridDocSection
          id="grid-spans"
          title="Ocupar surcos"
          description="Contenido en 12, 8, 6 o 4 columnas — o centrado en 8 y 10."
        >
          <GridSpanGallery />
          <GridCenteredSpanDemo />
        </GridDocSection>

        <GridDocSection
          id="grid-alignment"
          title="Qué alinear"
          description="Contenedores top-level a la grilla; elementos pequeños con space tokens."
        >
          <GridAlignmentDemo />
        </GridDocSection>

        <GridDocSection
          id="grid-nested"
          title="Grillas anidadas"
          description="Dentro de un card ancho, space tokens primero — grilla interna solo si hace falta."
        >
          <NestedGridDemo />
        </GridDocSection>

        <GridDocSection
          id="grid-technical"
          title="Detalles técnicos"
          description="Anatomía, spans, breakpoints y guías de alineación."
        >
          <GridTechnicalDetails />
        </GridDocSection>
      </div>
    </LibrarySection>
  )
}
