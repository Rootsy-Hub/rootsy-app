"use client"

import {
  ROOTSY_DARK_NEUTRALS,
  ROOTSY_LIGHT_NEUTRALS,
  ROOTSY_SATURATED_PALETTES,
} from "@/app/[siteId]/[popId]/library/color/colorExtendedData"
import { getColorPageMeta } from "@/app/[siteId]/[popId]/library/color/colorLibraryNav"
import {
  ColorDocLead,
  ColorDocSection,
  DarkModeSymmetryDemo,
  NeutralPaletteComparison,
  PaletteFamilyRamp,
} from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function ColorPaletteSection() {
  const meta = getColorPageMeta("colors-palette")!

  return (
    <LibrarySection
      id="colors-palette"
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-10">
        <ColorDocLead>
          Rampas completas de la paleta nature Rootsy. Los neutros tienen equivalente
          en workspace claro y mostrador oscuro; los saturados siguen simetría entre
          temas para mantener jerarquía.
        </ColorDocLead>

        <ColorDocSection
          id="palette-saturated"
          title="Colores saturados"
          description="Verde, ámbar y tierra — de tinte suave a intenso."
        >
          <div className="space-y-6">
            {ROOTSY_SATURATED_PALETTES.map((family) => (
              <PaletteFamilyRamp key={family.id} family={family} />
            ))}
          </div>
        </ColorDocSection>

        <ColorDocSection
          id="palette-neutrals"
          title="Neutros"
          description="Escala dedicada para cada tema — claro y oscuro."
        >
          <NeutralPaletteComparison
            title="Neutros sólidos"
            lightSteps={ROOTSY_LIGHT_NEUTRALS}
            darkSteps={ROOTSY_DARK_NEUTRALS}
          />
        </ColorDocSection>

        <ColorDocSection
          id="palette-dark-mapping"
          title="Claro y oscuro"
          description="Un tono intenso en claro se equilibra con uno más luminoso en oscuro."
        >
          <DarkModeSymmetryDemo />
        </ColorDocSection>
      </div>
    </LibrarySection>
  )
}
