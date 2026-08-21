import { cn } from "@/lib/utils"

/** Imagen de fondo POP — mismos tokens que el menú. */
export const popHeaderBackgroundImageClass =
  "absolute inset-0 size-full object-cover opacity-40"

/** Recorte para footer — zona cálida de la foto (como el header). */
export const popHeaderBackgroundImageFooterClass =
  "absolute inset-0 size-full object-cover object-[center_35%] opacity-40"

export const popHeaderGlassBorderClass =
  "border-[color-mix(in_srgb,#ffffff_4%,transparent)]"

/** Texto meta legible sobre cristal POP. */
export const popGlassFooterMutedTextClass = "text-[color:var(--rootsy-bruma-400)]"
export const popGlassFooterDotClass = "text-[color:var(--rootsy-bruma-600)]"

/** @deprecated Usar bg-background/32 dentro de menuNatureShellClass */
export const popHeaderBackgroundOverlayClass =
  "absolute inset-0 bg-background/32"

/** @deprecated Usar menuVignetteClass */
export const popWorkspaceVignetteClass =
  "bg-[radial-gradient(ellipse_at_center,transparent_0%,color-mix(in_srgb,var(--rootsy-eter-950)_50%,transparent)_100%)]"

/** @deprecated Usar menuHeaderChromeClass */
export const popHeaderGlassClass = cn(
  "bg-[color-mix(in_srgb,#0c1210_55%,transparent)] backdrop-blur-2xl backdrop-saturate-150",
  "supports-[backdrop-filter]:bg-[color-mix(in_srgb,#0c1210_45%,transparent)]",
)
