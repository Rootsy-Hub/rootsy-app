"use client"

import {
  SALE_CATALOG_DEFAULT_PRICE_LISTS,
  SALE_CATALOG_PRICE_LIST_HELP,
  type SaleCatalogPriceListOption,
} from "@/components/sale-operation/saleCatalogPriceLists"
import {
  clampSaleCatalogEntryQty,
  SaleCatalogEntryQuantityDialog,
} from "@/components/sale-operation/SaleCatalogEntryQuantityDialog"
import {
  layoutsOperarCatalogToolbarClass,
  layoutsOperarCatalogToolbarIconAccentClass,
  layoutsOperarCatalogToolbarIconMutedClass,
  layoutsOperarCatalogToolbarPriceListClass,
  layoutsOperarCatalogToolbarQtyButtonClass,
  layoutsOperarCatalogToolbarQtyShellClass,
  layoutsOperarCatalogToolbarQtyValueClass,
  layoutsOperarCatalogToolbarQtyValueHoverClass,
  layoutsOperarCatalogToolbarScanInputClass,
  layoutsOperarCatalogToolbarViewToggleActiveSurfaceClass,
  layoutsOperarCatalogToolbarViewToggleShellClass,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarStyles"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  Barcode,
  CircleHelp,
  DollarSign,
  LayoutGrid,
  Minus,
  Plus,
  Rows3,
  Search,
} from "lucide-react"
import { useId, type RefObject } from "react"

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

type ToolbarVariant = "pos-dark" | "operar"

type Props = {
  modoVista: "grid" | "lista"
  onModoVistaChange: (modo: "grid" | "lista") => void
  busqueda: string
  onBusquedaChange: (value: string) => void
  onBusquedaKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  scanInputRef?: RefObject<HTMLInputElement | null> | ((element: HTMLInputElement | null) => void)
  cantidadIngreso: number
  onCantidadIngresoChange: (cantidad: number) => void
  priceListId: string
  onPriceListChange: (priceListId: string) => void
  /** Tras cerrar el select de lista (p. ej. devolver foco al escaneo). */
  onPriceListSelectClosed?: () => void
  priceLists?: SaleCatalogPriceListOption[]
  variant?: ToolbarVariant
  demo?: boolean
  className?: string
}

function clampEntryQty(value: number) {
  return clampSaleCatalogEntryQty(value)
}

function variantShellClass(variant: ToolbarVariant) {
  if (variant === "operar") {
    return layoutsOperarCatalogToolbarClass
  }
  return "flex min-w-0 shrink-0 items-center gap-3 border-b border-white/10 px-4 py-3"
}

function viewToggleShellClass(variant: ToolbarVariant) {
  if (variant === "operar") {
    return layoutsOperarCatalogToolbarViewToggleShellClass
  }
  return "relative flex h-10 shrink-0 items-center rounded-lg border border-white/12 bg-black/25 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(16,185,129,0.06)]"
}

function viewToggleActivePillClass(variant: ToolbarVariant) {
  if (variant === "operar") {
    return cn(
      "pointer-events-none absolute inset-y-1 left-1 w-10 rounded-md border transition-transform duration-300 ease-out",
      layoutsOperarCatalogToolbarViewToggleActiveSurfaceClass,
    )
  }
  return "pointer-events-none absolute inset-y-1 left-1 w-10 rounded-md border border-emerald-300/35 bg-linear-to-b from-emerald-300/22 via-emerald-400/16 to-emerald-500/12 shadow-[0_0_18px_rgba(16,185,129,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform duration-300 ease-out"
}

function scanInputClass(variant: ToolbarVariant, hasValue: boolean) {
  if (variant === "operar") {
    return cn(layoutsOperarCatalogToolbarScanInputClass, hasValue && "pr-16")
  }
  return cn(
    "h-10 rounded-md border-white/10 bg-black/20 pl-10 pr-10 text-white placeholder:text-white/35",
    hasValue && "pr-16",
  )
}

function qtyStepperShellClass(variant: ToolbarVariant) {
  if (variant === "operar") {
    return layoutsOperarCatalogToolbarQtyShellClass
  }
  return "flex h-10 shrink-0 items-center gap-0.5 rounded-lg border border-white/10 bg-black/20 px-1"
}

function qtyButtonClass(variant: ToolbarVariant) {
  if (variant === "operar") {
    return layoutsOperarCatalogToolbarQtyButtonClass
  }
  return "inline-flex size-8 items-center justify-center rounded-md text-white/75 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
}

