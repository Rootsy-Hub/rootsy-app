"use client"

import { TextComponentFoundationView } from "@/app/library/text-component/TextComponentFoundationView"
import { isUiComponentsLibrarySection } from "@/app/library/ui-components/uiComponentsLibraryNav"
import { UiComponentsFoundationView } from "@/app/library/ui-components/UiComponentsFoundationView"
import { isTextComponentLibrarySection } from "@/app/library/text-component/textComponentLibraryNav"
import { LayoutFormLibrarySection } from "@/app/library/components/LayoutFormLibrarySection"
import { LayoutBannerLibrarySection } from "@/app/library/LayoutBannerLibrarySection"
import { LayoutButtonLibrarySection } from "@/app/library/LayoutButtonLibrarySection"
import { LayoutDropdownLibrarySection } from "@/app/library/LayoutDropdownLibrarySection"
import { LayoutModalLibrarySection } from "@/app/library/LayoutModalLibrarySection"
import { LayoutAlertDialogLibrarySection } from "@/app/library/LayoutAlertDialogLibrarySection"
import { ConceptFoundationView } from "@/app/library/concept/ConceptFoundationView"
import { isConceptLibrarySection } from "@/app/library/concept/conceptLibraryNav"
import { ColorNewFoundationView } from "@/app/library/color/ColorNewFoundationView"
import { isColorNewLibrarySection } from "@/app/library/color/colorNewLibraryNav"
import { MundosFoundationView } from "@/app/library/mundos/MundosFoundationView"
import { isMundosLibrarySection } from "@/app/library/mundos/mundosLibraryNav"
import { isColorLibrarySection } from "@/app/library/color/colorLibraryNav"
import { SpacingFoundationView } from "@/app/library/spacing/SpacingFoundationView"
import { isSpacingLibrarySection } from "@/app/library/spacing/spacingLibraryNav"
import { GridFoundationView } from "@/app/library/grid/GridFoundationView"
import { isGridLibrarySection } from "@/app/library/grid/gridLibraryNav"
import { TypographyFoundationView } from "@/app/library/typography/TypographyFoundationView"
import { isTypographyLibrarySection } from "@/app/library/typography/typographyLibraryNav"
import { MotionFoundationView } from "@/app/library/motion/MotionFoundationView"
import { isMotionLibrarySection } from "@/app/library/motion/motionLibraryNav"
import { IconographyFoundationView } from "@/app/library/iconography/IconographyFoundationView"
import { isIconographyLibrarySection } from "@/app/library/iconography/iconographyLibraryNav"
import { IllustrationsFoundationView } from "@/app/library/illustrations/IllustrationsFoundationView"
import { isIllustrationsLibrarySection } from "@/app/library/illustrations/illustrationsLibraryNav"
import { LogosFoundationView } from "@/app/library/logos/LogosFoundationView"
import { isLogosLibrarySection } from "@/app/library/logos/logosLibraryNav"
import { ElevationFoundationView } from "@/app/library/elevation/ElevationFoundationView"
import { isElevationLibrarySection } from "@/app/library/elevation/elevationLibraryNav"
import { BorderFoundationView } from "@/app/library/border/BorderFoundationView"
import { isBorderLibrarySection } from "@/app/library/border/borderLibraryNav"
import { RadiusFoundationView } from "@/app/library/radius/RadiusFoundationView"
import { isRadiusLibrarySection } from "@/app/library/radius/radiusLibraryNav"
import { LayoutsBlocksFoundationView } from "@/app/library/layouts/LayoutsBlocksFoundationView"
import { LayoutsModuleFoundationView } from "@/app/library/layouts/LayoutsModuleFoundationView"
import { LayoutsOperarFoundationView } from "@/app/library/layouts/LayoutsOperarFoundationView"
import { LayoutsTablesFoundationView } from "@/app/library/layouts/LayoutsTablesFoundationView"
import { isLayoutsLibrarySection } from "@/app/library/layouts/layoutsLibraryNav"
import {
  LibrarySection,
  SpecCard,
} from "@/app/library/layoutLibraryShared"
import {
  RootsSortableActionList,
  RootsSortableActionListPanel,
  type RootsSortableActionListItem,
} from "@/components/rootsy-list"
import { useState } from "react"

type LibrarySectionViewProps = {
  sectionId: string
}

export function LibrarySectionView({ sectionId }: LibrarySectionViewProps) {
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
    return <ConceptFoundationView sectionId={sectionId} />
  }

  if (isColorLibrarySection(sectionId) || isColorNewLibrarySection(sectionId)) {
    const resolvedSection = isColorLibrarySection(sectionId) ? "colors-new" : sectionId
    return <ColorNewFoundationView sectionId={resolvedSection} />
  }

  if (isMundosLibrarySection(sectionId)) {
    return <MundosFoundationView sectionId={sectionId} />
  }

  if (isSpacingLibrarySection(sectionId)) {
    return <SpacingFoundationView sectionId={sectionId} />
  }

  if (isGridLibrarySection(sectionId)) {
    return <GridFoundationView sectionId={sectionId} />
  }

  if (isTypographyLibrarySection(sectionId)) {
    return <TypographyFoundationView sectionId={sectionId} />
  }

  if (isMotionLibrarySection(sectionId)) {
    return <MotionFoundationView sectionId={sectionId} />
  }

  if (isIconographyLibrarySection(sectionId)) {
    return <IconographyFoundationView sectionId={sectionId} />
  }

  if (isIllustrationsLibrarySection(sectionId)) {
    return <IllustrationsFoundationView sectionId={sectionId} />
  }

  if (isLogosLibrarySection(sectionId)) {
    return <LogosFoundationView sectionId={sectionId} />
  }

  if (isElevationLibrarySection(sectionId)) {
    return <ElevationFoundationView sectionId={sectionId} />
  }

  if (isBorderLibrarySection(sectionId)) {
    return <BorderFoundationView sectionId={sectionId} />
  }

  if (isRadiusLibrarySection(sectionId)) {
    return <RadiusFoundationView sectionId={sectionId} />
  }

  if (isLayoutsLibrarySection(sectionId)) {
    if (sectionId === "layouts-module") {
      return <LayoutsModuleFoundationView sectionId={sectionId} />
    }

    if (sectionId === "layouts-blocks") {
      return <LayoutsBlocksFoundationView sectionId={sectionId} />
    }

    if (sectionId === "layouts-operar") {
      return <LayoutsOperarFoundationView sectionId={sectionId} />
    }

    return <LayoutsTablesFoundationView sectionId={sectionId} />
  }

  if (isUiComponentsLibrarySection(sectionId)) {
    return <UiComponentsFoundationView sectionId={sectionId} />
  }

  if (isTextComponentLibrarySection(sectionId)) {
    return <TextComponentFoundationView sectionId={sectionId} />
  }

  switch (sectionId) {
    case "buttons":
      return <LayoutButtonLibrarySection />
    case "formulario":
      return <LayoutFormLibrarySection />
    case "dropdown":
      return <LayoutDropdownLibrarySection />
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
      return <LayoutBannerLibrarySection />
    case "modals":
      return <LayoutModalLibrarySection />
    case "modals-alert":
      return <LayoutAlertDialogLibrarySection />
    default:
      return null
  }
}
