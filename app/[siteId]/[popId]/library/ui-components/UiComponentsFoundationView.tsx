"use client"

import {
  UI_COMPONENTS_RELATED_LINKS,
  getUiComponentsPageMeta,
} from "@/app/[siteId]/[popId]/library/ui-components/uiComponentsLibraryNav"
import { ButtonsUiSection } from "@/app/[siteId]/[popId]/library/ui-components/sections/ButtonsUiSection"
import { FormsUiSection } from "@/app/[siteId]/[popId]/library/ui-components/sections/FormsUiSection"
import { UiComponentsOverviewSection } from "@/app/[siteId]/[popId]/library/ui-components/sections/UiComponentsOverviewSection"
import { LibraryRelatedLinks } from "@/app/[siteId]/[popId]/library/libraryDocPrimitives"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
  siteId: string
  popId: string
}

export function UiComponentsFoundationView({ sectionId, siteId, popId }: Props) {
  let content: ReactNode = null

  switch (sectionId) {
    case "ui-components":
      content = <UiComponentsOverviewSection siteId={siteId} popId={popId} />
      break
    case "ui-components-buttons":
      content = <ButtonsUiSection />
      break
    case "ui-components-forms":
      content = <FormsUiSection />
      break
    default:
      return null
  }

  return (
    <div className="space-y-10">
      {content}
      <div className="space-y-3 border-t border-border/60 pt-8">
        <p className="text-sm font-semibold text-foreground">Relacionado</p>
        <LibraryRelatedLinks
          siteId={siteId}
          popId={popId}
          excludeId={sectionId}
          links={UI_COMPONENTS_RELATED_LINKS}
        />
      </div>
    </div>
  )
}

export function getUiComponentsFoundationHeading(sectionId: string) {
  return getUiComponentsPageMeta(sectionId)?.title ?? "Componentes UI"
}
