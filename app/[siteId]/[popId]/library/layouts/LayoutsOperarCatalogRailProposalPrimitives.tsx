"use client"

import "@/app/[siteId]/[popId]/library/layouts/layoutsOperarTheme.css"
import "@/app/[siteId]/[popId]/library/radius/rootsyRadiusSystem.css"
import { getLayoutsOperarGridCssVariables } from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarHardcodedSpec"
import {
  layoutsOperarBodyScopeClass,
  layoutsOperarCatalogRailItemClass,
  layoutsOperarCatalogRailItemDiscountSelectedClass,
  layoutsOperarCatalogRailItemPromoSelectedClass,
  layoutsOperarCatalogRailItemSelectedClass,
  layoutsOperarCatalogRailItemWithIconClass,
  layoutsOperarCatalogRailListClass,
  layoutsOperarCatalogRailListItemClass,
  layoutsOperarCatalogRailNavClass,
  layoutsOperarCatalogRailSectionLabelClass,
  layoutsOperarCatalogSidebarClass,
  layoutsOperarCatalogSidebarOpenClass,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarStyles"
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
        "overflow-hidden rounded-2xl border border-border/70",
        heightClass,
        className,
      )}
    >
      <div
        className={cn(
          "rootsy-theme-pos rootsy-radius-system h-full bg-[var(--rootsy-sombra-950)]",
          layoutsOperarBodyScopeClass,
        )}
        style={getLayoutsOperarGridCssVariables()}
      >
        <aside
          className={cn(
            layoutsOperarCatalogSidebarClass,
            layoutsOperarCatalogSidebarOpenClass,
            "h-full border-r-0",
          )}
        >
          {children}
        </aside>
      </div>
    </div>
  )
}

/** Rail categorías — lista clara canónica. */
export function LayoutsOperarCatalogRailProposal() {
  const [vistaCatalogo, setVistaCatalogo] = useState<DemoCatalogView>(DEMO_CATALOG_VIEW_DEFAULT)

  return (
    <nav className={layoutsOperarCatalogRailNavClass} aria-label="Filtros del catálogo">
      <div>
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
              Todos
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
                  {name}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div>
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
                  layoutsOperarCatalogRailItemPromoSelectedClass,
              )}
            >
              <Tag className="size-4 shrink-0 opacity-80" aria-hidden />
              Promociones
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
                  layoutsOperarCatalogRailItemDiscountSelectedClass,
              )}
            >
              <Percent className="size-4 shrink-0 opacity-80" aria-hidden />
              Con descuento
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}
