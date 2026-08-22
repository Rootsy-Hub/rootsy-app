"use client"

import { layoutsOperarCatalogToolbarClass } from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

type Props = {
  label: string
  open: boolean
  onToggle: () => void
}

/** Trigger de categoría — mismo umbral que el buscador. Solo mobile. */
export function SaleCatalogMobileCategoryBar({ label, open, onToggle }: Props) {
  return (
    <button
      type="button"
      className={cn(
        layoutsOperarCatalogToolbarClass,
        "w-full justify-between gap-3 md:hidden",
      )}
      aria-expanded={open}
      onClick={onToggle}
    >
      <span className="min-w-0 truncate text-sm font-semibold tracking-tight text-[color-mix(in_srgb,var(--rootsy-bruma-50)_92%,white)]">
        {label}
      </span>
      <ChevronDown
        className={cn(
          "size-5 shrink-0 opacity-70 transition-transform duration-200",
          open && "rotate-180",
        )}
        aria-hidden
      />
    </button>
  )
}
