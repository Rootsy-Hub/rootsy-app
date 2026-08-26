"use client"

import { getColorNewPageMeta } from "@/app/library/color/colorNewLibraryNav"
import {
  ColorDocLead,
  ColorDocSection,
  NatureFamilyRamp,
  NatureGradientGallery,
} from "@/app/library/color/ColorDocPrimitives"
import {
  ATMOSPHERE_SPEC,
  BRUMA_FAMILY,
  COLOR_NEW_GRADIENTS,
  SAVIA_FAMILY,
  SOMBRA_FAMILY,
  type NatureFamily,
} from "@/app/library/color/rootsyNaturePalette"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

const FAMILY_BY_SECTION: Record<string, NatureFamily> = {
  "colors-new-sombra": SOMBRA_FAMILY,
  "colors-new-ceniza": SOMBRA_FAMILY,
  "colors-new-bruma": BRUMA_FAMILY,
  "colors-new-savia": SAVIA_FAMILY,
  "colors-new-atmosphere": ATMOSPHERE_SPEC,
  "colors-new-landing": ATMOSPHERE_SPEC,
}

const SECTION_LEADS: Record<string, string> = {
  "colors-new-sombra":
    "Carbón verdoso bajo el dosel — shell, rail, canvas, cards y toolbox. El hero de marketing usa los mismos oscuros (sombra 900), no una paleta aparte.",
  "colors-new-ceniza":
    "Carbón verdoso bajo el dosel — shell, rail, canvas, cards y toolbox. El hero de marketing usa los mismos oscuros (sombra 900), no una paleta aparte.",
  "colors-new-bruma":
    "Neblina matinal para la columna TU PEDIDO, filas del ticket y tablas workspace. Aire claro que contrasta con la sombra del catálogo y deja brillar la savia. De noche, los mismos tokens arman Bruma oscura — no una familia nueva.",
  "colors-new-savia":
    "La savia del árbol — emerald operativo sobre sombra. Incluye la extensión teal del CTA hero (savia.teal).",
  "colors-new-atmosphere":
    "El hero no inventa colores: combina sombra 900 de fondo, savia 500/400 de acento, gradiente savia→teal en el CTA y auroras neón solo en blur. Es composición, no familia.",
  "colors-new-landing":
    "El hero no inventa colores: combina sombra 900 de fondo, savia 500/400 de acento, gradiente savia→teal en el CTA y auroras neón solo en blur. Es composición, no familia.",
}

function isSombraSection(sectionId: string) {
  return sectionId === "colors-new-sombra" || sectionId === "colors-new-ceniza"
}

function isAtmosphereSection(sectionId: string) {
  return sectionId === "colors-new-atmosphere" || sectionId === "colors-new-landing"
}

type Props = {
  sectionId: string
}

export function ColorNewFamilySection({ sectionId }: Props) {
  const family = FAMILY_BY_SECTION[sectionId]
  const meta = getColorNewPageMeta(sectionId)
  if (!family || !meta) return null

  const relatedGradients = isAtmosphereSection(sectionId)
    ? COLOR_NEW_GRADIENTS.filter(
        (g) => g.id.startsWith("marketing") || g.id.startsWith("pos-totals"),
      )
    : sectionId === "colors-new-savia"
      ? COLOR_NEW_GRADIENTS.filter((g) => g.id.startsWith("pos"))
      : isSombraSection(sectionId) || sectionId === "colors-new-bruma"
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
            title={isAtmosphereSection(sectionId) ? "Gradientes del hero" : "Gradientes relacionados"}
            description={
              isAtmosphereSection(sectionId)
                ? "Transiciones de marketing — siempre mezclando sombra, savia y atmósfera."
                : "Combinaciones de producto que usan esta familia."
            }
          >
            <NatureGradientGallery items={relatedGradients} />
          </ColorDocSection>
        ) : null}

        {isSombraSection(sectionId) || sectionId === "colors-new-bruma" ? (
          <ColorDocSection
            id={`${sectionId}-contrast`}
            title="Contraste POS"
            description="Sombra bajo el dosel y bruma neblinosa — el par natural del mostrador."
          >
            <div className="grid gap-3 lg:grid-cols-2">
              <div>
                <p className="mb-2 font-canopy text-xs text-[var(--rootsy-bruma-500)]">Sombra · catálogo</p>
                <div className="library-doc-panel flex overflow-hidden rounded-xl">
                  {SOMBRA_FAMILY.steps.slice(0, 5).map((step) => (
                    <div
                      key={step.id}
                      className="h-10 min-w-0 flex-1"
                      style={{ backgroundColor: step.hex }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 font-canopy text-xs text-[var(--rootsy-bruma-500)]">Bruma · ticket</p>
                <div className="library-doc-panel flex overflow-hidden rounded-xl">
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
