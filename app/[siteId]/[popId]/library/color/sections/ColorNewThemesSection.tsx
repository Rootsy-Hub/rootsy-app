"use client"

import { getColorNewPageMeta } from "@/app/[siteId]/[popId]/library/color/colorNewLibraryNav"
import {
  PosSplitDemo,
  SurfaceStackDemo,
  ThemeGallery,
} from "@/app/[siteId]/[popId]/library/color/ColorSystemDocPrimitives"
import {
  ColorDocLead,
  ColorDocSection,
  GuidelinePair,
} from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import {
  ROOTSY_SURFACE_STACKS,
  ROOTSY_THEMES,
} from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function ColorNewThemesSection() {
  const meta = getColorNewPageMeta("colors-new-themes")!

  return (
    <LibrarySection id="colors-new-themes" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <ColorDocLead>
          Tres pantallas de producto más la librería como spec vivo: POS split
          ceniza/bruma, workspace bruma con header ceniza, landing carbón con savia
          promocional.
        </ColorDocLead>

        <ColorDocSection
          id="themes-gallery"
          title="Variantes"
          description="Shell, superficie, acción y foco por contexto."
        >
          <ThemeGallery />
        </ColorDocSection>

        <ColorDocSection
          id="themes-tokens"
          title="Valores base"
          description="Referencia de implementación."
        >
          <div className="overflow-hidden rounded-2xl border border-border/70">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tema
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                    Shell
                  </th>
                  <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                    Acción
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Foco
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROOTSY_THEMES.map((theme) => (
                  <tr key={theme.id} className="border-b border-border/40 last:border-b-0">
                    <td className="px-4 py-3 font-medium text-foreground">{theme.label}</td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <code className="text-xs text-muted-foreground">{theme.shell}</code>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span
                        className="inline-flex rounded-md px-2 py-0.5 text-xs font-medium text-white"
                        style={{ backgroundColor: theme.action }}
                      >
                        {theme.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ color: theme.accent }} className="text-sm font-semibold">
                        {theme.accent}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ColorDocSection>

        <ColorDocSection
          id="themes-split"
          title="Split POS"
          description="Ceniza y bruma en la misma pantalla — regla de oro del mostrador."
        >
          <PosSplitDemo />
        </ColorDocSection>

        <ColorDocSection
          id="themes-surfaces"
          title="Pilas de superficie"
          description="Elevación por capas en cada contexto."
        >
          <div className="grid gap-8 lg:grid-cols-2">
            <SurfaceStackDemo themeId="POS" layers={ROOTSY_SURFACE_STACKS.pos} />
            <SurfaceStackDemo themeId="Workspace" layers={ROOTSY_SURFACE_STACKS.workspace} />
            <SurfaceStackDemo themeId="Landing" layers={ROOTSY_SURFACE_STACKS.landing} />
            <SurfaceStackDemo themeId="Librería" layers={ROOTSY_SURFACE_STACKS.library} />
          </div>
        </ColorDocSection>

        <GuidelinePair
          doText="Header ceniza + cuerpo bruma en workspace y librería — continuidad con POS."
          dontText="No mezcles landing 950 como fondo de formularios operativos."
        />
      </div>
    </LibrarySection>
  )
}
