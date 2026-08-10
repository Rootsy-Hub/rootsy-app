"use client"

import { getIconographyPageMeta } from "@/app/library/iconography/iconographyLibraryNav"
import {
  IconCategoriesGallery,
  IconColorRolesGrid,
  IconGuidelinesGrid,
  IconLabelDemo,
  IconLibraryCard,
  IconNavActiveDemo,
  IconographyDocLead,
  IconographyDocSection,
  IconographyPrinciplesGrid,
  IconographySystemHero,
  IconographyTechnicalDetails,
  IconSizeTable,
  IconSmallUseCasesList,
  IconTileDemo,
  IconValidationDemo,
  IconVariantDemo,
  IconVisualStyleGrid,
} from "@/app/library/iconography/IconographyDocPrimitives"
import {
  ROOTSY_ICONOGRAPHY_MANIFESTO,
  ROOTSY_ICONOGRAPHY_PRINCIPLES,
} from "@/app/library/iconography/rootsyIconographySystem"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function IconographyOverviewSection() {
  const meta = getIconographyPageMeta("iconography")!

  return (
    <LibrarySection id="iconography" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <IconographySystemHero />
        <IconographyDocLead className="font-canopy">{ROOTSY_ICONOGRAPHY_MANIFESTO}</IconographyDocLead>
        <IconographyPrinciplesGrid principles={[...ROOTSY_ICONOGRAPHY_PRINCIPLES]} />

        <IconographyDocSection
          id="library"
          title="Iconsax"
          description="Tier gratuito — import nombrado, variant Linear, sin SVG ad hoc."
        >
          <IconLibraryCard />
          <IconVariantDemo />
        </IconographyDocSection>

        <IconographyDocSection
          id="visual-style"
          title="Estilo visual"
          description="Linear en UI · Bold en activo · grid 24×24."
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
          description="Tokens icon.color.* — contraste suficiente sobre superficies bruma y card."
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
          description="Ícono + label · Linear vs Bold · gap con token de espaciado."
        >
          <IconLabelDemo />
          <IconNavActiveDemo />
          <IconValidationDemo />
        </IconographyDocSection>

        <IconographyDocSection
          id="icon-tile"
          title="Icon tile"
          description="Para empty states y onboarding — ícono sobre tile savia-50, no inline denso."
        >
          <IconTileDemo />
        </IconographyDocSection>

        <IconographyDocSection id="guidelines" title="Guías Do / Don't">
          <IconGuidelinesGrid />
        </IconographyDocSection>

        <IconographyDocSection
          id="iconography-technical"
          title="Detalles técnicos"
          description="Tamaños, color, variantes Iconsax, import y guías."
        >
          <IconographyTechnicalDetails />
        </IconographyDocSection>
      </div>
    </LibrarySection>
  )
}
