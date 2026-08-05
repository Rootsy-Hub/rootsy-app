"use client"

import { getColorNewPageMeta } from "@/app/[siteId]/[popId]/library/color/colorNewLibraryNav"
import {
  ColorSystemHero,
  PairingCard,
  ThemeGallery,
} from "@/app/[siteId]/[popId]/library/color/ColorSystemDocPrimitives"
import {
  ColorDocLead,
  ColorDocSection,
  GuidelinePair,
  NatureGradientGallery,
} from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import {
  ROOTSY_COLOR_MANIFESTO,
  ROOTSY_COLOR_PRINCIPLES,
  ROOTSY_COMPLEMENTARY_PAIRINGS,
} from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"
import { COLOR_NEW_GRADIENTS } from "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette"
import { LibraryPrinciplesGrid } from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

const ARCHITECTURE = [
  { label: "Ceniza", hex: "#20262E", sub: "Catálogo · rail · cards" },
  { label: "Bruma", hex: "#EEF1F5", sub: "Ticket · tablas · workspace", text: "#121417" },
  { label: "Savia", hex: "#059669", sub: "Acción · foco · totales" },
  { label: "Landing", hex: "#080C0B", sub: "Hero · CTA · aurora" },
] as const

export function ColorNewOverviewSection() {
  const meta = getColorNewPageMeta("colors-new")!

  return (
    <LibrarySection id="colors-new" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <ColorSystemHero />
        <ColorDocLead>{ROOTSY_COLOR_MANIFESTO}</ColorDocLead>
        <LibraryPrinciplesGrid principles={[...ROOTSY_COLOR_PRINCIPLES]} />

        <ColorDocSection
          id="colors-new-architecture"
          title="Las cuatro familias"
          description="Todo el producto se reduce a ceniza, bruma, savia y landing — nada más."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ARCHITECTURE.map((layer) => (
              <div
                key={layer.label}
                className="overflow-hidden rounded-xl border border-border/70"
              >
                <div className="flex h-16 items-end p-3" style={{ backgroundColor: layer.hex }}>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "text" in layer ? layer.text : "#FFFFFF" }}
                  >
                    {layer.label}
                  </span>
                </div>
                <p className="px-3 py-2 text-[11px] text-muted-foreground">{layer.sub}</p>
              </div>
            ))}
          </div>
        </ColorDocSection>

        <ColorDocSection
          id="colors-new-themes-preview"
          title="Contextos de producto"
          description="POS, workspace, landing y librería — mismas familias, distinta composición."
        >
          <ThemeGallery />
        </ColorDocSection>

        <ColorDocSection
          id="colors-new-key-pairings"
          title="Complementarios clave"
          description="Armonías que ya están en producción."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {ROOTSY_COMPLEMENTARY_PAIRINGS.slice(0, 4).map((pairing) => (
              <PairingCard key={pairing.id} pairing={pairing} />
            ))}
          </div>
        </ColorDocSection>

        <ColorDocSection
          id="colors-new-gradients"
          title="Gradientes"
          description="Solo gradientes con función en producto."
        >
          <NatureGradientGallery items={COLOR_NEW_GRADIENTS} />
        </ColorDocSection>

        <GuidelinePair
          doText="Usá savia 600 para toda acción; bruma 100 para todo ticket; ceniza 600 para todo catálogo oscuro."
          dontText="No importes rampas nature, canopy ni tierra — no son parte de este sistema."
        />
      </div>
    </LibrarySection>
  )
}
