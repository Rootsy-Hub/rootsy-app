/**
 * Dialog / alert — tokens Modales UI (elevation · bruma · sombra).
 * @see app/.../library/ui-components/modalsUiHardcodedSpec.ts
 */

import { cn } from "@/lib/utils"

/** z-index elevación — blanket 500 · panel 510. */
export const rootsDialogOverlayZClass = "z-[500]"
export const rootsDialogContentZClass = "z-[510]"

/** Scrim sombra-950 40% — velo oscuro, sin blur tipo cristal. */
export const rootsDialogOverlayClass = cn(
  rootsDialogOverlayZClass,
  "bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_40%,transparent)]",
)

/** panel-padding · space.400 */
export const rootsDialogPanelPaddingXClass = "px-[var(--rootsy-space-400)]"

/** Reset primitivo shadcn — flex shell sin grid/p-6/bg-background. */
export const rootsDialogPrimitiveResetClass = cn(
  "flex flex-col gap-0 p-0 bg-white border-0 shadow-none",
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

/** Shell modal — overlay + border + shadow.overlay · overflow recorta regiones al radio. */
export const rootsDialogPanelShellClass = cn(
  rootsDialogPrimitiveResetClass,
  rootsDialogElevationScopeClass,
  "overflow-hidden text-[var(--rootsy-bruma-900)]",
  "border border-[var(--rootsy-bruma-200)] shadow-[var(--elevation-shadow-overlay)]",
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
  "flex shrink-0 flex-col gap-[var(--rootsy-space-100)] border-b border-[var(--rootsy-bruma-200)] bg-white",
  rootsDialogPanelPaddingXClass,
  "pt-[var(--rootsy-space-400)] text-left sm:text-left",
)

/** Header con subtítulo visible — pb space.200 (spec modal). */
export const rootsDialogHeaderWithDescriptionClass =
  "pb-[var(--rootsy-space-200)]"

/** Header solo título — pb simétrico space.400; alinea banda título + close. */
export const rootsDialogHeaderCompactClass = "pb-[var(--rootsy-space-400)]"

/** font.heading.medium · bruma-900 · reserva horizontal para close space.400. */
export const rootsDialogTitleClass = cn(
  "font-canopy text-[length:var(--rootsy-text-heading-medium-size)] leading-[var(--rootsy-text-heading-medium-lh)]",
  "font-bold tracking-[-0.01em] text-[var(--rootsy-bruma-900)]",
  "pr-[calc(var(--rootsy-space-400)+var(--rootsy-space-400)+var(--rootsy-space-100))]",
)

/** body.small · bruma-500 */
export const rootsDialogDescriptionClass = cn(
  "font-canopy text-[length:var(--rootsy-text-body-small-size)] leading-[var(--rootsy-text-body-small-lh)]",
  "font-normal text-[var(--rootsy-bruma-500)]",
)

/** elevation.surface.sunken · panel-padding space.400. */
export const rootsDialogBodyClass = cn(
  "min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[var(--elevation-surface-sunken)]",
  rootsDialogPanelPaddingXClass,
  "py-[var(--rootsy-space-200)]",
)

/** Body compacto — overlay, sin sunken. */
export const rootsDialogBodyCompactClass = cn(
  "flex-none overflow-y-auto overscroll-contain bg-white",
  rootsDialogPanelPaddingXClass,
  "py-[var(--rootsy-space-200)]",
)

export const rootsDialogLoadingBodyClass = cn(
  "flex min-h-48 flex-col items-center justify-center bg-[var(--elevation-surface-sunken)]",
  rootsDialogPanelPaddingXClass,
  "py-[var(--rootsy-space-200)]",
)

export const rootsDialogFooterClass = cn(
  "shrink-0 gap-[var(--rootsy-space-150)] border-t border-[var(--rootsy-bruma-200)] bg-white",
  rootsDialogPanelPaddingXClass,
  "py-[var(--rootsy-space-150)]",
  "sm:flex-row sm:items-center sm:justify-between",
)

/** Alert dialog — radius.xlarge · max 448px. */
export const rootsAlertDialogSurfaceClass = cn(
  rootsDialogPrimitiveResetClass,
  rootsDialogElevationScopeClass,
  "overflow-hidden rounded-xl border border-[var(--rootsy-bruma-200)] text-[var(--rootsy-bruma-900)]",
  "shadow-[var(--elevation-shadow-overlay)] sm:max-w-md",
)

export const rootsAlertDialogContentClass = cn(
  "flex flex-col gap-[var(--rootsy-space-150)] bg-white text-left",
  rootsDialogPanelPaddingXClass,
  "pb-[var(--rootsy-space-200)] pt-[var(--rootsy-space-400)]",
)

/** font.heading.small · bruma-900 */
export const rootsAlertDialogTitleClass = cn(
  "font-canopy text-[length:var(--rootsy-text-heading-small-size)] leading-[var(--rootsy-text-heading-small-lh)]",
  "font-bold tracking-[-0.01em] text-[var(--rootsy-bruma-900)]",
)

export const rootsAlertDialogDescriptionClass = rootsDialogDescriptionClass

export const rootsAlertDialogBodyTextClass = cn(
  "font-canopy text-[length:var(--rootsy-text-body-size)] leading-[var(--rootsy-text-body-lh)]",
  "font-normal text-[var(--rootsy-bruma-700)]",
)

export const rootsAlertDialogFooterClass = cn(
  "flex shrink-0 flex-col-reverse gap-[var(--rootsy-space-150)] border-t border-[var(--rootsy-bruma-200)] bg-white",
  rootsDialogPanelPaddingXClass,
  "py-[var(--rootsy-space-150)]",
  "sm:flex-row sm:items-center sm:justify-between",
)
