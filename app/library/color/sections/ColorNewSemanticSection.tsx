"use client"

import { getColorNewPageMeta } from "@/app/library/color/colorNewLibraryNav"
import {
  ColorSemanticPreview,
  InteractionStatesGallery,
  ProductRoleTable,
} from "@/app/library/color/ColorSystemDocPrimitives"
import {
  ColorDocLead,
  ColorDocSection,
  GuidelinePair,
} from "@/app/library/color/ColorDocPrimitives"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

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
          Los tokens nombran propósito, no familia decorativa. --color-action es savia 600 en
          POS y workspace; en marketing el mismo token mapea a savia 500. Aviso y peligro usan
          colores funcionales fuera de la paleta principal.
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
          description="Mapeo directo a las tres familias — sombra, bruma, savia."
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
          doText="Un token, un hex — referenciá variables CSS de tema (--color-shell, --color-action)."
          dontText="No uses savia en auroras blur ni atmósfera en formularios operativos."
        />
      </div>
    </LibrarySection>
  )
}
