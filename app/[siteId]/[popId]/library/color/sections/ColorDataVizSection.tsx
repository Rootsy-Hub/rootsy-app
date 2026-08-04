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
import { CHART_NATURE_SEQUENCE } from "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette"
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
          Los gráficos respiran naturaleza: canopy como serie principal, mar y cielo
          como contrapuntos frescos, otoño y crepúsculo para calor y novedad. Fuego solo
          para severidad — nunca decoración.
        </ColorDocLead>

        <ColorDocSection
          id="viz-sequence"
          title="Secuencia categórica"
          description="Orden recomendado — máximo contraste entre vecinos."
        >
          <div className="flex flex-wrap gap-2">
            {CHART_NATURE_SEQUENCE.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: c.hex }}
              >
                {c.label}
              </div>
            ))}
          </div>
        </ColorDocSection>

        <ColorDocSection id="viz-single" title="Un solo color">
          <SingleColorChartDemo />
        </ColorDocSection>

        <ColorDocSection id="viz-categorical" title="Categórico">
          <CategoricalChartDemo />
        </ColorDocSection>

        <ColorDocSection id="viz-status" title="Estado y severidad">
          <StatusChartDemo />
        </ColorDocSection>

        <ColorDocSection id="viz-interaction" title="Interacción">
          <ChartInteractionDemo />
        </ColorDocSection>

        <GuidelinePair
          doText="Separá segmentos con espacio o borde tierra — colores vivos pegados confunden."
          dontText="No pongas texto sobre barras de chart — ubicá etiquetas al lado."
        />
      </div>
    </LibrarySection>
  )
}
