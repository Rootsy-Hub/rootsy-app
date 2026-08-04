"use client"

import {
  ButtonAppearancesGallery,
  ButtonAppearancesTable,
  ButtonDocLead,
  ButtonDocSection,
  ButtonGroupDemo,
  ButtonGuidelinesGrid,
  ButtonIconsDemo,
  ButtonManifestoHero,
  ButtonModalFooterDemo,
  ButtonPrinciplesGrid,
  ButtonRelatedLinks,
  ButtonSemanticTable,
  ButtonSizesDemo,
  ButtonStatesDemo,
} from "@/app/[siteId]/[popId]/library/button/ButtonDocPrimitives"
import {
  ROOTSY_BUTTON_MANIFESTO,
  ROOTSY_BUTTON_PRINCIPLES,
} from "@/app/[siteId]/[popId]/library/button/rootsyButtonSystem"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

type Props = {
  siteId?: string
  popId?: string
}

export function LayoutButtonLibrarySection({ siteId = "", popId = "" }: Props) {
  return (
    <LibrarySection
      id="buttons"
      title="Botones"
      description="Dispara una acción — appearance, tamaño, iconos y estados alineados a Atlassian Button."
    >
      <div className="space-y-10">
        <ButtonManifestoHero />
        <ButtonDocLead>{ROOTSY_BUTTON_MANIFESTO}</ButtonDocLead>
        <ButtonPrinciplesGrid principles={ROOTSY_BUTTON_PRINCIPLES} />

        <ButtonDocSection
          id="appearances"
          title="Appearances"
          description="default · primary · subtle · danger · link — mapeados a components/ui/button y rootsButtonStyles."
        >
          <ButtonAppearancesGallery />
          <ButtonAppearancesTable />
        </ButtonDocSection>

        <ButtonDocSection
          id="sizes"
          title="Tamaños"
          description="default en formularios · compact solo en superficies densas · icon con aria-label."
        >
          <ButtonSizesDemo />
        </ButtonDocSection>

        <ButtonDocSection
          id="icons"
          title="Iconos"
          description="iconBefore / iconAfter — currentColor, size-4, gap-2."
        >
          <ButtonIconsDemo />
        </ButtonDocSection>

        <ButtonDocSection
          id="states"
          title="Estados"
          description="disabled · loading · selected — sin layout shift en progreso."
        >
          <ButtonStatesDemo />
        </ButtonDocSection>

        <ButtonDocSection
          id="patterns"
          title="Patrones compuestos"
          description="Button group, footer de modal y jerarquía izquierda/derecha."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <ButtonGroupDemo />
            <ButtonModalFooterDemo />
          </div>
        </ButtonDocSection>

        <ButtonDocSection
          id="semantic"
          title="Mapeo en producto"
          description="Dónde vive cada appearance hoy en Rootsy."
        >
          <ButtonSemanticTable />
        </ButtonDocSection>

        <ButtonDocSection id="guidelines" title="Guías Do / Don't">
          <ButtonGuidelinesGrid />
        </ButtonDocSection>

        {siteId && popId ? (
          <ButtonDocSection id="related" title="Fundamentos relacionados">
            <ButtonRelatedLinks siteId={siteId} popId={popId} />
          </ButtonDocSection>
        ) : null}
      </div>
    </LibrarySection>
  )
}
