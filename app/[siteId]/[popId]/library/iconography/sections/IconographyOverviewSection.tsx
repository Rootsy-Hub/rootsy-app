"use client"

import { getIconographyPageMeta } from "@/app/[siteId]/[popId]/library/iconography/iconographyLibraryNav"
import {
  IconCategoriesGallery,
  IconColorRolesGrid,
  IconGuidelinesGrid,
  IconLabelDemo,
  IconLibraryCard,
  IconLibraryComparison,
  IconNavActiveDemo,
  IconographyDocLead,
  IconographyDocSection,
  IconographyManifestoHero,
  IconographyPrinciplesGrid,
  IconSizeTable,
  IconSmallUseCasesList,
  IconTileDemo,
  IconValidationDemo,
  IconVisualStyleGrid,
  IconWeightDemo,
  LucidePhosphorMapTable,
} from "@/app/[siteId]/[popId]/library/iconography/IconographyDocPrimitives"
import {
  ROOTSY_ICONOGRAPHY_MANIFESTO,
  ROOTSY_ICONOGRAPHY_PRINCIPLES,
} from "@/app/[siteId]/[popId]/library/iconography/rootsyIconographySystem"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function IconographyOverviewSection() {
  const meta = getIconographyPageMeta("iconography")!

  return (
    <LibrarySection id="iconography" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <IconographyManifestoHero />
        <IconographyDocLead>{ROOTSY_ICONOGRAPHY_MANIFESTO}</IconographyDocLead>
        <IconographyPrinciplesGrid principles={ROOTSY_ICONOGRAPHY_PRINCIPLES} />

        <IconographyDocSection
          id="library-choice"
          title="Elección de librería"
          description="Phosphor como estándar Rootsy — Lucide permanece en código hasta migración fase 2."
        >
          <IconLibraryComparison />
        </IconographyDocSection>

        <IconographyDocSection
          id="library"
          title="Phosphor como capa de producto"
          description="Import nombrado, pesos Regular / Bold / Fill, sin SVG ad hoc."
        >
          <IconLibraryCard />
          <IconWeightDemo />
        </IconographyDocSection>

        <IconographyDocSection
          id="visual-style"
          title="Estilo visual"
          description="Regular por defecto · Fill en activo · sin íconos orgánicos en producto."
        >
          <IconVisualStyleGrid />
        </IconographyDocSection>

        <IconographyDocSection
          id="sizes"
          title="Tamaño y escala"
          description="16px default · 12px con moderación para chevrons, validación y elementos compactos."
        >
          <IconSizeTable />
          <IconSmallUseCasesList />
        </IconographyDocSection>

        <IconographyDocSection
          id="color"
          title="Color"
          description="Tokens icon.color.* — contraste suficiente sobre superficies canopy y card."
        >
          <IconColorRolesGrid />
        </IconographyDocSection>

        <IconographyDocSection
          id="categories"
          title="Categorías semánticas"
          description="Reutilizar íconos existentes antes de contribuir uno nuevo."
        >
          <IconCategoriesGallery />
        </IconographyDocSection>

        <IconographyDocSection
          id="usage"
          title="Aplicación"
          description="Ícono + label · Regular vs Fill · gap con token de espaciado."
        >
          <IconLabelDemo />
          <IconNavActiveDemo />
          <IconValidationDemo />
        </IconographyDocSection>

        <IconographyDocSection
          id="icon-tile"
          title="Icon tile"
          description="Para empty states y onboarding — ícono sobre tile canopy-mist, no inline denso."
        >
          <IconTileDemo />
        </IconographyDocSection>

        <IconographyDocSection id="guidelines" title="Guías Do / Don't">
          <IconGuidelinesGrid />
        </IconographyDocSection>

        <IconographyDocSection
          id="migration"
          title="Migración Lucide → Phosphor"
          description="Mapa de equivalencias para fase 2 — no mezclar ambos sets en la misma barra de nav."
        >
          <LucidePhosphorMapTable />
        </IconographyDocSection>
      </div>
    </LibrarySection>
  )
}
