"use client"

import {
  layoutsOperarCatalogToolbarClass,
  layoutsOperarCatalogToolbarScanInputClass,
  layoutsOperarCatalogToolbarViewToggleActiveSurfaceClass,
  layoutsOperarCatalogToolbarViewToggleShellClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { LayoutGrid, Rows3, Search } from "lucide-react"

function IconoLimpiarBusqueda({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-3.5 shrink-0", className)}
      aria-hidden
    >
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  )
}

type Props = {
  modoVista: "grid" | "lista"
  onModoVistaChange: (modo: "grid" | "lista") => void
  busqueda: string
  onBusquedaChange: (value: string) => void
  resultCount: number
  className?: string
}

export function PurchaseCatalogToolbar({
  modoVista,
  onModoVistaChange,
  busqueda,
  onBusquedaChange,
  resultCount,
  className,
}: Props) {
  return (
    <div className={cn(layoutsOperarCatalogToolbarClass, className)}>
      <div className={layoutsOperarCatalogToolbarViewToggleShellClass}>
        <span
          aria-hidden
          className={layoutsOperarCatalogToolbarViewToggleActiveSurfaceClass}
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
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[color-mix(in_srgb,var(--rootsy-sombra-300)_72%,transparent)]"
          aria-hidden
        />
        <Input
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="Buscar artículo..."
          className={cn(
            layoutsOperarCatalogToolbarScanInputClass,
            busqueda.length > 0 && "pr-9",
          )}
        />
        {busqueda.length > 0 ? (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-[color-mix(in_srgb,var(--rootsy-sombra-300)_68%,transparent)] transition-colors hover:bg-white/[0.07] hover:text-[#f4f8f6]"
            onClick={() => onBusquedaChange("")}
          >
            <IconoLimpiarBusqueda />
          </button>
        ) : null}
      </div>

      <span className="shrink-0 text-sm font-medium text-[color-mix(in_srgb,var(--rootsy-sombra-300)_72%,transparent)]">
        {resultCount} artículos
      </span>
    </div>
  )
}
