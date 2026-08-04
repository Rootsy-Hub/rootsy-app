"use client"

import {
  LAYOUTS_RELATED_LINKS,
  getLayoutsPageMeta,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsLibraryNav"
import {
  LayoutsBlocksCardSurfaceDemo,
  LayoutsBlocksCashRegisterCardsDemo,
  LayoutsBlocksEmptyStateDemo,
  LayoutsBlocksFullPageDraft,
  LayoutsBlocksLayoutGridDemo,
  LayoutsBlocksOverviewIntro,
  LayoutsBlocksSkeletonDemo,
  LayoutsBlocksTreasuryCardsDemo,
} from "@/app/[siteId]/[popId]/library/layouts/LayoutsBlocksDocPrimitives"
import {
  LibraryDocSection,
  LibraryRelatedLinks,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"
import { popScopedHref } from "@/lib/popRoutes"
import Link from "next/link"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
  siteId: string
  popId: string
}

export function LayoutsBlocksFoundationView({ sectionId, siteId, popId }: Props) {
  let content: ReactNode = null

  switch (sectionId) {
    case "layouts-blocks":
      content = (
        <>
          <LayoutsBlocksOverviewIntro />

          <LibraryDocSection
            id="layouts-blocks-draft"
            title="Vista completa"
            description="Preview ensamblada con header nocturno y grid de cuentas — mismos componentes que en producción."
          >
            <LayoutsBlocksFullPageDraft />
            <p className="text-center text-xs text-muted-foreground">
              Implementación de referencia en{" "}
              <Link
                href={popScopedHref(siteId, popId, "accounts")}
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                Cuentas
              </Link>{" "}
              y{" "}
              <Link
                href={popScopedHref(siteId, popId, "cash-registers")}
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                Cajas
              </Link>
            </p>
          </LibraryDocSection>

          <LibraryDocSection id="layouts-blocks-layout" title="1 · Layout">
            <LayoutsBlocksLayoutGridDemo />
          </LibraryDocSection>

          <LibraryDocSection
            id="layouts-blocks-anatomy"
            title="2 · Anatomía de la tarjeta"
            description="Tres zonas — cabecera con meta, cuerpo con saldo principal y pie con stats o acción primaria."
          >
            <LayoutsBlocksCardSurfaceDemo />
          </LibraryDocSection>

          <LibraryDocSection
            id="layouts-blocks-treasury"
            title="3 · Tarjetas de cuenta"
            description="Banco, billetera y efectivo — badges de integración POS/tarjeta y menú contextual."
          >
            <LayoutsBlocksTreasuryCardsDemo />
          </LibraryDocSection>

          <LibraryDocSection
            id="layouts-blocks-cash-registers"
            title="4 · Tarjetas de caja"
            description="Estados abierta, cerrada e inactiva — pill de estado y CTA de apertura de turno."
          >
            <LayoutsBlocksCashRegisterCardsDemo />
          </LibraryDocSection>

          <LibraryDocSection
            id="layouts-blocks-loading"
            title="5 · Carga"
            description="Skeleton por tipo de entidad — misma grilla que el contenido final."
          >
            <LayoutsBlocksSkeletonDemo />
          </LibraryDocSection>

          <LibraryDocSection
            id="layouts-blocks-empty"
            title="6 · Vacío"
            description="Mensaje centrado con borde punteado cuando no hay entidades."
          >
            <LayoutsBlocksEmptyStateDemo />
          </LibraryDocSection>
        </>
      )
      break
    default:
      return null
  }

  return (
    <div className="rootsy-nature-palette space-y-10">
      {content}
      <div className="space-y-3 border-t border-border/60 pt-8">
        <p className="text-sm font-semibold text-foreground">Relacionado</p>
        <LibraryRelatedLinks
          siteId={siteId}
          popId={popId}
          excludeId={sectionId}
          links={LAYOUTS_RELATED_LINKS}
        />
      </div>
    </div>
  )
}

export function getLayoutsBlocksFoundationHeading(sectionId: string) {
  return getLayoutsPageMeta(sectionId)?.title ?? "Bloques"
}
