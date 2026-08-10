"use client"

import { getColorNewPageMeta } from "@/app/library/color/colorNewLibraryNav"
import {
  ColorDocLead,
  ColorDocSection,
  GuidelinePair,
} from "@/app/library/color/ColorDocPrimitives"
import {
  ColorFamiliesRow,
  ColorGradientGallery,
  ColorSystemHero,
  PairingCard,
  PosSplitDemo,
  ThemeGallery,
} from "@/app/library/color/ColorSystemDocPrimitives"
import { ColorTechnicalDetails } from "@/app/library/color/ColorTechnicalDetails"
import {
  ROOTSY_COLOR_MANIFESTO,
  ROOTSY_COLOR_PRINCIPLES,
  ROOTSY_COMPLEMENTARY_PAIRINGS,
} from "@/app/library/color/rootsyColorSystem"
import { COLOR_NEW_GRADIENTS } from "@/app/library/color/rootsyNaturePalette"
import { LibraryPrinciplesGrid } from "@/app/library/libraryDocPrimitives"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function ColorNewOverviewSection() {
  const meta = getColorNewPageMeta("colors-new")!

  return (
    <LibrarySection id="colors-new" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <ColorSystemHero />
        <ColorDocLead>{ROOTSY_COLOR_MANIFESTO}</ColorDocLead>
        <LibraryPrinciplesGrid principles={[...ROOTSY_COLOR_PRINCIPLES]} />

        <ColorDocSection
          id="colors-new-architecture"
          title="Las tres familias"
          description="Todo el producto se reduce a sombra, bruma y savia — tres familias naturales."
        >
          <ColorFamiliesRow />
        </ColorDocSection>

        <ColorDocSection
          id="colors-new-split"
          title="Split POS"
          description="Sombra bajo el dosel y bruma neblinosa — el par natural del mostrador."
        >
          <PosSplitDemo />
        </ColorDocSection>

        <ColorDocSection
          id="colors-new-themes-preview"
          title="Contextos de producto"
          description="POS, workspace, marketing y librería — composiciones de las tres familias."
        >
          <ThemeGallery />
        </ColorDocSection>

        <ColorDocSection
          id="colors-new-key-pairings"
          title="Complementarios clave"
          description="Armonías que ya están en producción."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {ROOTSY_COMPLEMENTARY_PAIRINGS.slice(0, 4).map((pairing) => (
              <PairingCard key={pairing.id} pairing={pairing} />
            ))}
          </div>
        </ColorDocSection>

        <ColorDocSection
          id="colors-new-gradients"
          title="Gradientes"
          description="Solo gradientes con función en producto."
        >
          <ColorGradientGallery items={COLOR_NEW_GRADIENTS} />
        </ColorDocSection>

        <GuidelinePair
          doText="Usá savia 600 para toda acción; bruma 100 para todo ticket; sombra 600 para todo catálogo bajo el dosel."
          dontText="No uses grises slate de dashboard — sombra tiene matiz bosque; bruma es neblina, no gris neutro."
        />

        <ColorDocSection
          id="colors-new-technical"
          title="Detalles técnicos"
          description="Tokens, temas, roles, estados y contraste — referencia del manual."
        >
          <ColorTechnicalDetails />
        </ColorDocSection>
      </div>
    </LibrarySection>
  )
}
