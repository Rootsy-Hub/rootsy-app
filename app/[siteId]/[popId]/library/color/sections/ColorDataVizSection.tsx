"use client"

import { getColorPageMeta } from "@/app/[siteId]/[popId]/library/color/colorLibraryNav"
import {
  CategoricalChartDemo,
  ChartInteractionDemo,
  ColorDocLead,
  ColorDocSection,
  GuidelinePair,
  SingleColorChartDemo,
  StatusChartDemo,
} from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function ColorDataVizSection() {
  const meta = getColorPageMeta("colors-data-viz")!

  return (
    <LibrarySection
      id="colors-data-viz"
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-10">
        <ColorDocLead>
          El color en gráficos ayuda a comparar y destacar — pero no debe ser el
          único indicador. Combiná con etiquetas, formas o patrones para que todos
          puedan leer los datos.
        </ColorDocLead>

        <ColorDocSection
          id="viz-single"
          title="Un solo color"
          description="Verde de marca por defecto; neutro para datos secundarios."
        >
          <SingleColorChartDemo />
        </ColorDocSection>

        <ColorDocSection
          id="viz-categorical"
          title="Categórico"
          description="Hasta 5–6 series distintas; agrupá el resto."
        >
          <CategoricalChartDemo />
        </ColorDocSection>

        <ColorDocSection
          id="viz-status"
          title="Estado y severidad"
          description="Verde, ámbar, rojo y neutro cuando el dato tiene significado fijo."
        >
          <StatusChartDemo />
        </ColorDocSection>

        <ColorDocSection
          id="viz-interaction"
          title="Interacción"
          description="Hover puede resaltar un segmento o atenuar el resto."
        >
          <ChartInteractionDemo />
        </ColorDocSection>

        <GuidelinePair
          doText="Dejá espacio o borde entre segmentos de color adyacentes."
          dontText="No coloques barras o sectores del mismo tono pegados sin separación."
        />

        <GuidelinePair
          doText="Ubicá etiquetas junto al dato, no encima del color del gráfico."
          dontText="No confíes solo en el color para comunicar significado."
        />
      </div>
    </LibrarySection>
  )
}
