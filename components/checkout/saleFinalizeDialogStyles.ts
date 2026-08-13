import { getLayoutsOperarPosTotalsGradient } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import {
  rootsDialogContentZClass,
  rootsDialogOverlayZClass,
} from "@/components/rootsy-dialog/rootsDialogProductStyles"
import { cn } from "@/lib/utils"

/** Shell — shadow.overlay · radius.xxlarge · sin borde ni fondo blanco (evita halo en esquinas). */
export const saleFinalizeDialogShellClass = cn(
  rootsDialogContentZClass,
  "flex flex-col gap-0 overflow-hidden p-0",
  "border-0 bg-transparent ring-0 outline-none",
  "rounded-[1.375rem]",
  "[--elevation-shadow-overlay:0_28px_84px_-14px_rgb(5_8_7/0.38)]",
  "shadow-[var(--elevation-shadow-overlay)]",
  "fixed top-1/2 left-1/2 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 sm:max-w-[22.5rem]",
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200",
)

/**
 * Scrim POS — sombra-950 sin backdrop-blur (modalsUiOverlaySpec).
 * Más denso que el 40% workspace: catálogo operar tiene alto contraste.
 * Viñeta radial concentra foco en el terminal de cobro.
 */
export const saleFinalizeDialogOverlayClass = cn(
  rootsDialogOverlayZClass,
  "bg-[radial-gradient(ellipse_92%_88%_at_50%_44%,color-mix(in_srgb,var(--rootsy-sombra-950)_46%,transparent),color-mix(in_srgb,var(--rootsy-sombra-950)_74%,transparent))]",
)

export const saleFinalizeDialogTotalsGradientStyle = {
  background: getLayoutsOperarPosTotalsGradient(),
} as const

export const saleFinalizeDialogTotalsZoneClass = cn(
  "relative overflow-hidden rounded-t-[1.375rem]",
  "px-[var(--rootsy-space-400)] pt-[var(--rootsy-space-400)] pb-[var(--rootsy-space-300)]",
)

export const saleFinalizeDialogTotalsGlowClass =
  "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-15%,color-mix(in_srgb,var(--rootsy-savia-400)_34%,transparent),transparent_58%)]"

export const saleFinalizeDialogHeaderRowClass =
  "mb-[var(--rootsy-space-200)] flex min-h-8 items-center justify-between gap-3"

export const saleFinalizeDialogTitleClass = cn(
  "min-w-0 flex-1 font-canopy text-[length:var(--rootsy-text-heading-small-size)] leading-[var(--rootsy-text-heading-small-lh)]",
  "font-bold tracking-[-0.01em] text-[var(--rootsy-savia-50)]",
)

export const saleFinalizeDialogCloseClass = cn(
  "inline-flex size-8 shrink-0 items-center justify-center rounded-full",
  "text-[color-mix(in_srgb,var(--rootsy-savia-50)_72%,transparent)] transition-colors",
  "hover:text-[var(--rootsy-savia-50)] hover:bg-[color-mix(in_srgb,var(--rootsy-savia-50)_10%,transparent)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
)

export const saleFinalizeDialogAmountClass =
  "font-numeric text-[2.375rem] font-bold tabular-nums tracking-tight text-[var(--rootsy-savia-50)]"

export const saleFinalizeDialogAmountLabelClass =
  "mt-1 font-canopy text-[10px] font-semibold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--rootsy-savia-100)_78%,white)]"

export const saleFinalizeDialogBreakdownClass =
  "mb-4 space-y-1 border-b border-[color-mix(in_srgb,var(--rootsy-savia-50)_14%,transparent)] pb-3"

export const saleFinalizeDialogBreakdownRowClass =
  "flex items-center justify-between gap-3 font-canopy text-[11px] leading-snug"

export const saleFinalizeDialogBreakdownLabelClass =
  "font-medium uppercase tracking-[0.1em] text-[color-mix(in_srgb,var(--rootsy-savia-50)_48%,transparent)]"

export const saleFinalizeDialogBreakdownAmountClass =
  "font-numeric font-medium tabular-nums text-[color-mix(in_srgb,var(--rootsy-savia-50)_82%,transparent)]"

export const saleFinalizeDialogBreakdownDiscountClass =
  "font-numeric font-medium tabular-nums text-[color-mix(in_srgb,var(--rootsy-savia-200)_88%,white)]"

export const saleFinalizeDialogFactsZoneClass =
  "bg-[var(--rootsy-bruma-50)] px-[var(--rootsy-space-400)] py-[var(--rootsy-space-150)]"

