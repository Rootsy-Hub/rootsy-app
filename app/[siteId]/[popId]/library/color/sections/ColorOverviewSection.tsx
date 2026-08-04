"use client"

import {
  ACCESSIBILITY_NOTES,
  ALPHA_SWATCHES,
  BRAND_RAMP,
  CARD_SWATCH,
  COLOR_ANATOMY,
  COLOR_FOUNDATION_INTRO,
  COLOR_ROLES,
  FORM_CONTROL_SWATCHES,
  NATURE_ACCENT_SWATCHES,
  NEUTRAL_RAMP,
} from "@/app/[siteId]/[popId]/library/color/colorFoundationData"
import { getColorPageMeta } from "@/app/[siteId]/[popId]/library/color/colorLibraryNav"
import {
  AlphaOverlayDemo,
  AppliedColorDemo,
  ColorDocLead,
  ColorDocSection,
  ColorRampStrip,
  ColorRoleTable,
  ColorSwatchCard,
  ColorSwatchGrid,
  ColorUsagePrinciples,
  EmphasisComparison,
  GuidelinePair,
  InteractionStatesDemo,
  ThemeComparison,
} from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function ColorOverviewSection() {
  const meta = getColorPageMeta("colors")!

  return (
    <LibrarySection
      id="colors"
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-10">
        <ColorDocLead>{COLOR_FOUNDATION_INTRO}</ColorDocLead>

        <ColorUsagePrinciples />

        <AppliedColorDemo />

        <ColorDocSection
          id="color-anatomy"
          title="Anatomía del color"
          description="Tres familias componen la paleta Rootsy: saturados de marca, neutros de workspace y transparencias adaptativas."
        >
          <div className="space-y-8">
            {COLOR_ANATOMY.map((block) => (
              <div key={block.id} className="space-y-3">
                <div>
                  <h4 className="text-base font-semibold text-foreground">
                    {block.title}
                  </h4>
                  <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                    {block.description}
                  </p>
                </div>

                {block.id === "saturated" ? (
                  <>
                    <ColorRampStrip swatches={BRAND_RAMP} />
                    <ColorSwatchGrid>
                      {BRAND_RAMP.map((swatch) => (
                        <ColorSwatchCard key={swatch.id} {...swatch} />
                      ))}
                      {NATURE_ACCENT_SWATCHES.map((swatch) => (
                        <ColorSwatchCard key={swatch.id} {...swatch} />
                      ))}
                    </ColorSwatchGrid>
                  </>
                ) : null}

                {block.id === "neutral" ? (
                  <>
                    <ColorRampStrip swatches={NEUTRAL_RAMP} />
                    <ColorSwatchGrid>
                      {NEUTRAL_RAMP.map((swatch) => (
                        <ColorSwatchCard key={swatch.id} {...swatch} />
                      ))}
                      <ColorSwatchCard {...CARD_SWATCH} />
                    </ColorSwatchGrid>
                  </>
                ) : null}

                {block.id === "alpha" ? (
                  <>
                    <AlphaOverlayDemo />
                    <ColorSwatchGrid>
                      {ALPHA_SWATCHES.map((swatch) => (
                        <ColorSwatchCard key={swatch.id} {...swatch} />
                      ))}
                    </ColorSwatchGrid>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </ColorDocSection>

        <ColorDocSection
          id="color-roles"
          title="Roles de color"
          description="Cada rol comunica intención. Elegí el rol antes de fijar un tono específico."
        >
          <ColorRoleTable roles={COLOR_ROLES} />
          <GuidelinePair
            doText="Usá el rol correcto para la situación — marca, neutro, aviso o peligro."
            dontText="No uses un acento decorativo cuando el color debe comunicar éxito o error."
          />
        </ColorDocSection>

        <ColorDocSection
          id="emphasis"
          title="Niveles de énfasis"
          description="El alto énfasis concentra atención; el bajo acompaña sin competir con la acción principal."
        >
          <EmphasisComparison />
        </ColorDocSection>

        <ColorDocSection
          id="interaction"
          title="Estados de interacción"
          description="Reposo, foco activo y hover mantienen coherencia entre menú, botones y formularios."
        >
          <InteractionStatesDemo />
        </ColorDocSection>

        <ColorDocSection
          id="form-colors"
          title="Color en formularios"
          description="Grises neutros para el contorno de controles; verde de foco para el campo activo."
        >
          <ColorSwatchGrid>
            {FORM_CONTROL_SWATCHES.map((swatch) => (
              <ColorSwatchCard key={swatch.id} {...swatch} />
            ))}
          </ColorSwatchGrid>
        </ColorDocSection>

        <ColorDocSection
          id="accessibility"
          title="Accesibilidad"
          description="Objetivos de contraste para texto e interfaz en workspace claro."
        >
          <div className="overflow-hidden rounded-2xl border border-border/70">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Contraste mínimo
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Aplica a
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                    En Rootsy
                  </th>
                </tr>
              </thead>
              <tbody>
                {ACCESSIBILITY_NOTES.map((note) => (
                  <tr
                    key={note.ratio}
                    className="border-b border-border/40 last:border-b-0"
                  >
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {note.ratio}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {note.rule}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {note.applies}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ColorDocSection>

        <ColorDocSection
          id="themes"
          title="Temas"
          description="Dos modos de color conviven en el producto según el contexto de uso."
        >
          <ThemeComparison />
        </ColorDocSection>
      </div>
    </LibrarySection>
  )
}
