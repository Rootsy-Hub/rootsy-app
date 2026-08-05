"use client"

import { getColorNewPageMeta } from "@/app/[siteId]/[popId]/library/color/colorNewLibraryNav"
import {
  ColorSemanticPreview,
  InteractionStatesGallery,
  ProductRoleTable,
} from "@/app/[siteId]/[popId]/library/color/ColorSystemDocPrimitives"
import {
  ColorDocLead,
  ColorDocSection,
  GuidelinePair,
} from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function ColorNewSemanticSection() {
  const meta = getColorNewPageMeta("colors-new-semantic")!

  return (
    <LibrarySection
      id="colors-new-semantic"
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-10">
        <ColorDocLead>
          Los tokens nombran propósito, no familia decorativa. Savia 600 es siempre
          --color-action-primary en POS y workspace; landing tiene su propio CTA; aviso
          y peligro usan colores funcionales fuera de la paleta principal.
        </ColorDocLead>

        <ColorDocSection
          id="semantic-overview"
          title="Mapa semántico"
          description="Superficies, acción y foco — los tokens que más se repiten en producto."
        >
          <ColorSemanticPreview />
        </ColorDocSection>

        <ColorDocSection
          id="semantic-roles"
          title="Roles en UI"
          description="Mapeo directo a las cuatro familias."
        >
          <ProductRoleTable />
        </ColorDocSection>

        <ColorDocSection
          id="semantic-states"
          title="Estados interactivos"
          description="Reposo, hover, foco — workspace y POS."
        >
          <InteractionStatesGallery />
        </ColorDocSection>

        <GuidelinePair
          doText="Un token, un hex — referenciá variables CSS en componentes."
          dontText="No uses --color-action-landing en workspace ni savia en auroras blur."
        />
      </div>
    </LibrarySection>
  )
}
