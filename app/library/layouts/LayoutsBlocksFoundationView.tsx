"use client"

import {
  LayoutsBlocksEntityDesignSectionDemo,
  LayoutsBlocksEmptyStatesSectionDemo,
  LayoutsBlocksLayoutSectionDemo,
  LayoutsBlocksModulePreviewDemo,
} from "@/app/library/layouts/LayoutsBlocksDocPrimitives"
import {
  LAYOUTS_RELATED_LINKS,
  getLayoutsPageMeta,
} from "@/app/library/layouts/layoutsLibraryNav"
import { LayoutsSystemHero } from "@/app/library/layouts/LayoutsDocShared"
import {
  LibraryDocSection,
  LibraryRelatedLinks,
} from "@/app/library/libraryDocPrimitives"
import { librarySectionHref } from "@/app/library/layoutLibraryShared"
import Link from "next/link"

type Props = {
  sectionId: string
}

export function LayoutsBlocksFoundationView({ sectionId }: Props) {
  if (sectionId !== "layouts-blocks") return null

  return (
    <div className="space-y-10">
      <LayoutsSystemHero variant="blocks" />

      <LibraryDocSection id="layouts-blocks-preview" title="Vista previa">
        <LayoutsBlocksModulePreviewDemo />
      </LibraryDocSection>

      <LibraryDocSection id="layouts-blocks-layout" title="1 · Layout">
        <LayoutsBlocksLayoutSectionDemo />
      </LibraryDocSection>

      <LibraryDocSection id="layouts-blocks-design" title="2 · Diseño de caja y cuentas">
        <LayoutsBlocksEntityDesignSectionDemo />
      </LibraryDocSection>

      <LibraryDocSection id="layouts-blocks-empty-states" title="3 · Empty states">
        <LayoutsBlocksEmptyStatesSectionDemo />
      </LibraryDocSection>

      <p className="text-center text-xs text-muted-foreground">
        Shell padre en{" "}
        <Link href={librarySectionHref("layouts-module")} className="text-primary hover:underline">
          Módulo
        </Link>
      </p>

      <div className="space-y-3 border-t border-border/60 pt-8">
        <p className="text-sm font-semibold text-foreground">Relacionado</p>
        <LibraryRelatedLinks excludeId={sectionId} links={LAYOUTS_RELATED_LINKS} />
      </div>
    </div>
  )
}

export function getLayoutsBlocksFoundationHeading(sectionId: string) {
  return getLayoutsPageMeta(sectionId)?.title ?? "Bloques"
}
