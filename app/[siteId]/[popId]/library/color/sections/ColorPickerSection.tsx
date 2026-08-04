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
          Cuando la persona usuaria pinta su contenido, ofrecé la naturaleza entera:
          «sutil prado», «intenso cielo», «brasa suave». Describí por énfasis y familia —
          no «claro» u «oscuro» — para que funcione en workspace y mostrador.
        </ColorDocLead>

        <ColorDocSection
          id="picker-text"
          title="Selector de texto"
          description="Normal e intenso por familia — legible sobre fondos claros."
        >
          <ColorPickerGrid variant="text" />
        </ColorDocSection>

        <ColorDocSection
          id="picker-background"
          title="Selector de fondo"
          description="Cuatro brumas por color — de casi transparente a hoja densa."
        >
          <ColorPickerGrid variant="background" />
        </ColorDocSection>

        <ColorDocSection
          id="picker-chart"
          title="Selector para gráficos"
          description="Tres intensidades — suave, media, plena luz."
        >
          <ColorPickerGrid variant="chart" />
        </ColorDocSection>

        <GuidelinePair
          doText="Incluí canopy, mar, otoño y crepúsculo — suficiente contraste al emparejar."
          dontText="Evitá amarillo puro en texto; en otoño usá ámbar con alma de hoja."
        />
      </div>
    </LibrarySection>
  )
}
