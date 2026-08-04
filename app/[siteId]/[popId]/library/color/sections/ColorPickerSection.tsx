"use client"

import { getColorPageMeta } from "@/app/[siteId]/[popId]/library/color/colorLibraryNav"
import {
  ColorDocLead,
  ColorDocSection,
  ColorPickerGrid,
  GuidelinePair,
} from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function ColorPickerSection() {
  const meta = getColorPageMeta("colors-picker")!

  return (
    <LibrarySection
      id="colors-picker"
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-10">
        <ColorDocLead>
          Los selectores de color permiten que la persona usuaria personalice su
          contenido. Ofrecé opciones que funcionen en workspace claro y oscuro, con
          descripciones como «sutil verde» o «intenso ámbar» — no «claro» u «oscuro».
        </ColorDocLead>

        <ColorDocSection
          id="picker-text"
          title="Selector de texto"
          description="Dos intensidades por color — normal e intenso."
        >
          <ColorPickerGrid variant="text" />
        </ColorDocSection>

        <ColorDocSection
          id="picker-background"
          title="Selector de fondo"
          description="Cuatro niveles de énfasis por color, más opción de superficie default."
        >
          <ColorPickerGrid variant="background" />
        </ColorDocSection>

        <ColorDocSection
          id="picker-chart"
          title="Selector para gráficos"
          description="Tres intensidades por color para series personalizables."
        >
          <ColorPickerGrid variant="chart" />
        </ColorDocSection>

        <GuidelinePair
          doText="Ofrecé combinaciones que permitan contraste accesible entre texto y fondo."
          dontText="No incluyas colores que no puedan emparejarse de forma legible."
        />

        <GuidelinePair
          doText="Preferí ámbar u otro cálido en lugar de amarillo puro — el amarillo suele verse apagado al cumplir contraste."
          dontText="Evitá amarillo en selectores de texto; puede leerse como marrón."
        />
      </div>
    </LibrarySection>
  )
}
