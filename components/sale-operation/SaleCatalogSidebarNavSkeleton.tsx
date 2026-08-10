"use client"

import {
  layoutsOperarCatalogRailItemClass,
  layoutsOperarCatalogRailListClass,
  layoutsOperarCatalogRailListItemClass,
  layoutsOperarCatalogRailNavClass,
  layoutsOperarCatalogRailSectionLabelClass,
  layoutsOperarCatalogSkeletonGhostClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"

const CATEGORY_ITEM_WIDTHS = ["w-[42%]", "w-[68%]", "w-[54%]", "w-[61%]", "w-[48%]", "w-[72%]", "w-[56%]"]
const QUICK_LIST_ITEM_WIDTHS = ["w-[64%]", "w-[58%]"]

const ghost = layoutsOperarCatalogSkeletonGhostClass

function SaleCatalogRailItemSkeleton({ width }: { width: string }) {
  return (
    <li className={layoutsOperarCatalogRailListItemClass}>
      <div
        aria-hidden
        className={cn(
          layoutsOperarCatalogRailItemClass,
          "pointer-events-none",
        )}
      >
        <span className={cn("block h-4 rounded-sm", ghost, width)} />
      </div>
    </li>
  )
}

export function SaleCatalogSidebarNavSkeleton() {
  return (
    <nav
      className={layoutsOperarCatalogRailNavClass}
      aria-busy="true"
      aria-label="Cargando filtros del catálogo"
    >
      <div>
        <p className={layoutsOperarCatalogRailSectionLabelClass}>Categorías</p>
        <ul className={layoutsOperarCatalogRailListClass} role="list">
          {CATEGORY_ITEM_WIDTHS.map((width, index) => (
            <SaleCatalogRailItemSkeleton key={`category-${index}`} width={width} />
          ))}
        </ul>
      </div>

      <div>
        <p className={layoutsOperarCatalogRailSectionLabelClass}>Listados rápidos</p>
        <ul className={layoutsOperarCatalogRailListClass} role="list">
          {QUICK_LIST_ITEM_WIDTHS.map((width, index) => (
            <SaleCatalogRailItemSkeleton key={`quick-${index}`} width={width} />
          ))}
        </ul>
      </div>

      <span className="sr-only">Cargando categorías…</span>
    </nav>
  )
}
