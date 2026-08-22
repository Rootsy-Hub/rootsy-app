/**
 * Dialog / alert — un solo mundo (claro · horizonte · suelo).
 * @see app/.../library/ui-components/modalsUiHardcodedSpec.ts
 */

import "@/components/rootsy-dialog/rootsDialogDawn.css"
import { cn } from "@/lib/utils"

/** z-index elevación — blanket 500 · panel 510. */
export const rootsDialogOverlayZClass = "z-[500]"
export const rootsDialogContentZClass = "z-[510]"
/** Segunda capa — el velo cubre el modal de abajo. */
export const rootsDialogOverlayNestedZClass = "z-[520]"
export const rootsDialogContentNestedZClass = "z-[530]"

/** Scrim sombra-950 40% — velo suave, sin universo. */
export const rootsDialogOverlayClass = cn(
  rootsDialogOverlayZClass,
  "bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_40%,transparent)]",
)

export const rootsDialogOverlayNestedClass = cn(
  rootsDialogOverlayNestedZClass,
  "bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_40%,transparent)]",
)

/** panel-padding · space.400 */
export const rootsDialogPanelPaddingXClass = "px-[var(--rootsy-space-400)]"

/** Reset primitivo shadcn — flex shell sin grid/p-6/bg-background. */
export const rootsDialogPrimitiveResetClass = cn(
  "flex flex-col gap-0 border-0 bg-transparent p-0 shadow-none",
)

const rootsDialogElevationScopeClass = cn(
  "[--elevation-surface-sunken:var(--rootsy-bruma-50,#f4f6f9)]",
  "[--elevation-shadow-overlay:0_22px_70px_-18px_rgb(5_8_7/0.28)]",
)

const rootsDialogCloseButtonClass = cn(
  "[&_[data-slot=dialog-close]]:top-[var(--rootsy-space-400)]",
  "[&_[data-slot=dialog-close]]:right-[var(--rootsy-space-400)]",
  "[&_[data-slot=dialog-close]]:size-[var(--rootsy-space-400)]",
  "[&_[data-slot=dialog-close]]:rounded-full",
  "[&_[data-slot=dialog-close]]:text-[var(--rootsy-bruma-500)]",
  "[&_[data-slot=dialog-close]]:opacity-100",
  "[&_[data-slot=dialog-close]]:ring-0",
  "[&_[data-slot=dialog-close]]:ring-offset-0",
  "[&_[data-slot=dialog-close]]:focus:ring-0",
  "[&_[data-slot=dialog-close]]:focus:outline-none",
  "[&_[data-slot=dialog-close]]:data-[state=open]:bg-transparent",
  "[&_[data-slot=dialog-close]]:data-[state=open]:text-[var(--rootsy-bruma-500)]",
  "hover:[&_[data-slot=dialog-close]]:text-[var(--rootsy-bruma-700)]",
)

/** Shell modal — bloque vivo opaco · sin borde · shadow.overlay. */
export const rootsDialogPanelShellClass = cn(
  rootsDialogPrimitiveResetClass,
  rootsDialogElevationScopeClass,
  "roots-dialog-living-block overflow-hidden text-[var(--rootsy-bruma-900)]",
  "border-0 shadow-[var(--elevation-shadow-overlay)]",
  rootsDialogCloseButtonClass,
)

export const rootsDialogSurfaceDefaultClass = cn(
  rootsDialogPanelShellClass,
  "rounded-[1.375rem] max-h-[min(90vh,640px)] sm:max-w-md",
)

export const rootsDialogSurfaceWideClass = cn(
  rootsDialogPanelShellClass,
  "rounded-[1.375rem] max-h-[min(90vh,560px)] sm:max-w-lg",
)

export const rootsDialogSurfaceTwoColClass = cn(
  rootsDialogPanelShellClass,
  "rounded-[1.375rem] max-h-[min(90vh,860px)] sm:max-w-4xl",
)

export const rootsDialogHeaderClass = cn(
  "roots-dialog-horizon",
  "flex shrink-0 flex-col gap-[var(--rootsy-space-050)] border-b-0",
  rootsDialogPanelPaddingXClass,
  "pt-[var(--rootsy-space-400)] text-left sm:text-left",
)

/** Header con subtítulo visible — pb space.200 (spec modal). */
export const rootsDialogHeaderWithDescriptionClass =
  "pb-[var(--rootsy-space-200)]"

/** Header solo título — pb space.300; el título ya no pide una banda alta. */
export const rootsDialogHeaderCompactClass = "pb-[var(--rootsy-space-300)]"

