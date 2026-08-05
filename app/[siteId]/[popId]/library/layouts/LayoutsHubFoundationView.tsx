"use client"

import {
  LayoutsHubIntro,
  LayoutsModuleContentTypesGrid,
  LayoutsModuleOverviewStrip,
} from "@/app/[siteId]/[popId]/library/layouts/LayoutsModuleDocPrimitives"
import {
  LAYOUTS_RELATED_LINKS,
  getLayoutsPageMeta,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsLibraryNav"
import {
  LayoutsDocLead,
  LayoutsPrinciplesGrid,
  LayoutsSystemHero,
} from "@/app/[siteId]/[popId]/library/layouts/LayoutsDocShared"
import { ROOTSY_LAYOUTS_MANIFESTO, ROOTSY_LAYOUTS_PRINCIPLES } from "@/app/[siteId]/[popId]/library/layouts/rootsyLayoutsSystem"
import { librarySectionHref } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import {
  LibraryDocSection,
  LibraryRelatedLinks,
} from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"
import Link from "next/link"

type Props = {
  sectionId: string
  siteId: string
  popId: string
}

export function LayoutsHubFoundationView({ sectionId, siteId, popId }: Props) {
  if (sectionId !== "layouts") return null

  return (
    <div className="space-y-10">
      <LayoutsSystemHero variant="hub" />
      <LayoutsDocLead>{ROOTSY_LAYOUTS_MANIFESTO}</LayoutsDocLead>
      <LayoutsPrinciplesGrid principles={[...ROOTSY_LAYOUTS_PRINCIPLES]} />
      <LayoutsHubIntro />
      <LayoutsModuleOverviewStrip />

      <LibraryDocSection id="layouts-hub-module" title="Módulo POP">
        <p className="mb-4 text-sm text-muted-foreground">
          <Link
            href={librarySectionHref(siteId, popId, "layouts-module")}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Ver módulo →
          </Link>
        </p>
      </LibraryDocSection>

      <LibraryDocSection id="layouts-hub-content-types" title="Tipos de contenido">
        <LayoutsModuleContentTypesGrid siteId={siteId} popId={popId} />
      </LibraryDocSection>

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

export function getLayoutsHubFoundationHeading(sectionId: string) {
  return getLayoutsPageMeta(sectionId)?.title ?? "Layouts"
}
