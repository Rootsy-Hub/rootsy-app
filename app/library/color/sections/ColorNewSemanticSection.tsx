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
          Los tokens nombran propósito, no familia decorativa. --color-accion es savia 600 en
          cualquier atmósfera. Atención es sol; peligro es lava; información es cielo de día.
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
          doText="Nombrá el propósito y tomá el paso de la paleta. --color-accion es savia 600 en cualquier pantalla."
          dontText="No pongas un hex a mano ni uses lava para atención, sol para error o savia para pintar un fondo entero."
        />
      </div>
    </LibrarySection>
  )
}
