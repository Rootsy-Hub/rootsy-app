"use client"

import { getColorNewPageMeta } from "@/app/library/color/colorNewLibraryNav"
import {
  ColorDocLead,
  ColorDocSection,
  NatureFamilyRamp,
  NatureGradientGallery,
} from "@/app/library/color/ColorDocPrimitives"
import {
  COLOR_NEW_FAMILIES,
  CIELO_FAMILY,
  COLOR_NEW_GRADIENTS,
  ETER_FAMILY,
  SOL_FAMILY,
  SUELO_FAMILY,
} from "@/app/library/color/rootsyNaturePalette"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function ColorNewPalettesSection() {
  const meta = getColorNewPageMeta("colors-new-palettes")!

  return (
    <LibrarySection id="colors-new-palettes" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <ColorDocLead>
          El sistema completo son tres rampas de marca — sombra, bruma y savia — extraídas de
          Vender, workspace y marketing. Suelo, cielo, sol y éter son climas.
          Atmósfera es composición de efectos. Ninguno es una cuarta familia de marca.
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
          id="palettes-suelo"
          title="Suelo · tierra mojada"
          description="Humus oliva que dialoga con sombra y savia. Solo footer de listados y toolbox de Operar — no forms, ni pills, ni avisos."
        >
          <NatureFamilyRamp family={SUELO_FAMILY} />
        </ColorDocSection>

        <ColorDocSection
          id="palettes-climas"
          title="Cielo · Sol · Éter"
          description="Climas — azul de naturaleza, amarillo sol y espacio del header. No reemplazan warning, teal ni sombra."
        >
          <div className="space-y-10">
            <NatureFamilyRamp family={CIELO_FAMILY} />
            <NatureFamilyRamp family={SOL_FAMILY} />
            <NatureFamilyRamp family={ETER_FAMILY} />
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
