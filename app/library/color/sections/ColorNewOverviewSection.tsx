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
import { LibraryHandbookSource, LibraryPrinciplesGrid } from "@/app/library/libraryDocPrimitives"
import { HANDBOOK_DESIGN_SYSTEM_ROOT } from "@/app/handbook/handbookDesignSystem"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function ColorNewOverviewSection() {
  const meta = getColorNewPageMeta("colors-new")!

  return (
    <LibrarySection id="colors-new" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <ColorSystemHero />
        <LibraryHandbookSource
          href={`${HANDBOOK_DESIGN_SYSTEM_ROOT}/color`}
          label="Color"
        />
        <ColorDocLead>{ROOTSY_COLOR_MANIFESTO}</ColorDocLead>
        <LibraryPrinciplesGrid principles={[...ROOTSY_COLOR_PRINCIPLES]} />

        <ColorDocSection
          id="colors-new-architecture"
          title="Atmósferas y funcionales"
          description="Éter, luz filtrada y sombra pintan el aire. Savia, cielo, sol y lava dicen qué ocurre."
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
          description="POS, workspace, bruma oscura, marketing y librería — composiciones de las atmósferas."
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
          doText="Una atmósfera por pantalla. Savia para acción. Cielo, sol o lava solo cuando hay que decir qué ocurre."
          dontText="No mezcles éter con sombra. No pintes superficies con savia. No inventes un gris o un verde suelto."
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
