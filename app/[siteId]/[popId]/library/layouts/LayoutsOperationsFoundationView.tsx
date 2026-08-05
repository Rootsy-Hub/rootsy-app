"use client"

import {
  LAYOUTS_RELATED_LINKS,
  getLayoutsPageMeta,
  layoutsOperationsPreviewHref,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsLibraryNav"
import {
  LayoutsOperationsFullPageDraft,
  LayoutsOperationsLayoutGridDemo,
  LayoutsOperationsOverviewIntro,
} from "@/app/[siteId]/[popId]/library/layouts/LayoutsOperationsDocPrimitives"
import {
  LibraryDocSection,
  LibraryRelatedLinks,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
  siteId: string
  popId: string
}

export function LayoutsOperationsFoundationView({ sectionId, siteId, popId }: Props) {
  let content: ReactNode = null

  switch (sectionId) {
    case "layouts-operations":
      content = (
        <>
          <LayoutsOperationsOverviewIntro />

          <LibraryDocSection
            id="layouts-operations-draft"
            title="Vista completa"
            description="Header + dos columnas — misma estructura que el wireframe de abajo."
          >
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={layoutsOperationsPreviewHref(siteId, popId)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-4" aria-hidden />
                    Abrir en pantalla completa
                  </Link>
                </Button>
              </div>
              <LayoutsOperationsFullPageDraft />
            </div>
          </LibraryDocSection>

          <LibraryDocSection id="layouts-operations-layout" title="1 · Layout">
            <LayoutsOperationsLayoutGridDemo />
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

export function getLayoutsOperationsFoundationHeading(sectionId: string) {
  return getLayoutsPageMeta(sectionId)?.title ?? "Operaciones"
}
