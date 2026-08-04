"use client"

import {
  LAYOUTS_RELATED_LINKS,
  getLayoutsPageMeta,
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
            <LayoutsOperationsFullPageDraft />
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
