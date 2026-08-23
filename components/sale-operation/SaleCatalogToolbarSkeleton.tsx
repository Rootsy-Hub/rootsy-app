"use client"

import {
  layoutsOperarCatalogSkeletonGhostClass,
  layoutsOperarCatalogToolbarClass,
  layoutsOperarCatalogToolbarIconMutedClass,
  layoutsOperarCatalogToolbarPriceListClass,
  layoutsOperarCatalogToolbarQtyButtonClass,
  layoutsOperarCatalogToolbarQtyShellClass,
  layoutsOperarCatalogToolbarQtyValueClass,
  layoutsOperarCatalogToolbarScanInputClass,
  layoutsOperarCatalogToolbarViewToggleButtonClass,
  layoutsOperarCatalogToolbarViewToggleShellClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import {
  Barcode,
  DollarSign,
  LayoutGrid,
  Minus,
  Plus,
  Rows3,
  Search,
} from "lucide-react"

const ghost = layoutsOperarCatalogSkeletonGhostClass

export function SaleCatalogToolbarSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(layoutsOperarCatalogToolbarClass, className)}
      role="status"
      aria-busy="true"
      aria-label="Cargando buscador del catálogo"
    >
      <div
        className={cn(layoutsOperarCatalogToolbarViewToggleShellClass, "max-md:hidden")}
      >
        <div className={layoutsOperarCatalogToolbarViewToggleButtonClass}>
          <LayoutGrid
            className={cn("size-4.5", layoutsOperarCatalogToolbarIconMutedClass)}
          />
        </div>
        <div className={layoutsOperarCatalogToolbarViewToggleButtonClass}>
          <Rows3
            className={cn("size-4.5", layoutsOperarCatalogToolbarIconMutedClass)}
          />
        </div>
      </div>

      <div className="relative min-w-0 flex-1">
        <Barcode
          className={cn(
            "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 max-md:hidden",
            layoutsOperarCatalogToolbarIconMutedClass,
          )}
          aria-hidden
        />
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 md:hidden",
            layoutsOperarCatalogToolbarIconMutedClass,
          )}
          aria-hidden
        />
        <div
          className={cn(
            layoutsOperarCatalogToolbarScanInputClass,
            "pointer-events-none flex items-center",
          )}
        >
          <span className={cn("block h-3 w-[38%] rounded-sm", ghost)} />
        </div>
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 max-md:hidden",
            layoutsOperarCatalogToolbarIconMutedClass,
          )}
          aria-hidden
        />
      </div>

      <div className={layoutsOperarCatalogToolbarQtyShellClass}>
        <div className={layoutsOperarCatalogToolbarQtyButtonClass}>
          <Minus className="size-3.5" aria-hidden />
        </div>
        <span className={cn(layoutsOperarCatalogToolbarQtyValueClass, "min-w-8")}>
          <span className={cn("mx-auto block h-3 w-4 rounded-sm", ghost)} />
        </span>
        <div className={layoutsOperarCatalogToolbarQtyButtonClass}>
          <Plus className="size-3.5" aria-hidden />
        </div>
      </div>

      <div className="hidden shrink-0 items-center gap-1 md:flex">
        <div
          className={cn(
            layoutsOperarCatalogToolbarPriceListClass,
            "pointer-events-none",
          )}
        >
          <DollarSign
            className={cn("size-4 shrink-0", layoutsOperarCatalogToolbarIconMutedClass)}
            aria-hidden
          />
          <span className={cn("h-3 w-16 rounded-sm", ghost)} />
        </div>
      </div>
      <span className="sr-only">Cargando buscador…</span>
    </div>
  )
}
