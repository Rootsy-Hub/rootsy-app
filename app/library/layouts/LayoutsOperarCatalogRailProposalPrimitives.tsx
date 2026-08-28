"use client"

import "@/app/library/layouts/layoutsOperarTheme.css"
import "@/app/library/libraryColorTheme.css"
import "@/app/library/radius/rootsyRadiusSystem.css"
import { getLayoutsOperarGridCssVariables } from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import {
  layoutsOperarBodyScopeClass,
  layoutsOperarCatalogRailItemClass,
  layoutsOperarCatalogRailItemSelectedClass,
  layoutsOperarCatalogRailItemWithIconClass,
  layoutsOperarCatalogRailListClass,
  layoutsOperarCatalogRailListItemClass,
  layoutsOperarCatalogRailNavClass,
  layoutsOperarCatalogRailSectionGroupClass,
  layoutsOperarCatalogRailSectionGroupDividerClass,
  layoutsOperarCatalogRailSectionLabelClass,
  layoutsOperarCatalogSidebarClass,
  layoutsOperarCatalogSidebarOpenClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  libraryNavItemIconClass,
  libraryNavItemLabelClass,
} from "@/app/library/libraryColorTheme"
import { MenuSidebar } from "@/components/MenuSidebar"
import { cn } from "@/lib/utils"
import { Percent, Tag } from "lucide-react"
import { useState } from "react"

export const LAYOUTS_OPERAR_DEMO_CATALOG_CATEGORIES = [
  "Bebidas",
  "Panadería",
  "Lácteos",
  "Fiambres",
  "Verdulería",
  "Almacén",
] as const

type DemoCatalogView =
  | { modo: "categoria"; categoria: string }
  | { modo: "promociones" }
  | { modo: "con_descuento" }

const DEMO_CATALOG_VIEW_DEFAULT: DemoCatalogView = {
  modo: "categoria",
  categoria: "Todos",
}

export function LayoutsOperarCatalogRailDemoShell({
  children,
  heightClass = "h-[28rem]",
  className,
}: {
  children: React.ReactNode
  heightClass?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "library-doc-table-shell overflow-hidden rounded-2xl",
        heightClass,
        className,
      )}
    >
      <div
        className={cn(
          "rootsy-theme-pos rootsy-radius-system h-full bg-[var(--rootsy-negro)]",
          layoutsOperarBodyScopeClass,
        )}
        style={getLayoutsOperarGridCssVariables()}
      >
        <MenuSidebar
          collapseBelow={false}
          padded={false}
          fixedWidth={false}
          className={cn(
            layoutsOperarCatalogSidebarClass,
            layoutsOperarCatalogSidebarOpenClass,
            "h-full border-r-0",
          )}
        >
          {children}
        </MenuSidebar>
      </div>
    </div>
  )
}

/** Rail categorías — library-nav · superficie oscura. */
export function LayoutsOperarCatalogRailProposal() {
  const [vistaCatalogo, setVistaCatalogo] = useState<DemoCatalogView>(DEMO_CATALOG_VIEW_DEFAULT)

  return (
    <nav className={layoutsOperarCatalogRailNavClass} aria-label="Filtros del catálogo">
      <div className={layoutsOperarCatalogRailSectionGroupClass}>
        <p className={layoutsOperarCatalogRailSectionLabelClass}>Categorías</p>
        <ul className={layoutsOperarCatalogRailListClass} role="list">
          <li className={layoutsOperarCatalogRailListItemClass}>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              aria-pressed={
                vistaCatalogo.modo === "categoria" && vistaCatalogo.categoria === "Todos"
              }
              onClick={() => setVistaCatalogo({ modo: "categoria", categoria: "Todos" })}
              className={cn(
                layoutsOperarCatalogRailItemClass,
                vistaCatalogo.modo === "categoria" &&
                  vistaCatalogo.categoria === "Todos" &&
                  layoutsOperarCatalogRailItemSelectedClass,
              )}
            >
              <span className={libraryNavItemLabelClass}>Todos</span>
            </button>
          </li>
          {LAYOUTS_OPERAR_DEMO_CATALOG_CATEGORIES.map((name) => {
            const seleccionado =
              vistaCatalogo.modo === "categoria" && vistaCatalogo.categoria === name
            return (
              <li key={name} className={layoutsOperarCatalogRailListItemClass}>
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  aria-pressed={seleccionado}
                  onClick={() => setVistaCatalogo({ modo: "categoria", categoria: name })}
                  className={cn(
                    layoutsOperarCatalogRailItemClass,
                    seleccionado && layoutsOperarCatalogRailItemSelectedClass,
                  )}
                >
                  <span className={libraryNavItemLabelClass}>{name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div
        className={cn(
          layoutsOperarCatalogRailSectionGroupClass,
          layoutsOperarCatalogRailSectionGroupDividerClass,
        )}
      >
        <p className={layoutsOperarCatalogRailSectionLabelClass}>Listados rápidos</p>
        <ul className={layoutsOperarCatalogRailListClass} role="list">
          <li className={layoutsOperarCatalogRailListItemClass}>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              aria-pressed={vistaCatalogo.modo === "promociones"}
              onClick={() => setVistaCatalogo({ modo: "promociones" })}
              className={cn(
                layoutsOperarCatalogRailItemClass,
                layoutsOperarCatalogRailItemWithIconClass,
                vistaCatalogo.modo === "promociones" &&
                  layoutsOperarCatalogRailItemSelectedClass,
              )}
            >
              <Tag className={libraryNavItemIconClass} aria-hidden />
              <span className={libraryNavItemLabelClass}>Promociones</span>
            </button>
          </li>
          <li className={layoutsOperarCatalogRailListItemClass}>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              aria-pressed={vistaCatalogo.modo === "con_descuento"}
              onClick={() => setVistaCatalogo({ modo: "con_descuento" })}
              className={cn(
                layoutsOperarCatalogRailItemClass,
                layoutsOperarCatalogRailItemWithIconClass,
                vistaCatalogo.modo === "con_descuento" &&
                  layoutsOperarCatalogRailItemSelectedClass,
              )}
            >
              <Percent className={libraryNavItemIconClass} aria-hidden />
              <span className={libraryNavItemLabelClass}>Con descuento</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}