function qtyValueClass(variant: ToolbarVariant) {
  if (variant === "operar") {
    return layoutsOperarCatalogToolbarQtyValueClass
  }
  return "min-w-8 px-1 text-center text-sm font-semibold tabular-nums text-white"
}

function priceListIconClass(variant: ToolbarVariant) {
  if (variant === "operar") {
    return cn("size-4 shrink-0", layoutsOperarCatalogToolbarIconAccentClass)
  }
  return "size-4 shrink-0 text-emerald-300/85"
}

function priceListTriggerClass(variant: ToolbarVariant) {
  if (variant === "operar") {
    return layoutsOperarCatalogToolbarPriceListClass
  }
  return "h-10 min-w-[9.5rem] gap-2 rounded-md border-white/10 bg-black/20 text-sm text-white"
}

function priceListHelpButtonClass(variant: ToolbarVariant) {
  if (variant === "operar") {
    return cn(
      "inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors",
      layoutsOperarCatalogToolbarIconMutedClass,
      "hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_48%,transparent)] hover:text-[color-mix(in_srgb,var(--rootsy-bruma-100)_88%,white)]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
    )
  }
  return "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-white/45 transition-colors hover:bg-white/8 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
}

function PriceListHelpTooltip({ variant }: { variant: ToolbarVariant }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={priceListHelpButtonClass(variant)}
          aria-label="Información sobre lista de precios"
        >
          <CircleHelp className="size-3.5" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent
        variant="dark"
        side="top"
        align="end"
        sideOffset={6}
        className="max-w-[17rem] text-left leading-snug"
      >
        {SALE_CATALOG_PRICE_LIST_HELP}
      </TooltipContent>
    </Tooltip>
  )
}

