"use client"

import { getColorPageMeta } from "@/app/[siteId]/[popId]/library/color/colorLibraryNav"
import {
  AccentBackgroundEmphasisDemo,
  AccentPairingDemo,
  AccentTagsDemo,
  AccentTextIconDemo,
  ColorDocLead,
  ColorDocSection,
  GuidelinePair,
} from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function ColorAccentsSection() {
  const meta = getColorPageMeta("colors-accents")!

  return (
    <LibrarySection
      id="colors-accents"
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-10">
        <ColorDocLead>
          Los acentos diferencian elementos como categorías, íconos de proyecto y
          notas — sin comunicar éxito, aviso ni error. Si cambiás uno por otro, la
          experiencia debe seguir igual.
        </ColorDocLead>

        <ColorDocSection
          id="accent-options"
          title="Opciones de acento"
          description="Paleta nature Rootsy para tags, íconos y agrupación visual."
        >
          <AccentTagsDemo />
        </ColorDocSection>

        <ColorDocSection
          id="accent-backgrounds"
          title="Énfasis en fondos"
          description="Cuatro niveles de intensidad — de más sutil a más intenso."
        >
          <AccentBackgroundEmphasisDemo />
        </ColorDocSection>

        <ColorDocSection
          id="accent-text-icon"
          title="Texto e íconos"
          description="Dos niveles: normal e intenso."
        >
          <AccentTextIconDemo />
        </ColorDocSection>

        <ColorDocSection
          id="accent-pairing"
          title="Emparejamiento accesible"
          description="Combinaciones recomendadas de fondo y texto sobre acentos."
        >
          <AccentPairingDemo />
        </ColorDocSection>

        <GuidelinePair
          doText="Usá acentos cuando el color es una elección libre — categorías, íconos, etiquetas."
          dontText="No uses acento cuando el color debe significar éxito, aviso o peligro."
        />

        <GuidelinePair
          doText="Combiná fondo y texto de la misma familia de color."
          dontText="No mezcles un fondo verde con texto ámbar — pierde armonía y contraste."
        />
      </div>
    </LibrarySection>
  )
}
