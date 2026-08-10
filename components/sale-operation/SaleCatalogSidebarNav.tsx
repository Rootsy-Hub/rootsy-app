"use client"

import type { SaleCatalogCategory } from "@/app/[siteId]/[popId]/sale/actions"
import type { MenuCatalogCategorySection } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type { SaleCatalogViewPersisted } from "@/lib/saleCatalogPreference"
import {
  layoutsOperarCatalogRailItemClass,
  layoutsOperarCatalogRailItemDiscountSelectedClass,
  layoutsOperarCatalogRailItemPromoSelectedClass,
  layoutsOperarCatalogRailItemSelectedClass,
  layoutsOperarCatalogRailItemWithIconClass,
  layoutsOperarCatalogRailListClass,
  layoutsOperarCatalogRailListItemClass,
  layoutsOperarCatalogRailNavClass,
  layoutsOperarCatalogRailSectionLabelClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import { Percent, Tag } from "lucide-react"

const CATEGORIA_TODOS = "Todos"

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
      <div>
        <p className={layoutsOperarCatalogRailSectionLabelClass}>Categorías</p>
        <ul className={layoutsOperarCatalogRailListClass} role="list">
          <li className={layoutsOperarCatalogRailListItemClass}>
            <button
              type="button"
              aria-pressed={
                vistaCatalogo.modo === "categoria" && vistaCatalogo.categoria === CATEGORIA_TODOS
              }
              onClick={() => onVistaChange({ modo: "categoria", categoria: CATEGORIA_TODOS })}
              className={cn(
                layoutsOperarCatalogRailItemClass,
                vistaCatalogo.modo === "categoria" &&
                  vistaCatalogo.categoria === CATEGORIA_TODOS &&
                  layoutsOperarCatalogRailItemSelectedClass,
              )}
            >
              {CATEGORIA_TODOS}
            </button>
          </li>
          {!categorySections?.length
            ? categories.map((cat) => {
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
                      {cat.name}
                    </button>
                  </li>
                )
              })
            : null}
        </ul>
        {categorySections?.map((section) => (
          <div key={section.id} className="mt-4">
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
                      {cat.name}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <div>
        <p className={layoutsOperarCatalogRailSectionLabelClass}>Listados rápidos</p>
        <ul className={layoutsOperarCatalogRailListClass} role="list">
          <li className={layoutsOperarCatalogRailListItemClass}>
            <button
              type="button"
              aria-pressed={vistaCatalogo.modo === "promociones"}
              onClick={() => onVistaChange({ modo: "promociones" })}
              className={cn(
                layoutsOperarCatalogRailItemClass,
                layoutsOperarCatalogRailItemWithIconClass,
                vistaCatalogo.modo === "promociones" && layoutsOperarCatalogRailItemPromoSelectedClass,
              )}
            >
              <Tag className="size-4 shrink-0 opacity-80" aria-hidden />
              Promociones
            </button>
          </li>
          <li className={layoutsOperarCatalogRailListItemClass}>
            <button
              type="button"
              aria-pressed={vistaCatalogo.modo === "con_descuento"}
              onClick={() => onVistaChange({ modo: "con_descuento" })}
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
