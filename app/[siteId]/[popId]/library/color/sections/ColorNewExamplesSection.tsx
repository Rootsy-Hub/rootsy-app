"use client"

import { getColorNewPageMeta } from "@/app/[siteId]/[popId]/library/color/colorNewLibraryNav"
import {
  ColorDocLead,
  ColorDocSection,
  GuidelinePair,
} from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import { ColorModalExamplesGallery, ColorUiExamplesGallery } from "@/app/[siteId]/[popId]/library/color/ColorUiExamples"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function ColorNewExamplesSection() {
  const meta = getColorNewPageMeta("colors-new-examples")!

  return (
    <LibrarySection id="colors-new-examples" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <ColorDocLead>
          Color no vive solo en rampas: estos bloques muestran sombra, bruma y savia junto con
          tipografía, espaciado, borde, radio y elevación — en modales, formularios, listados,
          tiles POS, cards, banners y shell de pantalla.
        </ColorDocLead>

        <ColorDocSection
          id="colors-new-examples-modals"
          title="Modales"
          description="Scrim sombra, superficie blanca, overlay elevado y savia en acción primaria."
        >
          <ColorModalExamplesGallery />
        </ColorDocSection>

        <ColorDocSection
          id="colors-new-examples-gallery"
          title="Componentes en contexto"
          description="Piezas de producto — cada una cita los fundamentos que combina."
        >
          <ColorUiExamplesGallery />
        </ColorDocSection>

        <GuidelinePair
          doText="Probá cada par sombra/bruma/savia en un control concreto — botón, fila, tile, banner."
          dontText="No uses las rampas como relleno decorativo sin rol semántico en la UI."
        />
      </div>
    </LibrarySection>
  )
}
