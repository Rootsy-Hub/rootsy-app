"use client"

import type { PurchaseCatalogView } from "@/components/purchase-operation/purchaseCatalogTypes"
import {
  layoutsOperarCatalogRailItemClass,
  layoutsOperarCatalogRailItemSelectedClass,
  layoutsOperarCatalogRailListClass,
  layoutsOperarCatalogRailListItemClass,
  layoutsOperarCatalogRailNavClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"

type Props = {
  categories: readonly string[]
  vistaCatalogo: PurchaseCatalogView
  onVistaChange: (view: PurchaseCatalogView) => void
}

export function PurchaseCatalogSidebarNav({
  categories,
  vistaCatalogo,
  onVistaChange,
}: Props) {
  return (
    <nav className={layoutsOperarCatalogRailNavClass} aria-label="Filtros del catálogo">
      <ul className={layoutsOperarCatalogRailListClass} role="list">
        {categories.map((cat) => {
          const seleccionado = vistaCatalogo.categoria === cat
          return (
            <li key={cat} className={layoutsOperarCatalogRailListItemClass}>
              <button
                type="button"
                aria-pressed={seleccionado}
                onClick={() =>
                  onVistaChange({ modo: "categoria", categoria: cat })
                }
                className={cn(
                  layoutsOperarCatalogRailItemClass,
                  seleccionado && layoutsOperarCatalogRailItemSelectedClass,
                )}
              >
                {cat}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
