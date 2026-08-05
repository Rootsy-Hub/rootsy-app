"use client"

import {
  LayoutsDocLead,
  LayoutsPrinciplesGrid,
  LayoutsSystemHero,
} from "@/app/[siteId]/[popId]/library/layouts/LayoutsDocShared"
import {
  LAYOUTS_RELATED_LINKS,
  getLayoutsPageMeta,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsLibraryNav"
import {
  ROOTSY_LAYOUTS_MANIFESTO,
  ROOTSY_LAYOUTS_PRINCIPLES,
} from "@/app/[siteId]/[popId]/library/layouts/rootsyLayoutsSystem"
import {
  LayoutsTablesChromeButtonsDemo,
  LayoutsTablesFooterComponentsDemo,
  LayoutsTablesFullPageDraft,
  LayoutsTablesHeaderStructureDemo,
  LayoutsTablesLayoutGridDemo,
  LayoutsTablesOverviewIntro,
  LayoutsTablesPopProfileDemo,
  LayoutsTablesPrimaryIconButtonsDemo,
  LayoutsTablesSecondaryIconButtonsDemo,
  LayoutsTablesUserProfileDemo,
} from "@/app/[siteId]/[popId]/library/layouts/LayoutsTablesDocPrimitives"
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

export function LayoutsTablesFoundationView({ sectionId, siteId, popId }: Props) {
  let content: ReactNode = null

  switch (sectionId) {
    case "layouts":
      content = (
        <>
          <LayoutsSystemHero variant="hub" />
          <LayoutsDocLead className="font-canopy">{ROOTSY_LAYOUTS_MANIFESTO}</LayoutsDocLead>
          <LayoutsPrinciplesGrid principles={[...ROOTSY_LAYOUTS_PRINCIPLES]} />
          <LayoutsTablesOverviewIntro />
        </>
      )
      break
    case "layouts-tables":
      content = (
        <>
          <LayoutsSystemHero variant="tables" />
          <LibraryDocSection
            id="layouts-tables-draft"
            title="Vista completa"
            description="Preview ensamblada — cualquier cambio en las piezas de abajo se refleja acá porque comparten los mismos bloques."
          >
            <LayoutsTablesFullPageDraft />
            <p className="text-center text-xs text-muted-foreground">
              Misma composición que{" "}
              <Link
                href={popScopedHref(siteId, popId, "layout")}
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                Layout tablas
              </Link>{" "}
              en el POP
            </p>
          </LibraryDocSection>

          <LibraryDocSection id="layouts-tables-layout" title="1 · Layout">
            <LayoutsTablesLayoutGridDemo />
          </LibraryDocSection>

          <LibraryDocSection
            id="layouts-tables-header-structure"
            title="2 · Estructura del header"
            description="Tres columnas iguales — izquierda botones + POP, centro título, derecha acciones + usuario."
          >
            <LayoutsTablesHeaderStructureDemo />
          </LibraryDocSection>

          <LibraryDocSection
            id="layouts-tables-footer"
            title="3 · Componentes del footer"
          >
            <LayoutsTablesFooterComponentsDemo />
          </LibraryDocSection>

          <LibraryDocSection
            id="layouts-tables-buttons"
            title="Botones"
            description="Chrome a la izquierda · IconButton dark a la derecha (misma familia)."
          >
            <div className="flex flex-wrap items-start gap-4">
              <LayoutsTablesChromeButtonsDemo />
              <LayoutsTablesSecondaryIconButtonsDemo />
              <LayoutsTablesPrimaryIconButtonsDemo />
            </div>
          </LibraryDocSection>

          <LibraryDocSection
            id="layouts-tables-profiles"
            title="Perfil POP · Perfil usuario"
          >
            <div className="flex flex-wrap items-start gap-4">
              <LayoutsTablesPopProfileDemo />
              <LayoutsTablesUserProfileDemo />
            </div>
          </LibraryDocSection>
        </>
      )
      break
    default:
      return null
  }

  return (
    <div className="space-y-10">
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

export function getLayoutsFoundationHeading(sectionId: string) {
  return getLayoutsPageMeta(sectionId)?.title ?? "Layouts"
}
