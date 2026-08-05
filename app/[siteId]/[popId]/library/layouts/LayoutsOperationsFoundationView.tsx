"use client"

import {
  LayoutsModuleContentRowFrame,
} from "@/app/[siteId]/[popId]/library/layouts/LayoutsModuleDocPrimitives"
import {
  LAYOUTS_RELATED_LINKS,
  getLayoutsPageMeta,
  layoutsOperationsPreviewHref,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsLibraryNav"
import { LayoutsSystemHero } from "@/app/[siteId]/[popId]/library/layouts/LayoutsDocShared"
import {
  LayoutsOperationsFullPageDraft,
  LayoutsOperationsLayoutGridDemo,
} from "@/app/[siteId]/[popId]/library/layouts/LayoutsOperationsDocPrimitives"
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

export function LayoutsOperationsFoundationView({ sectionId, siteId, popId }: Props) {
  if (sectionId !== "layouts-operations") return null

  return (
    <div className="space-y-10 rootsy-nature-palette">
      <LayoutsSystemHero variant="operations" />

      <LibraryDocSection id="layouts-operations-full" title="Vista completa">
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <Link href={layoutsOperationsPreviewHref(siteId, popId)} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" aria-hidden />
                Pantalla completa
              </Link>
            </Button>
          </div>
          <LayoutsModuleContentRowFrame>
            <LayoutsOperationsFullPageDraft composed />
          </LayoutsModuleContentRowFrame>
        </div>
      </LibraryDocSection>

      <LibraryDocSection id="layouts-operations-wireframe" title="Wireframe">
        <LayoutsOperationsLayoutGridDemo contentOnly />
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

export function getLayoutsOperationsFoundationHeading(sectionId: string) {
  return getLayoutsPageMeta(sectionId)?.title ?? "Operaciones"
}
