"use client"

import { getColorNewPageMeta } from "@/app/[siteId]/[popId]/library/color/colorNewLibraryNav"
import {
  ColorDocLead,
  ColorDocSection,
  NatureFamilyRamp,
  NatureGradientGallery,
} from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import {
  BRUMA_FAMILY,
  CENIZA_FAMILY,
  COLOR_NEW_GRADIENTS,
  LANDING_FAMILY,
  SAVIA_FAMILY,
  type NatureFamily,
} from "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

const FAMILY_BY_SECTION: Record<string, NatureFamily> = {
  "colors-new-ceniza": CENIZA_FAMILY,
  "colors-new-bruma": BRUMA_FAMILY,
  "colors-new-savia": SAVIA_FAMILY,
  "colors-new-landing": LANDING_FAMILY,
}

const SECTION_LEADS: Record<string, string> = {
  "colors-new-ceniza":
    "Azul-ceniza profundo para shell, rail de categorías, canvas de productos, cards y toolbox. No es negro plano ni tierra cálida — es el gris operativo de Vender.",
  "colors-new-bruma":
    "Off-white frío para la columna TU PEDIDO, filas del ticket y tablas workspace. Contraste limpio con ceniza oscura y acentos savia.",
  "colors-new-savia":
    "Emerald eléctrico sobre ceniza — más operativo que Canopy de marca. Vender, agregar, rail activo, toolbox configurado y barra de totales.",
  "colors-new-landing":
    "Hero promocional con fondo #080C0B, tokens forest/meadow en globals.css, auroras neón en LandingAtmosphere y CTA from-emerald-500 to-teal-500.",
}

type Props = {
  sectionId: string
}

export function ColorNewFamilySection({ sectionId }: Props) {
  const family = FAMILY_BY_SECTION[sectionId]
  const meta = getColorNewPageMeta(sectionId)
  if (!family || !meta) return null

  const relatedGradients =
    sectionId === "colors-new-landing"
      ? COLOR_NEW_GRADIENTS.filter((g) => g.id.startsWith("landing"))
      : sectionId === "colors-new-savia"
        ? COLOR_NEW_GRADIENTS.filter((g) => g.id.startsWith("pos"))
        : sectionId === "colors-new-ceniza" || sectionId === "colors-new-bruma"
          ? COLOR_NEW_GRADIENTS.filter((g) => g.id === "pos-floor")
          : []

  return (
    <LibrarySection id={sectionId} title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <ColorDocLead>{SECTION_LEADS[sectionId]}</ColorDocLead>
        <NatureFamilyRamp family={family} />

        {relatedGradients.length > 0 ? (
          <ColorDocSection
            id={`${sectionId}-gradients`}
            title="Gradientes relacionados"
            description="Combinaciones de producto que usan esta familia."
          >
            <NatureGradientGallery items={relatedGradients} />
          </ColorDocSection>
        ) : null}

        {sectionId === "colors-new-ceniza" || sectionId === "colors-new-bruma" ? (
          <ColorDocSection
            id={`${sectionId}-contrast`}
            title="Contraste POS"
            description="Ceniza oscura y bruma clara trabajan juntas en la pantalla Vender."
          >
            <div className="grid gap-3 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Ceniza · catálogo</p>
                <div className="flex overflow-hidden rounded-xl border border-border/70">
                  {CENIZA_FAMILY.steps.slice(0, 5).map((step) => (
                    <div
                      key={step.id}
                      className="h-10 min-w-0 flex-1"
                      style={{ backgroundColor: step.hex }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Bruma · ticket</p>
                <div className="flex overflow-hidden rounded-xl border border-border/70">
                  {BRUMA_FAMILY.steps.slice(0, 5).map((step) => (
                    <div
                      key={step.id}
                      className="h-10 min-w-0 flex-1"
                      style={{ backgroundColor: step.hex }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </ColorDocSection>
        ) : null}
      </div>
    </LibrarySection>
  )
}
