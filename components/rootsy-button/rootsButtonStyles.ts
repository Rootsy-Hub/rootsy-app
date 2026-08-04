import {
  nightForestFocusRingClass,
  nightForestIconButtonStarSkinClass,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import { cn } from "@/lib/utils"

const rootsButtonFocusRingPrimary =
  "focus-visible:ring-2 focus-visible:ring-[#16704a]/45 focus-visible:ring-offset-2"

const rootsButtonFocusRingDestructive =
  "focus-visible:ring-2 focus-visible:ring-[#dc2626]/45 focus-visible:ring-offset-2"

export type RootsButtonSize = "default" | "large"

const rootsButtonPrimarySkin = cn(
  "font-semibold text-white shadow-sm",
  "bg-[#1e8f5a] hover:bg-[#24ad6a] active:bg-[#16704a]",
  rootsButtonFocusRingPrimary,
)

export const rootsButtonDefaultSizeClass = "h-10 rounded-lg px-4 text-sm"

export const rootsButtonLargeSizeClass = "h-12 rounded-lg px-6 text-base"

/**
 * Primary estándar — modales, footers, CTAs default.
 */
export const rootsButtonPrimaryClass = cn(
  rootsButtonPrimarySkin,
  rootsButtonDefaultSizeClass,
)

const rootsButtonNeutralHoverClass =
  "hover:bg-muted/50 hover:text-foreground dark:hover:bg-muted/40"

/** Un paso más de muted + sombra inset — feedback táctil sin bloque gris duro. */
const rootsButtonNeutralPressedClass =
  "active:bg-muted active:text-foreground active:shadow-[inset_0_1px_2px_rgba(41,37,36,0.07)] dark:active:bg-muted/70"

export const rootsButtonSecondaryClass = cn(
  "h-10 rounded-lg",
  rootsButtonNeutralHoverClass,
  rootsButtonNeutralPressedClass,
  "active:border-border",
)

export const rootsButtonTertiaryClass = cn(
  "h-10 rounded-lg",
  rootsButtonNeutralHoverClass,
  rootsButtonNeutralPressedClass,
)

export const rootsButtonLinkClass = cn(
  "h-10 rounded-lg px-3 font-medium",
  "text-[#16704a] hover:text-[#1e8f5a] hover:underline",
  "active:text-[#0f5739] active:underline active:decoration-2",
)

export const rootsButtonDestructiveClass = cn(
  "h-10 rounded-lg font-semibold text-white shadow-sm",
  "bg-[#dc2626] hover:!bg-[#ef4444] active:!bg-[#b91c1c]",
  rootsButtonFocusRingDestructive,
)

export type RootsIconButtonTone = "light" | "dark" | "action"

export type RootsIconButtonActionIntent = "neutral" | "edit" | "destructive"

export type RootsIconButtonSize = "compact" | "default" | "large"

const rootsIconButtonSizeClass: Record<RootsIconButtonSize, string> = {
  compact: "size-8",
  default: "size-10",
  large: "size-12",
}

/** Escala del ícono según tamaño del botón (default = chrome del header, size-5). */
export function rootsIconButtonIconClass(size: RootsIconButtonSize = "default") {
  switch (size) {
    case "compact":
      return "size-4"
    case "default":
      return "size-5"
    case "large":
      return "size-5"
  }
}

/** Radio del chrome del header — misma curvatura en compact, default y large. */
const rootsIconButtonRadiusClass = "rounded-xl"

const rootsIconButtonBaseClass =
  "inline-flex shrink-0 items-center justify-center border transition-all outline-none focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-current"

function rootsIconButtonSvgClass(size: RootsIconButtonSize) {
  switch (size) {
    case "compact":
      return "[&_svg:not([class*='size-'])]:size-4"
    case "default":
      return "[&_svg:not([class*='size-'])]:size-5"
    case "large":
      return "[&_svg:not([class*='size-'])]:size-5"
  }
}

const rootsIconButtonActionBaseClass =
  "inline-flex shrink-0 items-center justify-center rounded-lg border-0 bg-transparent p-0 text-zinc-500 shadow-none transition-colors duration-150 outline-none focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-current"

const rootsIconButtonActionIntentClass: Record<
  RootsIconButtonActionIntent,
  string
> = {
  neutral: cn(
    "hover:bg-zinc-100 hover:text-zinc-800",
    "focus-visible:bg-zinc-100 focus-visible:text-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-400/25 focus-visible:ring-offset-0",
    "active:bg-zinc-200/80 active:text-zinc-900",
  ),
  edit: cn(
    "hover:bg-emerald-50 hover:text-emerald-700",
    "focus-visible:bg-emerald-50 focus-visible:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500/25 focus-visible:ring-offset-0",
    "active:bg-emerald-100 active:text-emerald-800",
  ),
  destructive: cn(
    "hover:bg-rose-50 hover:text-rose-600",
    "focus-visible:bg-rose-50 focus-visible:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-400/30 focus-visible:ring-offset-0",
    "active:bg-rose-100 active:text-rose-700",
  ),
}

/** IconButton ghost — acciones de fila en tablas (solo ícono, hover tintado). */
export function rootsIconButtonActionClass({
  intent = "edit",
  size = "compact",
}: {
  intent?: RootsIconButtonActionIntent
  size?: RootsIconButtonSize
} = {}) {
  return cn(
    rootsIconButtonActionBaseClass,
    rootsIconButtonActionIntentClass[intent],
    rootsIconButtonSizeClass[size],
    rootsIconButtonSvgClass(size),
  )
}

/** IconButton unificado — light (outline neutro) y dark (header bosque nocturno). */
export function rootsIconButtonClass({
  tone = "light",
  size = "default",
}: {
  tone?: RootsIconButtonTone
  size?: RootsIconButtonSize
} = {}) {
  const sizeClass = rootsIconButtonSizeClass[size]
  const svgClass = rootsIconButtonSvgClass(size)

  if (tone === "dark") {
    return cn(
      rootsIconButtonBaseClass,
      rootsIconButtonRadiusClass,
      nightForestIconButtonStarSkinClass,
      nightForestFocusRingClass,
      sizeClass,
      svgClass,
    )
  }

  return cn(
    rootsIconButtonBaseClass,
    rootsIconButtonRadiusClass,
    "shadow-xs",
    "border-border bg-background text-foreground",
    rootsButtonNeutralHoverClass,
    rootsButtonNeutralPressedClass,
    "active:border-border",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    sizeClass,
    svgClass,
  )
}

/** @deprecated Usar rootsIconButtonClass({ tone: "dark", size }). */
export function rootsButtonDarkIconButtonClass(size: RootsIconButtonSize = "default") {
  return rootsIconButtonClass({ tone: "dark", size })
}

/** @deprecated Usar RootsIconButtonSize */
export type RootsButtonIconSize = RootsIconButtonSize

/** Variantes recomendadas por rol */
export const rootsButtonVariant = {
  primary: "default",
  secondary: "outline",
  tertiary: "ghost-neutral",
  destructive: "destructive",
  link: "link",
} as const

export type RootsButtonSemanticVariant = keyof typeof rootsButtonVariant

export function rootsButtonClassForVariant(
  semantic: RootsButtonSemanticVariant,
  className?: string,
  size: RootsButtonSize = "default",
) {
  const primarySizeClass =
    size === "large" ? rootsButtonLargeSizeClass : rootsButtonDefaultSizeClass

  switch (semantic) {
    case "primary":
      return cn(rootsButtonPrimarySkin, primarySizeClass, className)
    case "secondary":
      return cn(rootsButtonSecondaryClass, className)
    case "tertiary":
      return cn(rootsButtonTertiaryClass, className)
    case "destructive":
      return cn(rootsButtonDestructiveClass, className)
    case "link":
      return cn(rootsButtonLinkClass, className)
    default:
      return className
  }
}
