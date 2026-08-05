"use client"

import { getColorNewPageMeta } from "@/app/[siteId]/[popId]/library/color/colorNewLibraryNav"
import {
  ColorDocLead,
  ColorDocSection,
  GuidelinePair,
} from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import {
  ColorFamiliesRow,
  ColorGradientGallery,
  ColorSystemHero,
  PairingCard,
  PosSplitDemo,
  ThemeGallery,
} from "@/app/[siteId]/[popId]/library/color/ColorSystemDocPrimitives"
import { ColorTechnicalDetails } from "@/app/[siteId]/[popId]/library/color/ColorTechnicalDetails"
import {
  ROOTSY_COLOR_MANIFESTO,
  ROOTSY_COLOR_PRINCIPLES,
  ROOTSY_COMPLEMENTARY_PAIRINGS,
} from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"
import { COLOR_NEW_GRADIENTS } from "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette"
import { LibraryPrinciplesGrid } from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

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
          title="Las cuatro familias"
          description="Todo el producto se reduce a ceniza, bruma, savia y landing — nada más."
        >
          <ColorFamiliesRow />
        </ColorDocSection>

        <ColorDocSection
          id="colors-new-split"
          title="Split POS"
          description="Ceniza y bruma en la misma pantalla — la regla de oro del mostrador."
        >
          <PosSplitDemo />
        </ColorDocSection>

        <ColorDocSection
          id="colors-new-themes-preview"
          title="Contextos de producto"
          description="POS, workspace, landing y librería — mismas familias, distinta composición."
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
          doText="Usá savia 600 para toda acción; bruma 100 para todo ticket; ceniza 600 para todo catálogo oscuro."
          dontText="No importes rampas nature, canopy ni tierra — no son parte de este sistema."
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