/** Bloque de opciones dentro de la zona bruma — separador suave, sin caja extra. */
export const saleFinalizeDialogOptionsBlockClass = cn(
  "mt-[var(--rootsy-space-150)] space-y-2",
  "border-t border-[color-mix(in_srgb,var(--rootsy-bruma-300)_38%,transparent)]",
  "pt-[var(--rootsy-space-200)]",
)

export const saleFinalizeDialogShellWideClass =
  "sm:max-w-[min(92vw,56rem)]"

/** Cuerpo en dos columnas cuando hay cobro parcial (md+). */
export const saleFinalizeDialogSplitBodyClass = cn(
  "min-h-0 md:grid md:grid-cols-2 md:items-stretch",
  "md:max-h-[min(52vh,26rem)]",
)

export const saleFinalizeDialogSplitMainColumnClass = "min-w-0"

/** Columna derecha — ítems a cobrar en cobro parcial. */
export const saleFinalizeDialogPartialColumnClass = cn(
  "hidden min-h-0 flex-col overflow-hidden md:flex",
  "border-t border-[color-mix(in_srgb,var(--rootsy-bruma-300)_38%,transparent)] md:border-t-0",
  "md:border-l md:border-[color-mix(in_srgb,var(--rootsy-bruma-300)_38%,transparent)]",
  "bg-[var(--rootsy-bruma-100)] px-[var(--rootsy-space-400)] py-[var(--rootsy-space-200)]",
)

export const saleFinalizeDialogPartialListClass =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain md:max-h-none"

export const saleFinalizeDialogPartialListMobileClass =
  "max-h-[min(40vh,18rem)] overflow-y-auto overscroll-contain md:hidden"

export const saleFinalizeDialogFactRowClass =
  "flex min-h-11 items-center justify-between gap-4 py-[var(--rootsy-space-100)]"

export const saleFinalizeDialogFactLabelClass =
  "shrink-0 font-canopy text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--rootsy-bruma-500)]"

export const saleFinalizeDialogFactValueClass =
  "min-w-0 truncate text-right font-canopy text-sm font-semibold text-[var(--rootsy-bruma-900)]"

export const saleFinalizeDialogFactValueMutedClass =
  "min-w-0 truncate text-right font-canopy text-sm font-medium text-[var(--rootsy-bruma-400)]"

export const saleFinalizeDialogErrorClass =
  "mx-[var(--rootsy-space-400)] mb-[var(--rootsy-space-150)] rounded-lg border border-[#dc2626]/30 bg-[#dc2626]/5 px-3 py-2.5 font-canopy text-sm text-[#dc2626]"

/** Misma gramática que la barra Descartar | Vender del ticket operar §1.2.3. */
export const saleFinalizeDialogActionsClass = cn(
  "grid min-h-[3.25rem] grid-cols-2 overflow-hidden rounded-b-[1.375rem]",
  "border-t border-[var(--rootsy-bruma-200)]",
)

export const saleFinalizeDialogCancelActionClass = cn(
  "flex items-center justify-center border-r border-[var(--rootsy-bruma-200)] bg-white",
  "font-canopy text-sm font-semibold text-[var(--rootsy-bruma-600)] transition-colors",
  "hover:bg-[var(--rootsy-bruma-50)] hover:text-[var(--rootsy-bruma-900)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_35%,transparent)]",
  "disabled:pointer-events-none disabled:opacity-45",
)

export const saleFinalizeDialogConfirmActionClass = cn(
  "flex items-center justify-center gap-2 bg-[var(--rootsy-savia-600)]",
  "font-canopy text-sm font-semibold text-white transition-colors",
  "hover:bg-[var(--rootsy-savia-700)] active:bg-[var(--rootsy-savia-800)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_55%,transparent)]",
  "disabled:pointer-events-none disabled:bg-[var(--rootsy-bruma-300)] disabled:text-[var(--rootsy-bruma-50)]",
)

export const saleFinalizeDialogActionShortcutClass = cn(
  "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded px-1",
  "font-sans text-[10px] font-semibold leading-none",
)

export const saleFinalizeDialogCancelShortcutClass = cn(
  saleFinalizeDialogActionShortcutClass,
  "bg-[var(--rootsy-bruma-100)] text-[var(--rootsy-bruma-500)]",
)

export const saleFinalizeDialogConfirmShortcutClass = cn(
  saleFinalizeDialogActionShortcutClass,
  "bg-[color-mix(in_srgb,var(--rootsy-white)_16%,transparent)] text-[color-mix(in_srgb,var(--rootsy-white)_90%,transparent)]",
)
