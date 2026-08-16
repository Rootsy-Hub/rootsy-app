"use client"

import { LibraryRelatedLinksSection } from "@/app/library/libraryDocPrimitives"
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

      <p className="text-center text-xs text-[var(--rootsy-bruma-500)]">
        Shell padre en{" "}
        <Link href={librarySectionHref("layouts-module")} className="text-[var(--rootsy-savia-600)] hover:underline">
          Módulo
        </Link>
      </p>

      <LibraryRelatedLinksSection excludeId={sectionId} links={LAYOUTS_RELATED_LINKS} />
    </div>
  )
}

export function getLayoutsBlocksFoundationHeading(sectionId: string) {
  return getLayoutsPageMeta(sectionId)?.title ?? "Bloques"
}
