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
  "flex min-h-0 max-h-[min(90vh,46rem)] flex-col overflow-hidden rounded-[1.375rem]",
)

/** Noche del universo — el cielo del header continúa afuera. */
export const saleFinalizeDialogOverlayClass = cn(
  rootsDialogOverlayZClass,
  "sale-finalize-dialog-overlay bg-transparent",
)

export const saleFinalizeDialogTotalsZoneClass = cn(
  "shrink-0 rounded-t-[1.375rem] overflow-hidden",
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

export const saleFinalizeDialogFactsZoneClass = cn(
  "min-h-0 flex-1 bg-[var(--rootsy-bruma-50)] px-[var(--rootsy-space-400)] py-[var(--rootsy-space-400)] text-[var(--rootsy-bruma-900)]",
)

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
  "min-w-0 font-canopy text-sm font-normal text-[var(--rootsy-bruma-900)]"

export const saleFinalizeDialogShellWideClass =
  "sm:max-w-[min(92vw,56rem)]"

/** Cuerpo entre cielo y footer — scrollea cuando el modal se achica. */
export const saleFinalizeDialogBodyClass = cn(
  "flex min-h-0 flex-1 flex-col overflow-hidden",
)

/** Cuerpo en dos columnas cuando hay cobro parcial (md+). */
export const saleFinalizeDialogSplitBodyClass = cn(
  "md:grid md:grid-cols-2 md:grid-rows-1 md:[grid-template-rows:minmax(0,1fr)]",
)

/** Mismo scroll visible en las dos columnas. */
export const saleFinalizeDialogColumnScrollClass = cn(
  "game-scroll min-h-0 min-w-0 overflow-y-auto overscroll-contain",
  "[scrollbar-gutter:stable]",
)

export const saleFinalizeDialogSplitMainColumnClass =
  saleFinalizeDialogColumnScrollClass

/** Columna derecha — un solo scroll, del título al último ítem. */
export const saleFinalizeDialogPartialColumnClass = cn(
  saleFinalizeDialogColumnScrollClass,
  "hidden h-full flex-col md:flex",
  "border-t border-[color-mix(in_srgb,var(--rootsy-bruma-200)_70%,transparent)] md:border-t-0",
  "md:border-l md:border-[color-mix(in_srgb,var(--rootsy-bruma-200)_70%,transparent)]",
  "bg-[var(--rootsy-bruma-50)] px-[var(--rootsy-space-400)] py-[var(--rootsy-space-400)]",
)

export const saleFinalizeDialogPartialListMobileClass = cn(
  "game-scroll max-h-[min(40vh,18rem)] overflow-y-auto overscroll-contain md:hidden",
)

export const saleFinalizeDialogPartialUnitsClass =
  "divide-y divide-[color-mix(in_srgb,var(--rootsy-bruma-200)_70%,transparent)]"

export const saleFinalizeDialogPartialRowClass = cn(
  "flex min-h-10 cursor-pointer items-center gap-3 py-2.5 first:pt-0 last:pb-0",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_35%,transparent)]",
)

export const saleFinalizeDialogPartialCheckClass = (selected: boolean) =>
  cn(
    "flex size-4 shrink-0 items-center justify-center rounded-[4px] border text-[9px] leading-none",
    selected
      ? "border-[var(--rootsy-savia-600)] bg-[var(--rootsy-savia-600)] text-white"
      : "border-[var(--rootsy-bruma-300)] bg-white text-transparent",
  )

export const saleFinalizeDialogPartialNameClass = (selected: boolean) =>
  cn(
    "min-w-0 flex-1 truncate font-canopy text-sm",
    selected
      ? "font-medium text-[var(--rootsy-bruma-900)]"
      : "font-normal text-[var(--rootsy-bruma-700)]",
  )

export const saleFinalizeDialogPartialAmountClass = (selected: boolean) =>
  cn(
    "shrink-0 text-right font-numeric text-sm tabular-nums tracking-tight",
    selected
      ? "text-[var(--rootsy-bruma-900)]"
      : "text-[var(--rootsy-bruma-500)]",
  )

export const saleFinalizeDialogPartialStepperClass =
  "flex shrink-0 items-center gap-0.5"

export const saleFinalizeDialogPartialStepperButtonClass = cn(
  "inline-flex size-6 items-center justify-center rounded text-[var(--rootsy-bruma-600)]",
  "hover:bg-[var(--rootsy-bruma-100)] hover:text-[var(--rootsy-bruma-900)]",
  "disabled:pointer-events-none disabled:opacity-35",
)

export const saleFinalizeDialogFactRowClass =
  "flex items-baseline justify-between gap-6 py-3 first:pt-0 last:pb-0"

export const saleFinalizeDialogFactLabelClass =
  "shrink-0 font-canopy text-[11px] font-medium text-[var(--rootsy-bruma-500)]"

export const saleFinalizeDialogFactValueClass =
  "min-w-0 truncate text-right font-canopy text-sm font-medium text-[var(--rootsy-bruma-900)]"

export const saleFinalizeDialogFactValueMutedClass =
  "min-w-0 truncate text-right font-canopy text-sm font-normal text-[var(--rootsy-bruma-400)]"

/** Misma gramática que la barra Descartar | Vender del ticket operar §1.2.3. */
export const saleFinalizeDialogActionsClass = cn(
  "grid min-h-[3.25rem] shrink-0 grid-cols-2 overflow-hidden rounded-b-[1.375rem]",
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
  "disabled:pointer-events-none disabled:opacity-50",
)

export const saleFinalizeDialogConfirmPayActionClass = cn(
  "flex items-center justify-center gap-2 bg-[#D97706]",
  "font-canopy text-sm font-semibold text-white transition-colors",
  "hover:bg-[#F59E0B] active:bg-[#B45309]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F59E0B]/45",
  "disabled:pointer-events-none disabled:opacity-50",
)

/** Cobrando / pagando — sigue el color, no se apaga a gris. */
export const saleFinalizeDialogConfirmBusyClass =
  "pointer-events-none opacity-[0.92]"

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
