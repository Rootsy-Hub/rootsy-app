"use client"

import { LibraryRelatedLinksSection } from "@/app/library/libraryDocPrimitives"
import {
  UI_COMPONENTS_RELATED_LINKS,
  getUiComponentsPageMeta,
} from "@/app/library/ui-components/uiComponentsLibraryNav"
import { ButtonsUiSection } from "@/app/library/ui-components/sections/ButtonsUiSection"
import { FormsUiSection } from "@/app/library/ui-components/sections/FormsUiSection"
import { BannersUiSection } from "@/app/library/ui-components/sections/BannersUiSection"
import { DropdownUiSection } from "@/app/library/ui-components/sections/DropdownUiSection"
import { MensajeRootsyUiSection } from "@/app/library/ui-components/sections/MensajeRootsyUiSection"
import { ModalsUiSection } from "@/app/library/ui-components/sections/ModalsUiSection"
import { UiComponentsOverviewSection } from "@/app/library/ui-components/sections/UiComponentsOverviewSection"
import type { ReactNode } from "react"

type Props = {
  sectionId: string
}

export function UiComponentsFoundationView({ sectionId }: Props) {
  let content: ReactNode = null

  switch (sectionId) {
    case "ui-components":
      content = <UiComponentsOverviewSection />
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
    case "ui-components-mensaje-rootsy":
      content = <MensajeRootsyUiSection />
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
      <LibraryRelatedLinksSection excludeId={sectionId} links={UI_COMPONENTS_RELATED_LINKS} />
    </div>
  )
}

export function getUiComponentsFoundationHeading(sectionId: string) {
  return getUiComponentsPageMeta(sectionId)?.title ?? "Componentes UI"
}
