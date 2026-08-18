"use client"

import {
  LibraryDocSection,
  LibraryRelatedLinksSection,
} from "@/app/library/libraryDocPrimitives"
import {
  LAYOUTS_RELATED_LINKS,
  getLayoutsPageMeta,
} from "@/app/library/layouts/layoutsLibraryNav"
import { LayoutsSystemHero } from "@/app/library/layouts/LayoutsDocShared"
import {
  LayoutsOperarCatalogSectionDemo,
  LayoutsOperarContentGridWireframeDemo,
  LayoutsOperarDocSubsection,
  LayoutsOperarOverviewIntro,
  LayoutsOperarTicketSectionDemo,
  LayoutsOperarToolboxSectionDemo,
} from "@/app/library/layouts/LayoutsOperarDocPrimitives"
import { librarySectionHref } from "@/app/library/layoutLibraryShared"
import Link from "next/link"

type Props = {
  sectionId: string
}

export function LayoutsOperarFoundationView({ sectionId }: Props) {
  if (sectionId !== "layouts-operar") return null

  return (
    <div className="space-y-10 rootsy-nature-palette">
      <LayoutsSystemHero variant="operar" />

      <LayoutsOperarOverviewIntro />

      <LibraryDocSection id="layouts-operar-grid" title="1 · Grid">
        <LayoutsOperarDocSubsection title="Catálogo · toolbox · ticket">
          <p className="mb-3 text-sm text-[var(--rootsy-bruma-500)]">
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

      <p className="text-center text-xs text-[var(--rootsy-bruma-500)]">
        Shell padre en{" "}
        <Link
          href={librarySectionHref("layouts-module")}
          className="text-[var(--rootsy-savia-600)] hover:underline"
        >
          Módulo
        </Link>
      </p>

      <LibraryRelatedLinksSection excludeId={sectionId} links={LAYOUTS_RELATED_LINKS} />
    </div>
  )
}

export function getLayoutsOperarFoundationHeading(sectionId: string) {
  return getLayoutsPageMeta(sectionId)?.title ?? "Operar"
}
