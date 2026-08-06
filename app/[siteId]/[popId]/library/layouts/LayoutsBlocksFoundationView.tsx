"use client"

import {
  LayoutsBlocksEntityDesignSectionDemo,
  LayoutsBlocksLayoutSectionDemo,
  LayoutsBlocksModulePreviewDemo,
} from "@/app/[siteId]/[popId]/library/layouts/LayoutsBlocksDocPrimitives"
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

export function LayoutsBlocksFoundationView({ sectionId, siteId, popId }: Props) {
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

      <p className="text-center text-xs text-muted-foreground">
        Shell padre en{" "}
        <Link href={librarySectionHref(siteId, popId, "layouts-module")} className="text-primary hover:underline">
          Módulo
        </Link>
      </p>

      <div className="space-y-3 border-t border-border/60 pt-8">
        <p className="text-sm font-semibold text-foreground">Relacionado</p>
        <LibraryRelatedLinks siteId={siteId} popId={popId} excludeId={sectionId} links={LAYOUTS_RELATED_LINKS} />
      </div>
    </div>
  )
}

export function getLayoutsBlocksFoundationHeading(sectionId: string) {
  return getLayoutsPageMeta(sectionId)?.title ?? "Bloques"
}
