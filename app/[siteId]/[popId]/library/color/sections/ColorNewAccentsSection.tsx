"use client"

import { getColorNewPageMeta } from "@/app/[siteId]/[popId]/library/color/colorNewLibraryNav"
import { ProductEmphasisGallery } from "@/app/[siteId]/[popId]/library/color/ColorSystemDocPrimitives"
import {
  ColorDocLead,
  ColorDocSection,
  GuidelinePair,
} from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import { COLOR_NEW_FAMILIES } from "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function ColorNewAccentsSection() {
  const meta = getColorNewPageMeta("colors-new-accents")!

  return (
    <LibrarySection id="colors-new-accents" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <ColorDocLead>
          No hay acentos intercambiables tipo mar u otoño en este sistema. Énfasis =
          escalas dentro de cada familia: de shell a card en ceniza, de panel a cuerpo
          en bruma, de soft a CTA en savia.
        </ColorDocLead>

        <ColorDocSection
          id="emphasis-levels"
          title="Niveles por familia"
          description="Cuatro paradas clave por rampa — las que ya están en Figma y código."
        >
          <ProductEmphasisGallery />
        </ColorDocSection>

        <ColorDocSection
          id="emphasis-tags"
          title="Tags de producto"
          description="Solo combinaciones de las cuatro familias."
        >
          <div className="flex flex-wrap gap-2">
            {[
              { bg: "#20262E", text: "#94A3B8", label: "Ceniza · inactivo" },
              { bg: "#EEF1F5", text: "#121417", label: "Bruma · ticket" },
              { bg: "#D1FAE5", text: "#047857", label: "Savia · pagado" },
              { bg: "#059669", text: "#FFFFFF", label: "Savia · CTA" },
              { bg: "#080C0B", text: "#34D399", label: "Landing · link" },
            ].map((tag) => (
              <span
                key={tag.label}
                className="inline-flex rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: tag.bg, color: tag.text }}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </ColorDocSection>

        <ColorDocSection
          id="emphasis-ramp-ref"
          title="Referencia de rampas"
          description="Pasos completos — ver Paletas para detalle."
        >
          <ul className="space-y-2 text-sm text-muted-foreground">
            {COLOR_NEW_FAMILIES.map((f) => (
              <li key={f.id}>
                <strong className="text-foreground">{f.title}</strong> — {f.steps.length}{" "}
                pasos
              </li>
            ))}
          </ul>
        </ColorDocSection>

        <GuidelinePair
          doText="Elegí el paso de la familia correcta — ceniza para oscuro, bruma para claro, savia para acción."
          dontText="No importes colores de categoría libre — no existen en este sistema."
        />
      </div>
    </LibrarySection>
  )
}
