import { layoutsOperarCatalogToolbarClass } from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"

/** Shell toolbar oscuro — salones, columnas Kanban, etc. */
export const operarCanvasToolbarShellClass = layoutsOperarCatalogToolbarClass

export const operarCanvasToolbarTabActiveClass =
  "text-[color-mix(in_srgb,var(--rootsy-bruma-50)_92%,white)]"

export const operarCanvasToolbarTabIdleClass = cn(
  "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_55%,transparent)]",
  "hover:text-[color-mix(in_srgb,var(--rootsy-sombra-300)_82%,transparent)]",
)

export const operarCanvasToolbarIndicatorClass =
  "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_88%,white)]"

export const operarCanvasToolbarIconClass =
  "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_55%,transparent)]"

/** Ícono en headers Kanban — siempre legible (no hay estado apagado). */
export const operarCanvasToolbarColumnIconClass =
  "text-[color-mix(in_srgb,var(--rootsy-bruma-100)_82%,white)]"

export const operarCanvasToolbarCountPillOpenClass = cn(
  "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_18%,transparent)]",
  "text-[color-mix(in_srgb,var(--rootsy-savia-300)_92%,white)]",
  "ring-1 ring-[color-mix(in_srgb,var(--rootsy-savia-400)_28%,transparent)]",
)

export const operarCanvasToolbarCountPillTotalActiveClass = cn(
  "bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_55%,transparent)]",
  "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_75%,transparent)]",
  "ring-1 ring-[color-mix(in_srgb,var(--rootsy-sombra-border)_45%,transparent)]",
)

export const operarCanvasToolbarCountPillTotalIdleClass = cn(
  "bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_40%,transparent)]",
  "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_50%,transparent)]",
  "ring-1 ring-[color-mix(in_srgb,var(--rootsy-sombra-border)_35%,transparent)]",
)

export const operarCanvasToolbarCountPillBaseClass =
  "inline-flex aspect-square size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums leading-none"

export const operarCanvasToolbarCountPillWideClass =
  "size-6 text-[9px]"

export const operarCanvasToolbarTabButtonClass = cn(
  "relative z-10 flex h-full min-w-0 flex-1 items-center justify-center px-4",
  "text-sm font-semibold leading-none transition-colors duration-200",
)

export const operarCanvasToolbarColumnHeaderClass = cn(
  operarCanvasToolbarShellClass,
  "relative min-w-0 flex-1 justify-start gap-1.5",
)
