"use client"

import { TextComponentFoundationView } from "@/app/[siteId]/[popId]/library/text-component/TextComponentFoundationView"
import { isUiComponentsLibrarySection } from "@/app/[siteId]/[popId]/library/ui-components/uiComponentsLibraryNav"
import { UiComponentsFoundationView } from "@/app/[siteId]/[popId]/library/ui-components/UiComponentsFoundationView"
import { isTextComponentLibrarySection } from "@/app/[siteId]/[popId]/library/text-component/textComponentLibraryNav"
import { LayoutFormLibrarySection } from "@/app/[siteId]/[popId]/library/components/LayoutFormLibrarySection"
import { LayoutBannerLibrarySection } from "@/app/[siteId]/[popId]/library/LayoutBannerLibrarySection"
import { LayoutButtonLibrarySection } from "@/app/[siteId]/[popId]/library/LayoutButtonLibrarySection"
import { LayoutDropdownLibrarySection } from "@/app/[siteId]/[popId]/library/LayoutDropdownLibrarySection"
import { LayoutModalLibrarySection } from "@/app/[siteId]/[popId]/library/LayoutModalLibrarySection"
import { LayoutAlertDialogLibrarySection } from "@/app/[siteId]/[popId]/library/LayoutAlertDialogLibrarySection"
import { ConceptFoundationView } from "@/app/[siteId]/[popId]/library/concept/ConceptFoundationView"
import { isConceptLibrarySection } from "@/app/[siteId]/[popId]/library/concept/conceptLibraryNav"
import { ColorNewFoundationView } from "@/app/[siteId]/[popId]/library/color/ColorNewFoundationView"
import { isColorNewLibrarySection } from "@/app/[siteId]/[popId]/library/color/colorNewLibraryNav"
import { isColorLibrarySection } from "@/app/[siteId]/[popId]/library/color/colorLibraryNav"
import { SpacingFoundationView } from "@/app/[siteId]/[popId]/library/spacing/SpacingFoundationView"
import { isSpacingLibrarySection } from "@/app/[siteId]/[popId]/library/spacing/spacingLibraryNav"
import { GridFoundationView } from "@/app/[siteId]/[popId]/library/grid/GridFoundationView"
import { isGridLibrarySection } from "@/app/[siteId]/[popId]/library/grid/gridLibraryNav"
import { TypographyFoundationView } from "@/app/[siteId]/[popId]/library/typography/TypographyFoundationView"
import { isTypographyLibrarySection } from "@/app/[siteId]/[popId]/library/typography/typographyLibraryNav"
import { MotionFoundationView } from "@/app/[siteId]/[popId]/library/motion/MotionFoundationView"
import { isMotionLibrarySection } from "@/app/[siteId]/[popId]/library/motion/motionLibraryNav"
import { IconographyFoundationView } from "@/app/[siteId]/[popId]/library/iconography/IconographyFoundationView"
import { isIconographyLibrarySection } from "@/app/[siteId]/[popId]/library/iconography/iconographyLibraryNav"
import { IllustrationsFoundationView } from "@/app/[siteId]/[popId]/library/illustrations/IllustrationsFoundationView"
import { isIllustrationsLibrarySection } from "@/app/[siteId]/[popId]/library/illustrations/illustrationsLibraryNav"
import { LogosFoundationView } from "@/app/[siteId]/[popId]/library/logos/LogosFoundationView"
import { isLogosLibrarySection } from "@/app/[siteId]/[popId]/library/logos/logosLibraryNav"
import { ElevationFoundationView } from "@/app/[siteId]/[popId]/library/elevation/ElevationFoundationView"
import { isElevationLibrarySection } from "@/app/[siteId]/[popId]/library/elevation/elevationLibraryNav"
import { BorderFoundationView } from "@/app/[siteId]/[popId]/library/border/BorderFoundationView"
import { isBorderLibrarySection } from "@/app/[siteId]/[popId]/library/border/borderLibraryNav"
import { RadiusFoundationView } from "@/app/[siteId]/[popId]/library/radius/RadiusFoundationView"
import { isRadiusLibrarySection } from "@/app/[siteId]/[popId]/library/radius/radiusLibraryNav"
import { LayoutsBlocksFoundationView } from "@/app/[siteId]/[popId]/library/layouts/LayoutsBlocksFoundationView"
import { LayoutsModuleFoundationView } from "@/app/[siteId]/[popId]/library/layouts/LayoutsModuleFoundationView"
import { LayoutsOperarFoundationView } from "@/app/[siteId]/[popId]/library/layouts/LayoutsOperarFoundationView"
import { LayoutsTablesFoundationView } from "@/app/[siteId]/[popId]/library/layouts/LayoutsTablesFoundationView"
import { isLayoutsLibrarySection } from "@/app/[siteId]/[popId]/library/layouts/layoutsLibraryNav"
import {
  LibrarySection,
  SpecCard,
} from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import {
  RootsSortableActionList,
  RootsSortableActionListPanel,
  type RootsSortableActionListItem,
} from "@/components/rootsy-list"
import { useState } from "react"

type LibrarySectionViewProps = {
  sectionId: string
  siteId: string
  popId: string
}

