"use client"

import {
  layoutsOperarCatalogRailItemClass,
  layoutsOperarCatalogRailListClass,
  layoutsOperarCatalogRailListItemClass,
  layoutsOperarCatalogRailNavClass,
  layoutsOperarCatalogSkeletonGhostClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"

const CATEGORY_ITEM_WIDTHS = ["w-[42%]", "w-[68%]", "w-[54%]", "w-[61%]", "w-[48%]", "w-[72%]", "w-[56%]"]

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
      <ul className={layoutsOperarCatalogRailListClass} role="list">
        {CATEGORY_ITEM_WIDTHS.map((width, index) => (
          <SaleCatalogRailItemSkeleton key={`category-${index}`} width={width} />
        ))}
      </ul>
      <span className="sr-only">Cargando categorías…</span>
    </nav>
  )
}
