import { cn } from "@/lib/utils"

/**
 * Tipografía para importes y columnas numéricas.
 * Fuentes: lib/design-system/tokens/typography.ts · --rootsy-font-numeric
 */
export const importeBaseClass = "font-numeric tabular-nums tracking-tight"

export const importeSmClass = cn(importeBaseClass, "text-sm font-semibold")

export const importeMdClass = cn(importeBaseClass, "text-base font-semibold")

export const importeLgClass = cn(
  importeBaseClass,
  "text-lg font-semibold tracking-tight",
)

export const importeXlClass = cn(
  importeBaseClass,
  "text-2xl font-bold tracking-tight",
)

export const importe2xlClass = cn(
  importeBaseClass,
  "text-3xl font-bold tracking-tight",
)