export function SaleCatalogToolbar({
  modoVista,
  onModoVistaChange,
  busqueda,
  onBusquedaChange,
  onBusquedaKeyDown,
  scanInputRef,
  cantidadIngreso,
  onCantidadIngresoChange,
  priceListId,
  onPriceListChange,
  onPriceListSelectClosed,
  priceLists = SALE_CATALOG_DEFAULT_PRICE_LISTS,
  variant = "pos-dark",
  demo = false,
  className,
}: Props) {
  const qtyLabelId = useId()
  const priceListLabelId = useId()

  const setQty = (next: number) => {
    onCantidadIngresoChange(clampEntryQty(next))
  }

  return (
    <div className={cn(variantShellClass(variant), className)}>
      <div className={viewToggleShellClass(variant)}>
        <span
          aria-hidden
          className={viewToggleActivePillClass(variant)}
          style={{
            transform: modoVista === "lista" ? "translateX(2.5rem)" : "translateX(0)",
          }}
        />
        <button
          type="button"
          tabIndex={demo ? -1 : undefined}
          aria-hidden={demo ? true : undefined}
          onClick={() => onModoVistaChange("grid")}
          className={cn(
            "relative z-10 flex h-8 w-10 items-center justify-center rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2",
            variant === "operar"
              ? modoVista === "grid"
                ? "text-[#f4f8f6]"
                : "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_72%,transparent)]"
              : modoVista === "grid"
                ? "text-white drop-shadow-[0_0_10px_rgba(110,231,183,0.6)]"
                : "text-slate-300/80 hover:text-white/95",
          )}
          aria-label="Vista en grilla"
          aria-pressed={modoVista === "grid"}
        >
          <LayoutGrid className="size-4.5" />
        </button>
        <button
          type="button"
          tabIndex={demo ? -1 : undefined}
          aria-hidden={demo ? true : undefined}
          onClick={() => onModoVistaChange("lista")}
          className={cn(
            "relative z-10 flex h-8 w-10 items-center justify-center rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2",
            variant === "operar"
              ? modoVista === "lista"
                ? "text-[#f4f8f6]"
                : "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_72%,transparent)]"
              : modoVista === "lista"
                ? "text-white drop-shadow-[0_0_10px_rgba(110,231,183,0.6)]"
                : "text-slate-300/80 hover:text-white/95",
          )}
          aria-label="Vista en columna"
          aria-pressed={modoVista === "lista"}
        >
          <Rows3 className="size-4.5" />
        </button>
      </div>

      <div className="relative min-w-0 flex-1">
        <Barcode
          className={cn(
            "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2",
            variant === "operar"
              ? layoutsOperarCatalogToolbarIconAccentClass
              : "text-emerald-300/85",
          )}
          aria-hidden
        />
        {demo ? (
          <div
            className={cn(
              "flex items-center text-sm",
              scanInputClass(variant, false),
            )}
          >
            <span className="truncate text-[color-mix(in_srgb,var(--rootsy-sombra-300)_55%,transparent)]">
              Escanear producto o buscar…
            </span>
          </div>
        ) : variant === "operar" ? (
          <input
            ref={scanInputRef}
            type="text"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            onKeyDown={onBusquedaKeyDown}
            placeholder="Escanear producto o buscar…"
            aria-label="Escanear producto o buscar"
            className={scanInputClass(variant, busqueda.length > 0)}
          />
        ) : (
          <Input
            ref={scanInputRef}
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            onKeyDown={onBusquedaKeyDown}
            placeholder="Escanear producto o buscar…"
            aria-label="Escanear producto o buscar"
            className={scanInputClass(variant, busqueda.length > 0)}
          />
        )}
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 size-4 -translate-y-1/2",
            busqueda.length > 0 ? "right-9" : "right-3",
            variant === "operar"
              ? layoutsOperarCatalogToolbarIconMutedClass
              : "text-white/35",
          )}
          aria-hidden
        />
        {!demo && busqueda.length > 0 ? (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            className={cn(
              "absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2",
              variant === "operar"
                ? cn(
                    layoutsOperarCatalogToolbarIconMutedClass,
                    "hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_48%,transparent)] hover:text-[#f4f8f6]",
                  )
                : "text-white/50 hover:bg-white/[0.07] hover:text-white/90 focus-visible:ring-emerald-300/70",
            )}
            onClick={() => onBusquedaChange("")}
          >
            <IconoLimpiarBusqueda />
          </button>
        ) : null}
      </div>

      <div
        className={qtyStepperShellClass(variant)}
        role="group"
        aria-labelledby={qtyLabelId}
      >
        <span id={qtyLabelId} className="sr-only">
          Cantidad a ingresar
        </span>
        <button
          type="button"
          tabIndex={demo ? -1 : undefined}
          aria-hidden={demo ? true : undefined}
          aria-label="Disminuir cantidad a ingresar"
          className={qtyButtonClass(variant)}
          onClick={() => setQty(cantidadIngreso - 1)}
        >
          <Minus className="size-3.5" aria-hidden />
        </button>
        <SaleCatalogEntryQuantityDialog
          cantidadIngreso={cantidadIngreso}
          onCantidadIngresoChange={setQty}
          valueClassName={qtyValueClass(variant)}
          valueHoverClassName={
            variant === "operar"
              ? layoutsOperarCatalogToolbarQtyValueHoverClass
              : "hover:bg-white/8"
          }
        />
        <button
          type="button"
          tabIndex={demo ? -1 : undefined}
          aria-hidden={demo ? true : undefined}
          aria-label="Aumentar cantidad a ingresar"
          className={qtyButtonClass(variant)}
          onClick={() => setQty(cantidadIngreso + 1)}
        >
          <Plus className="size-3.5" aria-hidden />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <label id={priceListLabelId} className="sr-only">
          Lista de precio
        </label>
        {demo ? (
          <div
            className={cn("flex items-center", priceListTriggerClass(variant))}
            aria-labelledby={priceListLabelId}
          >
            <DollarSign className={priceListIconClass(variant)} aria-hidden />
            {priceLists.find((p) => p.id === priceListId)?.label ?? "Principal"}
          </div>
        ) : (
          <Select
            value={priceListId}
            onValueChange={onPriceListChange}
            onOpenChange={(open) => {
              if (!open) onPriceListSelectClosed?.()
            }}
          >
            <SelectTrigger
              aria-labelledby={priceListLabelId}
              className={cn(
                priceListTriggerClass(variant),
                variant === "operar" &&
                  "h-10 w-fit data-[size=default]:h-10 dark:bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_55%,transparent)] dark:hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_55%,transparent)]",
              )}
            >
              <DollarSign className={priceListIconClass(variant)} aria-hidden />
              <SelectValue placeholder="Principal" />
            </SelectTrigger>
            <SelectContent align="end">
              {priceLists.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  {list.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <PriceListHelpTooltip variant={variant} />
      </div>
    </div>
  )
}