export function LibrarySectionView({
  sectionId,
  siteId,
  popId,
}: LibrarySectionViewProps) {
  const [sortableDemoItems, setSortableDemoItems] = useState<
    RootsSortableActionListItem[]
  >([
    { id: "bebidas", label: "Bebidas", visible: true },
    { id: "verduras", label: "Verduras", visible: true },
    { id: "solo-interno", label: "Solo interno", visible: false },
    { id: "general", label: "[Ejemplo] General", visible: true },
  ])
  const [sortableEditingId, setSortableEditingId] = useState<string | null>(
    null,
  )
  const [sortableEditingName, setSortableEditingName] = useState("")

  if (isConceptLibrarySection(sectionId)) {
    return (
      <ConceptFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  if (isColorLibrarySection(sectionId) || isColorNewLibrarySection(sectionId)) {
    const resolvedSection = isColorLibrarySection(sectionId) ? "colors-new" : sectionId
    return (
      <ColorNewFoundationView
        sectionId={resolvedSection}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  if (isSpacingLibrarySection(sectionId)) {
    return (
      <SpacingFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  if (isGridLibrarySection(sectionId)) {
    return (
      <GridFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  if (isTypographyLibrarySection(sectionId)) {
    return (
      <TypographyFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  if (isMotionLibrarySection(sectionId)) {
    return (
      <MotionFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  if (isIconographyLibrarySection(sectionId)) {
    return (
      <IconographyFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  if (isIllustrationsLibrarySection(sectionId)) {
    return <IllustrationsFoundationView sectionId={sectionId} />
  }

  if (isLogosLibrarySection(sectionId)) {
    return (
      <LogosFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  if (isElevationLibrarySection(sectionId)) {
    return (
      <ElevationFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  if (isBorderLibrarySection(sectionId)) {
    return (
      <BorderFoundationView sectionId={sectionId} siteId={siteId} popId={popId} />
    )
  }

  if (isRadiusLibrarySection(sectionId)) {
    return (
      <RadiusFoundationView sectionId={sectionId} siteId={siteId} popId={popId} />
    )
  }

  if (isLayoutsLibrarySection(sectionId)) {
    if (sectionId === "layouts-module") {
      return (
        <LayoutsModuleFoundationView
          sectionId={sectionId}
          siteId={siteId}
          popId={popId}
        />
      )
    }

    if (sectionId === "layouts-blocks") {
      return (
        <LayoutsBlocksFoundationView
          sectionId={sectionId}
          siteId={siteId}
          popId={popId}
        />
      )
    }

    if (sectionId === "layouts-operar") {
      return (
        <LayoutsOperarFoundationView
          sectionId={sectionId}
          siteId={siteId}
          popId={popId}
        />
      )
    }

    return (
      <LayoutsTablesFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  if (isUiComponentsLibrarySection(sectionId)) {
    return (
      <UiComponentsFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  if (isTextComponentLibrarySection(sectionId)) {
    return (
      <TextComponentFoundationView
        sectionId={sectionId}
        siteId={siteId}
        popId={popId}
      />
    )
  }

  switch (sectionId) {
    case "buttons":
      return <LayoutButtonLibrarySection siteId={siteId} popId={popId} />
    case "formulario":
      return <LayoutFormLibrarySection />
    case "dropdown":
      return <LayoutDropdownLibrarySection siteId={siteId} popId={popId} />
    case "sortable-list":
      return (
          <LibrarySection
            id="sortable-list"
            title="Lista ordenable"
            description="Drag and drop para reordenar, más visibilidad, edición inline y eliminar."
          >
            <SpecCard
              title="RootsSortableActionList"
              source="components/rootsy-list · ArticleCategoriesSaleBoard"
              tokens={["bruma-50 panel", "bruma-200 borde", "icon-button.row.* acciones"]}
            >
              <RootsSortableActionListPanel
                title="Categorías"
                description="Arrastrá para ordenar. Usá el ojo para mostrar u ocultar en ventas."
                footerHint="Los cambios de orden y visibilidad se guardan al soltar o al tocar el ojo."
              >
                <RootsSortableActionList
                  listId="library-sortable-demo"
                  items={sortableDemoItems}
                  onReorder={setSortableDemoItems}
                  canReorder
                  canToggleVisibility
                  canEdit
                  canDelete
                  editingId={sortableEditingId}
                  editingValue={sortableEditingName}
                  editSaveBusy={false}
                  onStartEdit={(item) => {
                    setSortableEditingId(item.id)
                    setSortableEditingName(item.label)
                  }}
                  onCancelEdit={() => {
                    setSortableEditingId(null)
                    setSortableEditingName("")
                  }}
                  onEditingValueChange={setSortableEditingName}
                  onSaveEdit={() => {
                    if (!sortableEditingId || !sortableEditingName.trim()) return
                    setSortableDemoItems((items) =>
                      items.map((item) =>
                        item.id === sortableEditingId
                          ? { ...item, label: sortableEditingName.trim() }
                          : item,
                      ),
                    )
                    setSortableEditingId(null)
                    setSortableEditingName("")
                  }}
                  onDelete={(item) =>
                    setSortableDemoItems((items) =>
                      items.filter((row) => row.id !== item.id),
                    )
                  }
                  onToggleVisibility={(id) =>
                    setSortableDemoItems((items) =>
                      items.map((item) =>
                        item.id === id
                          ? {
                              ...item,
                              visible: item.visible === false,
                            }
                          : item,
                      ),
                    )
                  }
                />
              </RootsSortableActionListPanel>
            </SpecCard>
          </LibrarySection>
      )
    case "feedback":
      return <LayoutBannerLibrarySection siteId={siteId} popId={popId} />
    case "modals":
      return <LayoutModalLibrarySection siteId={siteId} popId={popId} />
    case "modals-alert":
      return <LayoutAlertDialogLibrarySection siteId={siteId} popId={popId} />
    default:
      return null
  }
}
