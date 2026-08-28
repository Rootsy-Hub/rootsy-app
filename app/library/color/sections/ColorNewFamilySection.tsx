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
  CIELO_FAMILY,
  COLOR_NEW_GRADIENTS,
  ETER_FAMILY,
  LAVA_FAMILY,
  SAVIA_FAMILY,
  SOL_FAMILY,
  SOMBRA_FAMILY,
  type NatureFamily,
} from "@/app/library/color/rootsyNaturePalette"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

const FAMILY_BY_SECTION: Record<string, NatureFamily> = {
  "colors-new-eter": ETER_FAMILY,
  "colors-new-sombra": SOMBRA_FAMILY,
  "colors-new-ceniza": SOMBRA_FAMILY,
  "colors-new-bruma": BRUMA_FAMILY,
  "colors-new-savia": SAVIA_FAMILY,
  "colors-new-cielo": CIELO_FAMILY,
  "colors-new-sol": SOL_FAMILY,
  "colors-new-lava": LAVA_FAMILY,
  "colors-new-atmosphere": ATMOSPHERE_SPEC,
  "colors-new-landing": ATMOSPHERE_SPEC,
}

const SECTION_LEADS: Record<string, string> = {
  "colors-new-eter":
    "El afuera del planeta. Encabeza, contiene y abre espacio. Controles neutros; el vacío usa el clima, no esta rampa. No es cielo.",
  "colors-new-sombra":
    "El dosel para operar. El tope es negro. El 950 es aire. La hoja es 800: rail, toolbar, cards y slots. Savia solo en oficio.",
  "colors-new-ceniza":
    "El dosel para operar. El tope es negro. El 950 es aire. La hoja es 800: rail, toolbar, cards y slots. Savia solo en oficio.",
  "colors-new-bruma":
    "El claro para leer. Workspaces, tablas, tickets y formularios. De noche, los mismos tokens arman bruma oscura — no una atmósfera nueva.",
  "colors-new-savia":
    "Acción, foco y progreso. Rayo 500. No pinta superficies enteras. Sobre el vivo, el texto es savia 950.",
  "colors-new-cielo":
    "Información, orientación y contexto. No es éter ni un azul de plantilla. No se usa como atmósfera de pantalla.",
  "colors-new-sol":
    "Atención y aviso. Calor vivo, no otoño ni plantilla de warning. No es lava.",
  "colors-new-lava":
    "Riesgo, error, bloqueo y acción destructiva. No es sol. No se usa para atención rutinaria.",
  "colors-new-atmosphere":
    "El hero no inventa colores: combina sombra, savia y auroras blur. Es composición de marketing, no una atmósfera del sistema.",
  "colors-new-landing":
    "El hero no inventa colores: combina sombra, savia y auroras blur. Es composición de marketing, no una atmósfera del sistema.",
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
            description="Sombra bajo el dosel y luz filtrada en el ticket — el par natural del mostrador."
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
                <p className="mb-2 font-canopy text-xs text-[var(--rootsy-bruma-500)]">Luz filtrada · ticket</p>
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
