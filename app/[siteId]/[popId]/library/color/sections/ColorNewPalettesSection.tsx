"use client"

import { getColorNewPageMeta } from "@/app/[siteId]/[popId]/library/color/colorNewLibraryNav"
import {
  ColorDocLead,
  ColorDocSection,
  NatureFamilyRamp,
  NatureGradientGallery,
} from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import {
  COLOR_NEW_FAMILIES,
  COLOR_NEW_GRADIENTS,
} from "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function ColorNewPalettesSection() {
  const meta = getColorNewPageMeta("colors-new-palettes")!

  return (
    <LibrarySection id="colors-new-palettes" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <ColorDocLead>
          El sistema completo son tres rampas de marca — sombra, bruma y savia — extraídas de
          Vender, workspace y marketing. Atmósfera es composición de efectos, no una cuarta
          rampa.
        </ColorDocLead>

        <ColorDocSection
          id="palettes-all"
          title="Sombra · Bruma · Savia"
          description="Rampas completas con pasos y uso en producto."
        >
          <div className="space-y-10">
            {COLOR_NEW_FAMILIES.map((family) => (
              <NatureFamilyRamp key={family.id} family={family} />
            ))}
          </div>
        </ColorDocSection>

        <ColorDocSection
          id="palettes-gradients"
          title="Gradientes"
          description="Solo transiciones con función — POS, split y marketing."
        >
          <NatureGradientGallery items={COLOR_NEW_GRADIENTS} />
        </ColorDocSection>
      </div>
    </LibrarySection>
  )
}
