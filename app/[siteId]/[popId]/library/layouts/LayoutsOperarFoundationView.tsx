"use client"

import {
  LAYOUTS_RELATED_LINKS,
  getLayoutsPageMeta,
  layoutsOperarPreviewHref,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsLibraryNav"
import { LayoutsSystemHero } from "@/app/[siteId]/[popId]/library/layouts/LayoutsDocShared"
import {
  LayoutsOperarCatalogSectionDemo,
  LayoutsOperarContentGridWireframeDemo,
  LayoutsOperarDocSubsection,
  LayoutsOperarFullPageDraft,
  LayoutsOperarOverviewIntro,
  LayoutsOperarTicketSectionDemo,
  LayoutsOperarToolboxSectionDemo,
} from "@/app/[siteId]/[popId]/library/layouts/LayoutsOperarDocPrimitives"
import {
  LibraryDocSection,
  LibraryRelatedLinks,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"
import { librarySectionHref } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

type Props = {
  sectionId: string
  siteId: string
  popId: string
}

export function LayoutsOperarFoundationView({ sectionId, siteId, popId }: Props) {
  if (sectionId !== "layouts-operar") return null

  return (
    <div className="space-y-10 rootsy-nature-palette">
      <LayoutsSystemHero variant="operar" />

      <LayoutsOperarOverviewIntro />

      <LibraryDocSection id="layouts-operar-preview" title="Vista previa">
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <Link
                href={layoutsOperarPreviewHref(siteId, popId)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" aria-hidden />
                Pantalla completa
              </Link>
            </Button>
          </div>
          <LayoutsOperarFullPageDraft />
        </div>
      </LibraryDocSection>

      <LibraryDocSection id="layouts-operar-grid" title="1 · Grid">
        <LayoutsOperarDocSubsection title="Catálogo · toolbox · ticket">
          <p className="mb-3 text-sm text-muted-foreground">
            Anatomía del grid — solo zonas y medidas (sin contenido compuesto).
          </p>
          <LayoutsOperarContentGridWireframeDemo />
        </LayoutsOperarDocSubsection>
      </LibraryDocSection>

      <LibraryDocSection id="layouts-operar-catalog" title="2 · Catálogo">
        <LayoutsOperarCatalogSectionDemo />
      </LibraryDocSection>

      <LibraryDocSection id="layouts-operar-toolbox" title="3 · Toolbox">
        <LayoutsOperarToolboxSectionDemo />
      </LibraryDocSection>

      <LibraryDocSection id="layouts-operar-ticket" title="4 · Ticket">
        <LayoutsOperarTicketSectionDemo />
      </LibraryDocSection>

      <p className="text-center text-xs text-muted-foreground">
        Shell padre en{" "}
        <Link
          href={librarySectionHref(siteId, popId, "layouts-module")}
          className="text-primary hover:underline"
        >
          Módulo
        </Link>
      </p>

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

export function getLayoutsOperarFoundationHeading(sectionId: string) {
  return getLayoutsPageMeta(sectionId)?.title ?? "Operar"
}
