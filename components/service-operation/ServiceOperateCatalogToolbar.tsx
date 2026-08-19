"use client"

import {
  layoutsOperarCatalogToolbarClass,
  layoutsOperarCatalogToolbarIconMutedClass,
  layoutsOperarCatalogToolbarScanInputClass,
  layoutsOperarCatalogToolbarViewToggleButtonActiveClass,
  layoutsOperarCatalogToolbarViewToggleButtonClass,
  layoutsOperarCatalogToolbarViewToggleButtonIdleClass,
  layoutsOperarCatalogToolbarViewToggleShellClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import { LayoutGrid, Rows3, Search } from "lucide-react"

type Props = {
  modoVista: "grid" | "lista"
  onModoVistaChange: (modo: "grid" | "lista") => void
  busqueda: string
  onBusquedaChange: (value: string) => void
  className?: string
}

export function ServiceOperateCatalogToolbar({
  modoVista,
  onModoVistaChange,
  busqueda,
  onBusquedaChange,
  className,
}: Props) {
  return (
    <div className={cn(layoutsOperarCatalogToolbarClass, className)}>
      <div className={layoutsOperarCatalogToolbarViewToggleShellClass}>
        <button
          type="button"
          onClick={() => onModoVistaChange("grid")}
          className={cn(
            layoutsOperarCatalogToolbarViewToggleButtonClass,
            modoVista === "grid"
              ? layoutsOperarCatalogToolbarViewToggleButtonActiveClass
              : layoutsOperarCatalogToolbarViewToggleButtonIdleClass,
          )}
          aria-label="Vista en grilla"
          aria-pressed={modoVista === "grid"}
        >
          <LayoutGrid className="size-4.5" />
        </button>
        <button
          type="button"
          onClick={() => onModoVistaChange("lista")}
          className={cn(
            layoutsOperarCatalogToolbarViewToggleButtonClass,
            modoVista === "lista"
              ? layoutsOperarCatalogToolbarViewToggleButtonActiveClass
              : layoutsOperarCatalogToolbarViewToggleButtonIdleClass,
          )}
          aria-label="Vista en columna"
          aria-pressed={modoVista === "lista"}
        >
          <Rows3 className="size-4.5" />
        </button>
      </div>

      <div className="relative min-w-0 flex-1">
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2",
            layoutsOperarCatalogToolbarIconMutedClass,
          )}
          aria-hidden
        />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="Buscar servicio…"
          aria-label="Buscar servicio"
          className={cn(
            layoutsOperarCatalogToolbarScanInputClass,
            busqueda.length > 0 && "pr-16",
          )}
        />
        {busqueda.length > 0 ? (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            className={cn(
              "absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-full transition-colors",
              layoutsOperarCatalogToolbarIconMutedClass,
              "hover:bg-[color-mix(in_srgb,var(--rootsy-white)_6%,transparent)] hover:text-[var(--rootsy-bruma-50)]",
            )}
            onClick={() => onBusquedaChange("")}
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  )
}
