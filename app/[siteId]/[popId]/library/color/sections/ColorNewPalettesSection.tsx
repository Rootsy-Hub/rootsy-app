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
          El sistema completo son cuatro rampas — extraídas de Vender, workspace,
          landing y la propia librería. Nada más entra en la paleta oficial.
        </ColorDocLead>

        <ColorDocSection
          id="palettes-all"
          title="Ceniza · Bruma · Savia · Landing"
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
          description="Solo transiciones con función — POS, split y landing."
        >
          <NatureGradientGallery items={COLOR_NEW_GRADIENTS} />
        </ColorDocSection>
      </div>
    </LibrarySection>
  )
}
