"use client"

import {
  SALE_CATALOG_DEFAULT_PRICE_LISTS,
  type SaleCatalogPriceListOption,
} from "@/components/sale-operation/saleCatalogPriceLists"
import {
  clampSaleCatalogEntryQty,
  SaleCatalogEntryQuantityDialog,
} from "@/components/sale-operation/SaleCatalogEntryQuantityDialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  Barcode,
  LayoutGrid,
  Minus,
  Plus,
  Rows3,
  Search,
  Tags,
} from "lucide-react"
import { useId, type RefObject } from "react"

function IconoLimpiarBusqueda({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-[14px] shrink-0", className)}
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
  scanInputRef?: RefObject<HTMLInputElement | null>
  cantidadIngreso: number
  onCantidadIngresoChange: (cantidad: number) => void
  priceListId: string
  onPriceListChange: (priceListId: string) => void
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
    return "border-b border-[var(--layouts-operar-border-dark-hairline)] px-4 [height:var(--layouts-operar-catalog-toolbar-h)]"
  }
  return "border-b border-white/10 px-4 py-3"
}

function viewToggleShellClass(variant: ToolbarVariant) {
  if (variant === "operar") {
    return "relative flex h-10 shrink-0 items-center rounded-lg border border-[color-mix(in_srgb,var(--rootsy-sombra-border)_45%,transparent)] bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_55%,transparent)] p-1"
  }
  return "relative flex h-10 shrink-0 items-center rounded-lg border border-white/12 bg-black/25 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(16,185,129,0.06)]"
}

function viewToggleActivePillClass(variant: ToolbarVariant) {
  if (variant === "operar") {
    return "pointer-events-none absolute inset-y-1 left-1 w-10 rounded-md border border-[color-mix(in_srgb,var(--rootsy-savia-400)_35%,transparent)] bg-[color-mix(in_srgb,var(--rootsy-savia-400)_15%,transparent)] transition-transform duration-300 ease-out"
  }
  return "pointer-events-none absolute inset-y-1 left-1 w-10 rounded-md border border-emerald-300/35 bg-linear-to-b from-emerald-300/22 via-emerald-400/16 to-emerald-500/12 shadow-[0_0_18px_rgba(16,185,129,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform duration-300 ease-out"
}

function scanInputClass(variant: ToolbarVariant, hasValue: boolean) {
  if (variant === "operar") {
    return cn(
      "h-10 border-[color-mix(in_srgb,var(--rootsy-sombra-border)_45%,transparent)] bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_45%,transparent)] pl-10 pr-10 text-sm text-[#f4f8f6] placeholder:text-[color-mix(in_srgb,var(--rootsy-sombra-300)_55%,transparent)]",
      hasValue && "pr-16",
    )
  }
  return cn(
    "h-10 border-white/10 bg-black/20 pl-10 pr-10 text-white placeholder:text-white/35",
    hasValue && "pr-16",
  )
}

function qtyStepperShellClass(variant: ToolbarVariant) {
  if (variant === "operar") {
    return "flex h-10 shrink-0 items-center gap-0.5 rounded-lg border border-[color-mix(in_srgb,var(--rootsy-sombra-border)_45%,transparent)] bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_45%,transparent)] px-1"
  }
  return "flex h-10 shrink-0 items-center gap-0.5 rounded-lg border border-white/10 bg-black/20 px-1"
}

function qtyButtonClass(variant: ToolbarVariant) {
  if (variant === "operar") {
    return "inline-flex size-8 items-center justify-center rounded-md text-[color-mix(in_srgb,var(--rootsy-bruma-100)_88%,white)] transition-colors hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_48%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]"
  }
  return "inline-flex size-8 items-center justify-center rounded-md text-white/75 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
}

function qtyValueClass(variant: ToolbarVariant) {
  if (variant === "operar") {
    return "min-w-8 px-1 text-center text-sm font-semibold tabular-nums text-[#f4f8f6]"
  }
  return "min-w-8 px-1 text-center text-sm font-semibold tabular-nums text-white"
}

function priceListIconClass(variant: ToolbarVariant) {
  if (variant === "operar") {
    return "size-4 shrink-0 text-[color-mix(in_srgb,var(--rootsy-savia-400)_82%,white)]"
  }
  return "size-4 shrink-0 text-emerald-300/85"
}

function priceListTriggerClass(variant: ToolbarVariant) {
  if (variant === "operar") {
    return "h-10 min-w-[9.5rem] gap-2 border-[color-mix(in_srgb,var(--rootsy-sombra-border)_45%,transparent)] bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_45%,transparent)] text-sm text-[#f4f8f6]"
  }
  return "h-10 min-w-[9.5rem] gap-2 border-white/10 bg-black/20 text-sm text-white"
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
    <div className={cn("flex min-w-0 shrink-0 items-center gap-3", variantShellClass(variant), className)}>
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
              ? "text-[color-mix(in_srgb,var(--rootsy-savia-400)_82%,white)]"
              : "text-emerald-300/85",
          )}
          aria-hidden
        />
        {demo ? (
          <div
            className={cn(
              "flex h-10 items-center rounded-md border pr-10 pl-10 text-sm",
              scanInputClass(variant, false),
            )}
          >
            Escanear producto o buscar…
          </div>
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
              ? "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_55%,transparent)]"
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
                ? "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_65%,transparent)] hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_48%,transparent)] hover:text-[#f4f8f6]"
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
              ? "hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_48%,transparent)]"
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

      <div className="shrink-0">
        <label id={priceListLabelId} className="sr-only">
          Lista de precio
        </label>
        {demo ? (
          <div
            className={cn(
              "flex h-10 min-w-[9.5rem] items-center gap-2 rounded-md border px-3 text-sm",
              priceListTriggerClass(variant),
            )}
            aria-labelledby={priceListLabelId}
          >
            <Tags className={priceListIconClass(variant)} aria-hidden />
            {priceLists.find((p) => p.id === priceListId)?.label ?? "Mostrador"}
          </div>
        ) : (
          <Select
            value={priceListId}
            onValueChange={onPriceListChange}
          >
            <SelectTrigger
              aria-labelledby={priceListLabelId}
              className={priceListTriggerClass(variant)}
            >
              <Tags className={priceListIconClass(variant)} aria-hidden />
              <SelectValue placeholder="Lista de precio" />
            </SelectTrigger>
            <SelectContent align="end">
              {priceLists.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  <span className="flex items-center gap-2">
                    <Tags className="size-4 shrink-0 opacity-70" aria-hidden />
                    {list.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
