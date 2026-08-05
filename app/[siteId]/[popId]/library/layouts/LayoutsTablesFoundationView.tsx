"use client"

import {
  LayoutsTablesContentGridWireframeDemo,
  LayoutsTablesDocSubsection,
  LayoutsTablesFiltersSectionDemo,
  LayoutsTablesModulePreviewDemo,
  LayoutsTablesTableBodySectionDemo,
  LayoutsTablesTableFooterSectionDemo,
  LayoutsTablesTableHeadDemo,
} from "@/app/[siteId]/[popId]/library/layouts/LayoutsTablesDocPrimitives"
import {
  LAYOUTS_RELATED_LINKS,
  getLayoutsPageMeta,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsLibraryNav"
import { LayoutsSystemHero } from "@/app/[siteId]/[popId]/library/layouts/LayoutsDocShared"
import {
  LibraryDocSection,
  LibraryRelatedLinks,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"
import { librarySectionHref } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import Link from "next/link"

type Props = {
  sectionId: string
  siteId: string
  popId: string
}

export function LayoutsTablesFoundationView({ sectionId, siteId, popId }: Props) {
  if (sectionId !== "layouts-tables") return null

  return (
    <div className="space-y-10">
      <LayoutsSystemHero variant="tables" />

      <LibraryDocSection id="layouts-tables-preview" title="Vista previa">
        <LayoutsTablesModulePreviewDemo />
      </LibraryDocSection>

      <LibraryDocSection id="layouts-tables-grid" title="1 · Grid">
        <LayoutsTablesDocSubsection title="1.1 · Toolbar · tabla · footer">
          <LayoutsTablesContentGridWireframeDemo />
        </LayoutsTablesDocSubsection>
      </LibraryDocSection>

      <LibraryDocSection id="layouts-tables-filters" title="2 · Filtros">
        <LayoutsTablesFiltersSectionDemo />
      </LibraryDocSection>

      <LibraryDocSection id="layouts-tables-head" title="3 · Header tabla">
        <LayoutsTablesDocSubsection title="3.1 · Selección y columnas">
          <LayoutsTablesTableHeadDemo />
        </LayoutsTablesDocSubsection>
      </LibraryDocSection>

      <LibraryDocSection id="layouts-tables-body" title="4 · Body">
        <LayoutsTablesTableBodySectionDemo />
      </LibraryDocSection>

      <LibraryDocSection id="layouts-tables-footer" title="5 · Footer">
        <LayoutsTablesTableFooterSectionDemo />
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

export function getLayoutsTablesFoundationHeading(sectionId: string) {
  return getLayoutsPageMeta(sectionId)?.title ?? "Tablas"
}
