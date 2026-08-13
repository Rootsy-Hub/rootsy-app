"use client"

import {
  layoutsOperarCatalogToolbarClass,
  layoutsOperarCatalogToolbarIconMutedClass,
  layoutsOperarCatalogToolbarScanInputClass,
  layoutsOperarCatalogToolbarViewToggleActiveSurfaceClass,
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
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-1 left-1 w-10 rounded-md border transition-transform duration-300 ease-out",
            layoutsOperarCatalogToolbarViewToggleActiveSurfaceClass,
          )}
          style={{
            transform: modoVista === "lista" ? "translateX(2.5rem)" : "translateX(0)",
          }}
        />
        <button
          type="button"
          onClick={() => onModoVistaChange("grid")}
          className={cn(
            "relative z-10 flex h-8 w-10 items-center justify-center rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2",
            modoVista === "grid"
              ? "text-[#f4f8f6]"
              : "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_72%,transparent)]",
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
            "relative z-10 flex h-8 w-10 items-center justify-center rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2",
            modoVista === "lista"
              ? "text-[#f4f8f6]"
              : "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_72%,transparent)]",
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
              "hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_48%,transparent)] hover:text-[#f4f8f6]",
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
