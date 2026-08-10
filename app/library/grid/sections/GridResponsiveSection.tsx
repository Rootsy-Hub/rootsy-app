"use client"

import { getGridPageMeta } from "@/app/library/grid/gridLibraryNav"
import {
  FixedVsFluidDemo,
  GridBreakpointTable,
  GridBreakpointVisualizer,
  GridDocLead,
  GridDocSection,
  GridTypesComparison,
} from "@/app/library/grid/GridDocPrimitives"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function GridResponsiveSection() {
  const meta = getGridPageMeta("grid-responsive")!

  return (
    <LibrarySection
      id="grid-responsive"
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-10">
        <GridDocLead>
          Los breakpoints responden al viewport completo — no al ancho del main cuando
          colapsás el sidebar. En cada rango cambian surcos, sendas y orillas.
        </GridDocLead>

        <GridDocSection
          id="breakpoints-table"
          title="Breakpoints"
          description="Valores default Rootsy — alineados a tokens space.* del sistema de espaciado."
        >
          <GridBreakpointTable />
        </GridDocSection>

        <GridDocSection
          id="breakpoints-visual"
          title="Surcos por dispositivo"
          description="2 en móvil · 6 en tablet · 12 en desktop."
        >
          <GridBreakpointVisualizer />
        </GridDocSection>

        <GridDocSection
          id="grid-types"
          title="Tipos de grilla"
          description="Fixed-wide por defecto · narrow para lectura · fluid para tableros sin techo."
        >
          <GridTypesComparison />
        </GridDocSection>

        <GridDocSection
          id="fixed-vs-fluid"
          title="Fixed vs fluid"
          description="Por debajo del max-width, fixed se comporta como fluid."
        >
          <FixedVsFluidDemo />
        </GridDocSection>
      </div>
    </LibrarySection>
  )
}
