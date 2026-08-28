/**
 * Estilos producto — layout · módulo POP (cristal sombra · savia sobre fondo POP).
 * Espejo Tailwind de rootsyLayoutsModuleSystem + layoutsModuleHardcodedSpec.
 */

import "@/components/data-workspace/dataWorkspaceBlocksAtmosphere.css"
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
  "text-[var(--color-text-on-dark,var(--rootsy-bruma-50))]"

export const layoutsModuleHeaderPopNameClass = cn(
  "truncate text-sm font-semibold",
  layoutsModuleHeaderChromeTextClass,
)

export const layoutsModuleHeaderPopAddressClass = cn(
  "truncate text-[11px] leading-tight",
  "text-[color-mix(in_srgb,var(--rootsy-white)_58%,transparent)]",
)

export const layoutsModuleHeaderUserNameClass = cn(
  "truncate text-sm font-semibold",
  layoutsModuleHeaderChromeTextClass,
)

/** Row de contenido del módulo — sotobosque luz (layout.module.content). */
export const layoutsModuleContentShellClass = cn(
  "rootsy-app-light text-foreground",
  "data-workspace-blocks-atmosphere--sotobosque-luz",
)

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
