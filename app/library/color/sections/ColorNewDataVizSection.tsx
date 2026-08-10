"use client"

import { getColorNewPageMeta } from "@/app/library/color/colorNewLibraryNav"
import {
  ProductCategoricalChartDemo,
  ProductSingleChartDemo,
  ProductStatusChartDemo,
} from "@/app/library/color/ColorSystemDocPrimitives"
import {
  ColorDocLead,
  ColorDocSection,
  GuidelinePair,
} from "@/app/library/color/ColorDocPrimitives"
import {
  ROOTSY_CHART_SEQUENCE,
  ROOTSY_CHART_STATUS,
} from "@/app/library/color/rootsyColorSystem"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function ColorNewDataVizSection() {
  const meta = getColorNewPageMeta("colors-new-data-viz")!

  return (
    <LibrarySection id="colors-new-data-viz" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <ColorDocLead>
          Gráficos usan la paleta de producto primero — savia, teal promocional, sombra y
          bruma. Ámbar y rojo son funcionales para aviso/crítico, no familias del sistema.
        </ColorDocLead>

        <ColorDocSection
          id="dataviz-single"
          title="Serie única"
          description="Savia 600 protagonista; bruma 200 para contexto."
        >
          <ProductSingleChartDemo />
        </ColorDocSection>

        <ColorDocSection
          id="dataviz-categorical"
          title="Categórico"
          description="Secuencia de producto — solo sombra, bruma y savia."
        >
          <ProductCategoricalChartDemo />
          <div className="mt-4 flex flex-wrap gap-2">
            {ROOTSY_CHART_SEQUENCE.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
                style={{ backgroundColor: `${s.hex}22`, color: s.hex }}
              >
                <span className="size-2 rounded-full" style={{ backgroundColor: s.hex }} />
                {s.label}
              </span>
            ))}
          </div>
        </ColorDocSection>

        <ColorDocSection
          id="dataviz-status"
          title="Estados"
          description="Savia = OK; ámbar/rojo/teal = funcionales."
        >
          <ProductStatusChartDemo />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {ROOTSY_CHART_STATUS.map((s) => (
              <div key={s.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: s.boldHex }}
                />
                <span className="font-medium text-foreground">{s.label}</span>
                <span>{s.hex}</span>
              </div>
            ))}
          </div>
        </ColorDocSection>

        <GuidelinePair
          doText="Neutros bruma/sombra para ejes y grids; savia solo para el dato que importa."
          dontText="No uses aurora neón ni rampas legacy en dashboards operativos."
        />
      </div>
    </LibrarySection>
  )
}
