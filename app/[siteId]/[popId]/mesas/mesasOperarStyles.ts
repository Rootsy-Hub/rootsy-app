import {
  layoutsOperarCatalogToolbarControlFocusClass,
  layoutsOperarCatalogToolbarIconMutedClass,
  layoutsOperarCatalogToolbarViewToggleButtonActiveClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  operarCanvasToolbarCountPillOpenClass,
  operarCanvasToolbarCountPillTotalActiveClass,
  operarCanvasToolbarCountPillTotalIdleClass,
  operarCanvasToolbarIndicatorClass,
  operarCanvasToolbarShellClass,
  operarCanvasToolbarTabActiveClass,
  operarCanvasToolbarTabIdleClass,
} from "@/components/sale-operation/operarCanvasToolbarStyles"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

/** Canvas exterior del plano — alineado con catálogo operar (sombra-800). */
export const MESAS_FLOOR_PLAN_CANVAS_BG = "var(--rootsy-sombra-800)"

/** Superficie interior del plano — un tono más claro para profundidad. */
export const MESAS_FLOOR_PLAN_SURFACE_BG = "var(--rootsy-sombra-700)"

/** @deprecated Usar MESAS_FLOOR_PLAN_SURFACE_BG — compat con MostradorBoard. */
export const MESAS_FLOOR_PLAN_BG = MESAS_FLOOR_PLAN_SURFACE_BG

export const mesasSalonTabsShellClass = operarCanvasToolbarShellClass

export const mesasSalonTabActiveClass = operarCanvasToolbarTabActiveClass

export const mesasSalonTabIdleClass = operarCanvasToolbarTabIdleClass

export const mesasSalonTabIndicatorClass = operarCanvasToolbarIndicatorClass

export const mesasSalonCountPillOpenClass = operarCanvasToolbarCountPillOpenClass

export const mesasSalonCountPillTotalActiveClass = operarCanvasToolbarCountPillTotalActiveClass

export const mesasSalonCountPillTotalIdleClass = operarCanvasToolbarCountPillTotalIdleClass

export const mesasFloorFloatingBtnClass = cn(
  "relative z-10 flex size-10 items-center justify-center rounded-full",
  "border border-transparent bg-[var(--rootsy-sombra-700)] shadow-none",
  layoutsOperarCatalogToolbarControlFocusClass,
)

export const mesasFloorFloatingBtnIdleClass =
  layoutsOperarCatalogToolbarIconMutedClass

export const mesasFloorFloatingBtnActiveClass =
  layoutsOperarCatalogToolbarViewToggleButtonActiveClass

export const mesasFloorEditRingClass =
  "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_55%,transparent)]"

export const mesasFloorEditRingDelayClass =
  "bg-[color-mix(in_srgb,var(--rootsy-savia-300)_40%,transparent)]"

export const mesasFloorEmptyTextClass =
  "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_65%,transparent)]"

export const mesasFloorEmptyHintClass =
  "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_45%,transparent)]"

export const mesasFloorEmptyStrongClass =
  "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_72%,transparent)]"

export const mesasFloorGridPatternStyle: CSSProperties = {
  backgroundImage: `linear-gradient(color-mix(in srgb, var(--rootsy-sombra-300) 8%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--rootsy-sombra-300) 8%, transparent) 1px, transparent 1px)`,
  backgroundSize: "24px 24px",
}

export const mesasRealtimeBannerClass = cn(
  "relative z-20 border-b px-4 py-2 text-sm",
  "border-[color-mix(in_srgb,var(--rootsy-savia-400)_28%,transparent)]",
  "bg-[color-mix(in_srgb,var(--rootsy-savia-950)_72%,var(--rootsy-sombra-900))]",
  "text-[color-mix(in_srgb,var(--rootsy-savia-200)_92%,white)]",
)

export const mesasLayoutErrorBannerClass = cn(
  "border-b px-4 py-2 text-sm",
  "border-[color-mix(in_srgb,var(--rootsy-savia-600)_35%,transparent)]",
  "bg-[color-mix(in_srgb,var(--rootsy-savia-950)_55%,transparent)]",
  "text-[color-mix(in_srgb,var(--rootsy-savia-200)_88%,white)]",
)

export const mesasTableLabelClass =
  "text-[color-mix(in_srgb,var(--rootsy-bruma-50)_92%,white)]"

export const mesasTableMetaClass =
  "text-[color-mix(in_srgb,var(--rootsy-savia-300)_72%,transparent)]"

export const mesasTableDurationClass =
  "text-[color-mix(in_srgb,var(--rootsy-bruma-50)_88%,white)]"
