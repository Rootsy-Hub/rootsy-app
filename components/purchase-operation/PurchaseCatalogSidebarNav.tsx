"use client"

import type { PurchaseCatalogCategorySection } from "@/app/[siteId]/[popId]/purchases/actions"
import { libraryNavItemLabelClass } from "@/app/library/libraryColorTheme"
import type { PurchaseCatalogView } from "@/components/purchase-operation/purchaseCatalogTypes"
import {
  layoutsOperarCatalogRailItemClass,
  layoutsOperarCatalogRailItemSelectedClass,
  layoutsOperarCatalogRailListClass,
  layoutsOperarCatalogRailListItemClass,
  layoutsOperarCatalogRailNavClass,
  layoutsOperarCatalogRailSectionGroupClass,
  layoutsOperarCatalogRailSectionGroupDividerClass,
  layoutsOperarCatalogRailSectionLabelClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"

type Props = {
  categorySections: readonly PurchaseCatalogCategorySection[]
  vistaCatalogo: PurchaseCatalogView
  onVistaChange: (view: PurchaseCatalogView) => void
}

export function PurchaseCatalogSidebarNav({
  categorySections,
  vistaCatalogo,
  onVistaChange,
}: Props) {
  return (
    <nav className={layoutsOperarCatalogRailNavClass} aria-label="Filtros del catálogo">
      {categorySections.map((section, sectionIndex) => (
        <div
          key={section.id}
          className={cn(
            layoutsOperarCatalogRailSectionGroupClass,
            sectionIndex > 0 && layoutsOperarCatalogRailSectionGroupDividerClass,
          )}
        >
          <p className={layoutsOperarCatalogRailSectionLabelClass}>{section.label}</p>
          <ul className={layoutsOperarCatalogRailListClass} role="list">
            {section.categories.map((cat) => {
              const filtroKey = `${section.id}:${cat.id}`
              const seleccionado = vistaCatalogo.categoria === filtroKey
              return (
                <li key={filtroKey} className={layoutsOperarCatalogRailListItemClass}>
                  <button
                    type="button"
                    aria-pressed={seleccionado}
                    onClick={() =>
                      onVistaChange({ modo: "categoria", categoria: filtroKey })
                    }
                    className={cn(
                      layoutsOperarCatalogRailItemClass,
                      seleccionado && layoutsOperarCatalogRailItemSelectedClass,
                    )}
                  >
                    <span className={libraryNavItemLabelClass}>{cat.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
