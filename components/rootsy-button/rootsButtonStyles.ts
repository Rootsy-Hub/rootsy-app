import {
  rootsIconButtonNightChromeClass,
  rootsIconButtonNightFocusRingClass,
  rootsIconButtonNightGhostClass,
} from "@/components/rootsy-button/rootsIconButtonNightStyles"
import {
  rootsFormBrumaHighlightHoverClass,
  rootsFormBrumaTextSecondaryClass,
} from "@/components/rootsy-form/rootsFormBrumaTokens"
import { cn } from "@/lib/utils"

const rootsButtonFocusRingPrimary =
  "focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-600)_45%,transparent)] focus-visible:ring-offset-2"

const rootsButtonFocusRingDestructive =
  "focus-visible:ring-2 focus-visible:ring-[#dc2626]/45 focus-visible:ring-offset-2"

export type RootsButtonSize = "default" | "large"

const rootsButtonPrimarySkin = cn(
  "font-semibold text-[var(--rootsy-savia-950)] shadow-none",
  "bg-[var(--rootsy-savia-500)] hover:bg-[var(--rootsy-savia-400)] active:bg-[var(--rootsy-savia-600)]",
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

const rootsButtonNeutralPressedClass =
  "active:bg-muted active:text-foreground dark:active:bg-muted/70"

export const rootsButtonSecondaryClass = cn(
  "h-10 rounded-lg border border-[var(--rootsy-savia-700)] bg-transparent font-semibold text-[var(--rootsy-savia-700)] shadow-none",
  "hover:bg-[var(--rootsy-savia-50)]",
  "active:bg-[var(--rootsy-savia-100)]",
)

export const rootsButtonTertiaryClass = cn(
  "h-10 rounded-lg",
  rootsButtonNeutralHoverClass,
  rootsButtonNeutralPressedClass,
)

export const rootsButtonLinkClass = cn(
  "h-10 rounded-lg px-3 font-medium",
  "text-[var(--rootsy-savia-700)] hover:text-[var(--rootsy-savia-800)] hover:underline",
  "active:text-[var(--rootsy-savia-800)] active:underline active:decoration-2",
)

export const rootsButtonDestructiveClass = cn(
  "h-10 rounded-lg font-semibold text-[var(--rootsy-lava-950)] shadow-none",
  "bg-[var(--rootsy-lava-500)] hover:!bg-[var(--rootsy-lava-600)] active:!bg-[var(--rootsy-lava-700)]",
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
      return "size-6"
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
      return "[&_svg:not([class*='size-'])]:size-6"
  }
}

const rootsIconButtonActionBaseClass = cn(
  "inline-flex shrink-0 items-center justify-center rounded-lg border-0 bg-transparent p-0 shadow-none transition-colors duration-150 outline-none focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-current",
  rootsFormBrumaTextSecondaryClass,
)

const rootsIconButtonActionIntentClass: Record<
  RootsIconButtonActionIntent,
  string
> = {
  neutral: cn(
    rootsFormBrumaHighlightHoverClass,
    "hover:text-[color:var(--rootsy-bruma-900)]",
    "focus-visible:bg-[color:var(--rootsy-bruma-100)] focus-visible:text-[color:var(--rootsy-bruma-900)] focus-visible:ring-2 focus-visible:ring-[color:var(--rootsy-bruma-300)]/50 focus-visible:ring-offset-0",
    "active:bg-[color:var(--rootsy-bruma-200)]/80 active:text-[color:var(--rootsy-bruma-900)]",
  ),
  edit: cn(
    "hover:bg-[var(--rootsy-savia-50)] hover:text-[var(--rootsy-savia-700)]",
    "focus-visible:bg-[var(--rootsy-savia-50)] focus-visible:text-[var(--rootsy-savia-700)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-600)_25%,transparent)] focus-visible:ring-offset-0",
    "active:bg-[var(--rootsy-savia-100)] active:text-[var(--rootsy-savia-800)]",
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
  destructiveSubtle: "destructive-subtle",
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
    case "destructiveSubtle":
      return className
    case "link":
      return cn(rootsButtonLinkClass, className)
    default:
      return className
  }
}
