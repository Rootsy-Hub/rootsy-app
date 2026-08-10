"use client"

import { getColorNewPageMeta } from "@/app/library/color/colorNewLibraryNav"
import {
  PosSplitDemo,
  SurfaceStackDemo,
  ThemeGallery,
} from "@/app/library/color/ColorSystemDocPrimitives"
import {
  ColorDocLead,
  ColorDocSection,
  GuidelinePair,
} from "@/app/library/color/ColorDocPrimitives"
import {
  ROOTSY_SURFACE_STACKS,
} from "@/app/library/color/rootsyColorSystem"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function ColorNewThemesSection() {
  const meta = getColorNewPageMeta("colors-new-themes")!

  return (
    <LibrarySection id="colors-new-themes" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <ColorDocLead>
          Cuatro contextos de producto: POS split sombra/bruma, workspace bruma con header
          sombra, marketing noche del parque con savia promocional, y librería como spec
          vivo.
        </ColorDocLead>

        <ColorDocSection
          id="themes-gallery"
          title="Variantes"
          description="Shell, superficie, acción y foco por contexto."
        >
          <ThemeGallery />
        </ColorDocSection>

        <ColorDocSection
          id="themes-split"
          title="Split POS"
          description="Sombra y bruma en la misma pantalla — dosel y neblina del mostrador."
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
            <SurfaceStackDemo themeId="Marketing" layers={ROOTSY_SURFACE_STACKS.marketing} />
            <SurfaceStackDemo themeId="Librería" layers={ROOTSY_SURFACE_STACKS.library} />
          </div>
        </ColorDocSection>

        <GuidelinePair
          doText="Header sombra + cuerpo bruma en workspace y librería — continuidad con POS."
          dontText="No mezcles sombra 900 de marketing como fondo de formularios operativos."
        />
      </div>
    </LibrarySection>
  )
}
