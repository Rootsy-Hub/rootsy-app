"use client"

import { getColorPageMeta } from "@/app/[siteId]/[popId]/library/color/colorLibraryNav"
import {
  AccentBackgroundEmphasisDemo,
  AccentPairingDemo,
  AccentTagsDemo,
  ColorDocLead,
  ColorDocSection,
  GuidelinePair,
} from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import { CANOPY_FAMILY, NATURE_ACCENTS } from "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function ColorAccentsSection() {
  const meta = getColorPageMeta("colors-accents")!
  const showcase = NATURE_ACCENTS[0]

  return (
    <LibrarySection
      id="colors-accents"
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-10">
        <ColorDocLead>
          Los acentos son hojas de distintos árboles en el mismo bosque — intercambiables
          sin cambiar el significado. Canopy sigue siendo la marca; mar, cielo, otoño,
          crepúsculo y tierra categorizan y decoran.
        </ColorDocLead>

        <ColorDocSection
          id="accent-options"
          title="Opciones de acento"
          description="Ocho familias nature — tags, íconos de categoría, notas adhesivas."
        >
          <AccentTagsDemo />
        </ColorDocSection>

        <ColorDocSection
          id="accent-backgrounds"
          title="Énfasis en fondos"
          description="De bruma a hoja densa — cuatro niveles por familia."
        >
          <AccentBackgroundEmphasisDemo accent={showcase} />
        </ColorDocSection>

        <ColorDocSection
          id="accent-pairing"
          title="Emparejamiento"
          description="Texto e fondo de la misma familia — armonía y contraste legible."
        >
          <AccentPairingDemo accent={showcase} />
        </ColorDocSection>

        <ColorDocSection
          id="accent-canopy-rule"
          title="Canopy vs acento"
          description="Verde esplendor = marca. Los demás = elección libre de la persona usuaria."
        >
          <div
            className="rounded-xl border p-4"
            style={{ borderColor: "#A8EBC4", backgroundColor: "#F0FBF4" }}
          >
            <p className="text-sm font-semibold" style={{ color: "#16704A" }}>
              ★ {CANOPY_FAMILY.steps.find((s) => s.id === "c600")?.label} — reservado para Rootsy
            </p>
            <p className="mt-1 text-sm" style={{ color: "#0F5739" }}>
              Mar, cielo, otoño, fuego, crepúsculo y tierra compiten en categorías — no en
              identidad de marca.
            </p>
          </div>
        </ColorDocSection>

        <GuidelinePair
          doText="Usá acentos cuando el color es elección libre — categorías, íconos, etiquetas."
          dontText="No uses fuego o canopy decorativo — tienen significado fijo."
        />
      </div>
    </LibrarySection>
  )
}
