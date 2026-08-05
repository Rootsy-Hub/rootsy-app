"use client"

import { getColorPageMeta } from "@/app/[siteId]/[popId]/library/color/colorLibraryNav"
import {
  ColorDocLead,
  ColorDocSection,
  DarkModeSymmetryDemo,
  NatureFamilyRamp,
  ThemeComparison,
} from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import {
  ALL_NATURE_FAMILIES,
  EARTH_FAMILY,
  NIGHT_FAMILY,
} from "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

function NeutralRampComparison({
  title,
  lightLabel,
  darkLabel,
  lightSteps,
  darkSteps,
}: {
  title: string
  lightLabel: string
  darkLabel: string
  lightSteps: { hex: string }[]
  darkSteps: { hex: string }[]
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs text-muted-foreground">{lightLabel}</p>
          <div className="flex overflow-hidden rounded-xl border border-border/70">
            {lightSteps.map((step, i) => (
              <div
                key={i}
                className="h-10 min-w-0 flex-1"
                style={{ backgroundColor: step.hex }}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-muted-foreground">{darkLabel}</p>
          <div className="flex overflow-hidden rounded-xl border border-border/70">
            {darkSteps.map((step, i) => (
              <div
                key={i}
                className="h-10 min-w-0 flex-1"
                style={{ backgroundColor: step.hex }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ColorPaletteSection() {
  const meta = getColorPageMeta("colors-palette")!

  return (
    <LibrarySection
      id="colors-palette"
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-10">
        <ColorDocLead>
          La paleta completa de Rootsy — canopy como referencia de marca y ocho familias nature
          complementarias. Para ceniza, bruma, savia y landing, ver Color (nuevo).
        </ColorDocLead>

        <ColorDocSection
          id="palette-all"
          title="Familias saturadas y paisaje"
          description="Verde, otoño, fuego, cielo, mar, crepúsculo, tierra y noche."
        >
          <div className="space-y-10">
            {ALL_NATURE_FAMILIES.map((family) => (
              <NatureFamilyRamp key={family.id} family={family} />
            ))}
          </div>
        </ColorDocSection>

        <ColorDocSection
          id="palette-neutrals"
          title="Neutros · tierra y noche"
          description="Arena bajo sol · carbón bajo luna."
        >
          <NeutralRampComparison
            title="Superficies"
            lightLabel="Tierra · workspace"
            darkLabel="Noche · mostrador"
            lightSteps={EARTH_FAMILY.steps.slice(-5)}
            darkSteps={NIGHT_FAMILY.steps}
          />
        </ColorDocSection>

        <ColorDocSection
          id="palette-mapping"
          title="Simetría claro / oscuro"
          description="El intenso en claro se ilumina en oscuro — misma jerarquía, distinta hora del día."
        >
          <DarkModeSymmetryDemo />
          <ThemeComparison />
        </ColorDocSection>
      </div>
    </LibrarySection>
  )
}
