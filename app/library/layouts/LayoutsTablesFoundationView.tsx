"use client"

import { LibraryRelatedLinksSection } from "@/app/library/libraryDocPrimitives"
import {
  LayoutsTablesContentGridWireframeDemo,
  LayoutsTablesDocSubsection,
  LayoutsTablesFiltersSectionDemo,
  LayoutsTablesModulePreviewDemo,
  LayoutsTablesTableBodySectionDemo,
  LayoutsTablesTableFooterSectionDemo,
  LayoutsTablesSortHeadSectionDemo,
  LayoutsTablesTableHeadDemo,
} from "@/app/library/layouts/LayoutsTablesDocPrimitives"
import {
  LAYOUTS_RELATED_LINKS,
  getLayoutsPageMeta,
} from "@/app/library/layouts/layoutsLibraryNav"
import { LayoutsSystemHero } from "@/app/library/layouts/LayoutsDocShared"
import { librarySectionHref } from "@/app/library/layoutLibraryShared"
import Link from "next/link"

type Props = {
  sectionId: string
}

export function LayoutsTablesFoundationView({ sectionId }: Props) {
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
        <LayoutsTablesDocSubsection title="3.2 · Orden de columnas">
          <LayoutsTablesSortHeadSectionDemo />
        </LayoutsTablesDocSubsection>
      </LibraryDocSection>

      <LibraryDocSection id="layouts-tables-body" title="4 · Body">
        <LayoutsTablesTableBodySectionDemo />
      </LibraryDocSection>

      <LibraryDocSection id="layouts-tables-footer" title="5 · Footer">
        <LayoutsTablesTableFooterSectionDemo />
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

export function getLayoutsTablesFoundationHeading(sectionId: string) {
  return getLayoutsPageMeta(sectionId)?.title ?? "Tablas"
}
