"use client"

import type { SaleCatalogCategory } from "@/app/[siteId]/[popId]/sale/actions"
import type { MenuCatalogCategorySection } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { libraryNavItemLabelClass } from "@/app/library/libraryColorTheme"
import type { SaleCatalogViewPersisted } from "@/lib/saleCatalogPreference"
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
  categories: SaleCatalogCategory[]
  categorySections?: MenuCatalogCategorySection[]
  vistaCatalogo: SaleCatalogViewPersisted
  onVistaChange: (view: SaleCatalogViewPersisted) => void
}

export function SaleCatalogSidebarNav({
  categories,
  categorySections,
  vistaCatalogo,
  onVistaChange,
}: Props) {
  return (
    <nav className={layoutsOperarCatalogRailNavClass} aria-label="Filtros del catálogo">
      {!categorySections?.length ? (
        <ul className={layoutsOperarCatalogRailListClass} role="list">
          {categories.map((cat) => {
            const seleccionado =
              vistaCatalogo.modo === "categoria" && vistaCatalogo.categoria === cat.name
            return (
              <li key={cat.id} className={layoutsOperarCatalogRailListItemClass}>
                <button
                  type="button"
                  aria-pressed={seleccionado}
                  onClick={() => onVistaChange({ modo: "categoria", categoria: cat.name })}
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
      ) : (
        categorySections.map((section, sectionIndex) => (
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
                const seleccionado =
                  vistaCatalogo.modo === "categoria" && vistaCatalogo.categoria === filtroKey
                return (
                  <li key={filtroKey} className={layoutsOperarCatalogRailListItemClass}>
                    <button
                      type="button"
                      aria-pressed={seleccionado}
                      onClick={() => onVistaChange({ modo: "categoria", categoria: filtroKey })}
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
        ))
      )}
    </nav>
  )
}
