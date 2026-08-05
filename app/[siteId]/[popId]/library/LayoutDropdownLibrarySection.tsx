"use client"

import {
  DropdownDocLead,
  DropdownDocSection,
  DropdownElevationTable,
  DropdownGuidelinesGrid,
  DropdownLightHeaderDemo,
  DropdownManifestoHero,
  DropdownNightHeaderDemo,
  DropdownPrinciplesGrid,
  DropdownRelatedLinks,
  DropdownRowActionsDemo,
  DropdownSelectFilterDemo,
  DropdownSurfacesTable,
  DropdownTriggersDemo,
} from "@/app/[siteId]/[popId]/library/dropdown/DropdownDocPrimitives"
import {
  ROOTSY_DROPDOWN_LEGACY_MANIFESTO as ROOTSY_DROPDOWN_MANIFESTO,
  ROOTSY_DROPDOWN_LEGACY_PRINCIPLES as ROOTSY_DROPDOWN_PRINCIPLES,
} from "@/app/[siteId]/[popId]/library/dropdown/rootsyDropdownLegacyCatalog"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

type Props = {
  siteId?: string
  popId?: string
}

export function LayoutDropdownLibrarySection({ siteId = "", popId = "" }: Props) {
  return (
    <LibrarySection
      id="dropdown"
      title="Dropdown"
      description="Menú desplegable Radix — superficies light/dark, triggers, separadores y acciones de fila."
    >
      <div className="space-y-10">
        <DropdownManifestoHero />
        <DropdownDocLead>{ROOTSY_DROPDOWN_MANIFESTO}</DropdownDocLead>
        <DropdownPrinciplesGrid principles={ROOTSY_DROPDOWN_PRINCIPLES} />

        <DropdownDocSection
          id="surfaces"
          title="Superficies"
          description="Tokens de content, item, label y separator según el shell donde vive el menú."
        >
          <DropdownSurfacesTable />
        </DropdownDocSection>

        <DropdownDocSection
          id="elevation"
          title="Elevación"
          description="Nivel overlay — token elevation.popover.select (dropdown). Select usa panel propio rounded-lg."
        >
          <DropdownElevationTable />
        </DropdownDocSection>

        <DropdownDocSection
          id="triggers"
          title="Triggers"
          description="RootsIconButton para menús solo-icono · DataWorkspaceSectionMenu en header nocturno. Filtros → Select."
        >
          <DropdownTriggersDemo />
        </DropdownDocSection>

        <DropdownDocSection
          id="patterns"
          title="Patrones en producto"
          description="Select para filtros toolbar, menú de cuenta, selector nocturno y acciones de fila."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <DropdownSelectFilterDemo />
            <DropdownLightHeaderDemo />
            <DropdownNightHeaderDemo />
            <DropdownRowActionsDemo />
          </div>
        </DropdownDocSection>

        <DropdownDocSection id="guidelines" title="Guías Do / Don't">
          <DropdownGuidelinesGrid />
        </DropdownDocSection>

        {siteId && popId ? (
          <DropdownDocSection id="related" title="Fundamentos relacionados">
            <DropdownRelatedLinks siteId={siteId} popId={popId} />
          </DropdownDocSection>
        ) : null}
      </div>
    </LibrarySection>
  )
}