/** font.heading.small · semibold · bruma-900 — nombra el lugar, no lo grita. */
export const rootsDialogTitleClass = cn(
  "font-canopy text-base leading-5 font-semibold tracking-[-0.02em] text-[var(--rootsy-bruma-900)]",
  "pr-[calc(var(--rootsy-space-400)+var(--rootsy-space-400)+var(--rootsy-space-100))]",
)

/** body.small · bruma-500 — orientación, no subtítulo de cartel. */
export const rootsDialogDescriptionClass = cn(
  "font-canopy text-xs leading-4 font-normal tracking-[0.01em] text-[var(--rootsy-bruma-500)]",
)

/** Valle — bruma viva entre dos claros. */
export const rootsDialogBodyClass = cn(
  "roots-dialog-clearing-body game-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain",
  rootsDialogPanelPaddingXClass,
  "py-[var(--rootsy-space-200)]",
)

/** Body compacto — mismo claro; min-h-0 para que scrollee si el panel llega al tope. */
export const rootsDialogBodyCompactClass = cn(
  "roots-dialog-clearing-body game-scroll min-h-0 overflow-y-auto overscroll-contain",
  rootsDialogPanelPaddingXClass,
  "py-[var(--rootsy-space-200)]",
)

/** Body twoCol — 2 columnas; cada una scrollea. Sin gutter extra. */
export const rootsDialogTwoColBodyClass = cn(
  "grid min-h-0 flex-1 overflow-hidden overflow-y-hidden p-0",
  "grid-cols-1 sm:grid-cols-[minmax(0,1fr)_15rem]",
)

/** Columna-bloque — el scroll vive acá, a la derecha. */
export const rootsDialogColumnScrollClass = cn(
  "game-scroll min-h-0 min-w-0 overflow-y-auto overscroll-contain",
)

/** Contenido interno — padding del panel; no pega al scroll ni al divisor. */
export const rootsDialogColumnScrollInnerClass = cn(
  "min-w-0 w-full",
  rootsDialogPanelPaddingXClass,
  "py-[var(--rootsy-space-200)]",
)

/** Divisor entre las dos columnas-bloque. */
export const rootsDialogTwoColAsideClass =
  "sm:border-l sm:border-[var(--rootsy-bruma-200)]"

export const rootsDialogLoadingBodyClass = cn(
  "roots-dialog-clearing-body flex min-h-48 flex-col items-center justify-center",
  rootsDialogPanelPaddingXClass,
  "py-[var(--rootsy-space-200)]",
)

export const rootsDialogFooterClass = cn(
  "roots-dialog-horizon roots-dialog-horizon--floor",
  "shrink-0 gap-[var(--rootsy-space-150)] border-t-0",
  rootsDialogPanelPaddingXClass,
  "py-[var(--rootsy-space-200)]",
  "sm:flex-row sm:items-center sm:justify-between",
)

/** Alert dialog — radius.xlarge · max 448px. */
export const rootsAlertDialogSurfaceClass = cn(
  rootsDialogPrimitiveResetClass,
  rootsDialogElevationScopeClass,
  "roots-dialog-living-block overflow-hidden rounded-xl border-0 text-[var(--rootsy-bruma-900)]",
  "shadow-[var(--elevation-shadow-overlay)] sm:max-w-md",
)

export const rootsAlertDialogContentClass = cn(
  "flex flex-col gap-[var(--rootsy-space-150)] bg-transparent text-left",
  rootsDialogPanelPaddingXClass,
  "pb-[var(--rootsy-space-200)] pt-[var(--rootsy-space-400)]",
)

/** font.heading.small · semibold · bruma-900 */
export const rootsAlertDialogTitleClass = cn(
  "font-canopy text-base leading-5 font-semibold tracking-[-0.02em] text-[var(--rootsy-bruma-900)]",
)

export const rootsAlertDialogDescriptionClass = rootsDialogDescriptionClass

export const rootsAlertDialogBodyTextClass = cn(
  "font-canopy text-[length:var(--rootsy-text-body-size)] leading-[var(--rootsy-text-body-lh)]",
  "font-normal text-[var(--rootsy-bruma-700)]",
)

export const rootsAlertDialogFooterClass = cn(
  "roots-dialog-horizon roots-dialog-horizon--floor",
  "flex shrink-0 flex-col-reverse gap-[var(--rootsy-space-150)] border-t-0",
  rootsDialogPanelPaddingXClass,
  "py-[var(--rootsy-space-200)]",
  "sm:flex-row sm:items-center sm:justify-between",
)
