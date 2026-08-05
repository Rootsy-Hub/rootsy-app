"use client"

import {
  ButtonAppearancesSpecTable,
  ButtonColorTokensGallery,
  ButtonDocLead,
  ButtonDocSection,
  ButtonGuidelinesGrid,
  ButtonIconButtonsGallery,
  ButtonIconsDemo,
  ButtonManifestoHero,
  ButtonPatternsDemo,
  ButtonPrinciplesGrid,
  ButtonRelatedLinks,
  ButtonSemanticTable,
  ButtonSizesMatrix,
  ButtonSizesSpecTable,
  ButtonStatesDemo,
  ButtonVariantMatrix,
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
      description="Dispara una acción — cinco appearances, tres tamaños, icon buttons y estados sobre bruma y savia."
    >
      <div className="space-y-10">
        <ButtonManifestoHero />
        <ButtonDocLead>{ROOTSY_BUTTON_MANIFESTO}</ButtonDocLead>
        <ButtonPrinciplesGrid principles={ROOTSY_BUTTON_PRINCIPLES} />

        <ButtonDocSection
          id="colors"
          title="Color"
          description="Savia en primary y link · bruma en default y subtle · rojo funcional en danger."
        >
          <ButtonColorTokensGallery />
        </ButtonDocSection>

        <ButtonDocSection
          id="variants"
          title="Variantes"
          description="Matriz completa — appearance × estado. Referencia principal del componente."
        >
          <ButtonVariantMatrix />
        </ButtonDocSection>

        <ButtonDocSection
          id="appearances"
          title="Appearances"
          description="primary · default · subtle · danger · link — tokens, uso y reglas."
        >
          <ButtonAppearancesSpecTable />
        </ButtonDocSection>

        <ButtonDocSection
          id="sizes"
          title="Tamaños"
          description="Compact · default · large — misma jerarquía en primary, default y subtle."
        >
          <ButtonSizesMatrix />
          <ButtonSizesSpecTable />
        </ButtonDocSection>

        <ButtonDocSection
          id="icon-buttons"
          title="Icon buttons"
          description="RootsIconButton — light, dark, ghost, secondary y action en tablas."
        >
          <ButtonIconButtonsGallery />
        </ButtonDocSection>

        <ButtonDocSection
          id="icons"
          title="Iconos en botones"
          description="iconBefore / iconAfter — currentColor, size-4, gap-2."
        >
          <ButtonIconsDemo />
        </ButtonDocSection>

        <ButtonDocSection
          id="states"
          title="Estados"
          description="Loading, selected y disabled — sin layout shift en progreso."
        >
          <ButtonStatesDemo />
        </ButtonDocSection>

        <ButtonDocSection
          id="patterns"
          title="Patrones"
          description="Button group y footer de modal — jerarquía izquierda/derecha."
        >
          <ButtonPatternsDemo />
        </ButtonDocSection>

        <ButtonDocSection
          id="semantic"
          title="En producto"
          description="Dónde vive cada appearance hoy en Rootsy."
        >
          <ButtonSemanticTable />
        </ButtonDocSection>

        <ButtonDocSection id="guidelines" title="Guías">
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
