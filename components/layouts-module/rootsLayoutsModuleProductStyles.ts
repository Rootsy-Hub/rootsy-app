/**
 * Estilos producto — layout · módulo POP (cristal sombra · savia sobre fondo POP).
 * Espejo Tailwind de rootsyLayoutsModuleSystem + layoutsModuleHardcodedSpec.
 */

import { layoutsTablesChromeIconButtonClass } from "@/components/layouts-tables/rootsLayoutsTablesProductStyles"
import { cn } from "@/lib/utils"

/** Cristal oscuro sobre foto POP — tokens sombra, sin Nature --card. */
export const layoutsModuleHeaderGlassClass = cn(
  "border-b border-[color-mix(in_srgb,var(--rootsy-sombra-border)_80%,transparent)]",
  "bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_55%,transparent)]",
  "backdrop-blur-2xl backdrop-saturate-150",
  "supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--rootsy-sombra-900)_45%,transparent)]",
)

export const layoutsModuleHeaderChromeTextClass =
  "text-[var(--rootsy-text-on-dark,#f4f8f6)]"

export const layoutsModuleHeaderPopNameClass = cn(
  "truncate text-sm font-semibold",
  layoutsModuleHeaderChromeTextClass,
)

export const layoutsModuleHeaderUserNameClass = cn(
  "truncate text-sm font-semibold",
  layoutsModuleHeaderChromeTextClass,
)

/** Row de contenido del módulo — bruma-50 + tokens light (layout.module.content). */
export const layoutsModuleContentShellClass =
  "rootsy-app-light bg-[var(--rootsy-bruma-50)] text-foreground"

/** Variante de header para módulos POP — chrome sombra · savia. */
export const layoutsModuleHeaderVariant = "tables" as const

/** @deprecated Usar RootsIconButton theme="pos" emphasis="primary". */
export const layoutsModuleHeaderPrimaryIconButtonClass = cn(
  layoutsTablesChromeIconButtonClass,
  "border-[color-mix(in_srgb,var(--rootsy-white)_10%,var(--rootsy-savia-600))]",
  "bg-[var(--rootsy-savia-600)] text-white",
  "hover:border-[color-mix(in_srgb,var(--rootsy-white)_14%,var(--rootsy-savia-500))]",
  "hover:bg-[var(--rootsy-savia-500)] hover:text-white",
  "focus-visible:ring-[color-mix(in_srgb,var(--rootsy-white)_12%,var(--rootsy-savia-400)_8%)]",
)
