import {
  rootsIconButtonNightChromeClass,
  rootsIconButtonNightFocusRingClass,
  rootsIconButtonNightGhostClass,
} from "@/components/rootsy-button/rootsIconButtonNightStyles"
import {
  rootsFormEarthHighlightHoverClass,
  rootsFormEarthTextSecondaryClass,
} from "@/components/rootsy-form/rootsFormEarthTokens"
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

/** Tamaño compact — tablas, bulk toolbar, toolbars densos (h-8). */
export const rootsButtonCompactSizeClass =
  "!h-8 rounded-md px-3 text-sm gap-1.5 has-[>svg]:px-2.5"

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

export type RootsIconButtonSurface = "light" | "dark"

export type RootsIconButtonTone = "light" | "dark" | "secondary" | "ghost" | "action"

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

const rootsIconButtonActionBaseClass = cn(
  "inline-flex shrink-0 items-center justify-center rounded-lg border-0 bg-transparent p-0 shadow-none transition-colors duration-150 outline-none focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-current",
  rootsFormEarthTextSecondaryClass,
)

const rootsIconButtonActionIntentClass: Record<
  RootsIconButtonActionIntent,
  string
> = {
  neutral: cn(
    rootsFormEarthHighlightHoverClass,
    "hover:text-[#292524]",
    "focus-visible:bg-[#f5f5f0] focus-visible:text-[#292524] focus-visible:ring-2 focus-visible:ring-[#d6d3d1]/50 focus-visible:ring-offset-0",
    "active:bg-[#e7e5e4]/80 active:text-[#292524]",
  ),
  edit: cn(
    "hover:bg-[#f0fbf4] hover:text-[#16704a]",
    "focus-visible:bg-[#f0fbf4] focus-visible:text-[#16704a] focus-visible:ring-2 focus-visible:ring-[#16704a]/25 focus-visible:ring-offset-0",
    "active:bg-[#ddf5e8] active:text-[#0f5739]",
  ),
  destructive: cn(
    "hover:bg-[#dc2626]/10 hover:text-[#dc2626]",
    "focus-visible:bg-[#dc2626]/10 focus-visible:text-[#dc2626] focus-visible:ring-2 focus-visible:ring-[#dc2626]/25 focus-visible:ring-offset-0",
    "active:bg-[#dc2626]/15 active:text-[#b91c1c]",
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

/** Ghost · light — sin borde; menú (campana/ajustes), volver en detalle cuentas/cajas. */
export const rootsIconButtonGhostSkinClass = cn(
  "border-0 bg-transparent shadow-none text-muted-foreground",
  rootsButtonNeutralHoverClass,
  rootsButtonNeutralPressedClass,
  "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/15",
)

/** Ghost · dark — utilidades sobre gama noche / menú Nature. */
export const rootsIconButtonGhostDarkSkinClass = cn(
  rootsIconButtonNightGhostClass,
  rootsIconButtonNightFocusRingClass,
)

/** Secondary · dark — mismo chrome que tone=dark. */
export const rootsIconButtonSecondaryDarkSkinClass =
  rootsIconButtonNightChromeClass

/** @deprecated Usar rootsIconButtonNightChromeClass */
export const rootsIconButtonNightChromeSkinClass = rootsIconButtonNightChromeClass

/** Secondary · light — chrome con borde; menú Home, header workspace claro. */
export const rootsIconButtonSecondarySkinClass = cn(
  "border-foreground/10 bg-secondary text-foreground/70",
  "hover:border-primary/25 hover:bg-muted hover:text-foreground",
  "active:border-border active:bg-muted active:text-foreground active:scale-95",
  "focus-visible:border-foreground/20 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/15",
  "[&_svg:not([class*='text-'])]:text-foreground/50 hover:[&_svg:not([class*='text-'])]:text-foreground/80",
)

/** IconButton unificado — light, dark, secondary, ghost (header / navegación). */
export function rootsIconButtonClass({
  tone = "light",
  size = "default",
  surface = "light",
}: {
  tone?: Exclude<RootsIconButtonTone, "action">
  size?: RootsIconButtonSize
  /** Superficie para ghost y secondary — light (default) o dark (bosque nocturno). */
  surface?: RootsIconButtonSurface
} = {}) {
  const sizeClass = rootsIconButtonSizeClass[size]
  const svgClass = rootsIconButtonSvgClass(size)
  const radiusClass =
    tone === "ghost" && size === "compact"
      ? "rounded-lg"
      : rootsIconButtonRadiusClass

  if (tone === "dark") {
    return cn(
      rootsIconButtonBaseClass,
      rootsIconButtonRadiusClass,
      rootsIconButtonNightChromeClass,
      rootsIconButtonNightFocusRingClass,
      sizeClass,
      svgClass,
    )
  }

  if (tone === "ghost") {
    return cn(
      rootsIconButtonBaseClass,
      radiusClass,
      surface === "dark"
        ? rootsIconButtonGhostDarkSkinClass
        : rootsIconButtonGhostSkinClass,
      sizeClass,
      svgClass,
    )
  }

  if (tone === "secondary") {
    if (surface === "dark") {
      return cn(
        rootsIconButtonBaseClass,
        "group",
        rootsIconButtonRadiusClass,
        rootsIconButtonSecondaryDarkSkinClass,
        rootsIconButtonNightFocusRingClass,
        sizeClass,
        svgClass,
      )
    }

    return cn(
      rootsIconButtonBaseClass,
      "group",
      rootsIconButtonRadiusClass,
      rootsIconButtonSecondarySkinClass,
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
