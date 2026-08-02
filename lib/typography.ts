import { cn } from "@/lib/utils"

/**
 * Tipografía para importes y columnas numéricas (Inter + tabular-nums).
 * Usar en totales, precios, montos de tablas y tickets — no para IDs/código.
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
