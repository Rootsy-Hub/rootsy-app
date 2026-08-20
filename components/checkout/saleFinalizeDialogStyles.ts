import {
  rootsDialogContentZClass,
  rootsDialogOverlayZClass,
} from "@/components/rootsy-dialog/rootsDialogProductStyles"
import { cn } from "@/lib/utils"
import "@/components/checkout/saleFinalizeDialogOverlay.css"

/**
 * Cascarón — overflow visible para que el halo de luz no se recorte.
 * El mundo vive en el inner.
 */
export const saleFinalizeDialogShellClass = cn(
  rootsDialogContentZClass,
  "sale-finalize-dialog-halo",
  "flex flex-col gap-0 overflow-visible p-0",
  "border-0 bg-transparent ring-0 outline-none shadow-none",
  "rounded-[1.375rem]",
  "fixed top-1/2 left-1/2 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 sm:max-w-[22.5rem]",
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200",
)

export const saleFinalizeDialogShellInnerClass = cn(
  "flex min-h-0 flex-col overflow-hidden rounded-[1.375rem]",
)

/** Noche del universo — el cielo del header continúa afuera. */
export const saleFinalizeDialogOverlayClass = cn(
  rootsDialogOverlayZClass,
  "sale-finalize-dialog-overlay bg-transparent",
)

export const saleFinalizeDialogTotalsZoneClass = cn(
  "rounded-t-[1.375rem] overflow-hidden",
)

export const saleFinalizeDialogHeaderRowClass =
  "flex min-h-8 items-center justify-between gap-3"

export const saleFinalizeDialogTitleClass = cn(
  "min-w-0 flex-1 font-canopy text-sm leading-snug",
)

export const saleFinalizeDialogSkyInnerClass = cn(
  "relative z-[1] px-[var(--rootsy-space-400)] pt-[var(--rootsy-space-300)] pb-[var(--rootsy-space-400)]",
)

export const saleFinalizeDialogAmountClass = cn(
  "font-numeric text-[2rem] font-semibold tabular-nums tracking-tight leading-none",
)

export const saleFinalizeDialogAmountLabelClass = cn(
  "mt-2 font-canopy text-[10px] font-semibold uppercase tracking-[0.2em]",
)

export const saleFinalizeDialogDiscountWhisperClass = cn(
  "mt-2 font-canopy text-[11px] tabular-nums",
)

export const saleFinalizeDialogFactsZoneClass =
  "bg-[var(--rootsy-bruma-50)] px-[var(--rootsy-space-400)] py-[var(--rootsy-space-400)]"

export const saleFinalizeDialogFactsListClass =
  "divide-y divide-[color-mix(in_srgb,var(--rootsy-bruma-200)_70%,transparent)]"

/** Bloque de opciones — mismas filas que los hechos, sin cards. */
export const saleFinalizeDialogOptionsBlockClass = cn(
  "mt-[var(--rootsy-space-300)]",
  "border-t border-[color-mix(in_srgb,var(--rootsy-bruma-200)_70%,transparent)]",
  "pt-1",
)

export const saleFinalizeDialogOptionRowClass = cn(
  "flex min-h-11 cursor-pointer items-center justify-between gap-6",
  "py-2.5 first:pt-3 last:pb-0",
  "disabled:cursor-not-allowed",
)

export const saleFinalizeDialogOptionLabelClass =
  "min-w-0 font-canopy text-sm font-normal text-[var(--rootsy-bruma-800)]"

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
  "flex items-baseline justify-between gap-6 py-3 first:pt-0 last:pb-0"

export const saleFinalizeDialogFactLabelClass =
  "shrink-0 font-canopy text-[11px] font-medium text-[var(--rootsy-bruma-500)]"

export const saleFinalizeDialogFactValueClass =
  "min-w-0 truncate text-right font-canopy text-sm font-medium text-[var(--rootsy-bruma-900)]"

export const saleFinalizeDialogFactValueMutedClass =
  "min-w-0 truncate text-right font-canopy text-sm font-normal text-[var(--rootsy-bruma-400)]"

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

export const saleFinalizeDialogConfirmPayActionClass = cn(
  "flex items-center justify-center gap-2 bg-[#D97706]",
  "font-canopy text-sm font-semibold text-white transition-colors",
  "hover:bg-[#F59E0B] active:bg-[#B45309]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F59E0B]/45",
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
