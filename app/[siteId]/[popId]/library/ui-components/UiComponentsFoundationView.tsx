"use client"

import {
  UI_COMPONENTS_RELATED_LINKS,
  getUiComponentsPageMeta,
} from "@/app/[siteId]/[popId]/library/ui-components/uiComponentsLibraryNav"
import { ButtonsUiSection } from "@/app/[siteId]/[popId]/library/ui-components/sections/ButtonsUiSection"
import { FormsUiSection } from "@/app/[siteId]/[popId]/library/ui-components/sections/FormsUiSection"
import { BannersUiSection } from "@/app/[siteId]/[popId]/library/ui-components/sections/BannersUiSection"
import { DropdownUiSection } from "@/app/[siteId]/[popId]/library/ui-components/sections/DropdownUiSection"
import { ModalsUiSection } from "@/app/[siteId]/[popId]/library/ui-components/sections/ModalsUiSection"
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
    case "ui-components-modals":
      content = <ModalsUiSection />
      break
    case "ui-components-banners":
      content = <BannersUiSection />
      break
    case "ui-components-dropdown":
      content = <DropdownUiSection />
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
