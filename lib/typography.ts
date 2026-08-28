import { ROOTSY_TEXT_ROLE_CLASS } from "@/lib/design-system/tokens/typography"
import { cn } from "@/lib/utils"

/**
 * Importes. Inter + tabular. Los tamaños son roles de métrica, no la escala de Tailwind.
 */
export const importeBaseClass = "font-numeric tabular-nums"

export const importeSmClass = cn(importeBaseClass, "text-sm font-semibold")

export const importeMdClass = ROOTSY_TEXT_ROLE_CLASS.metricSmall

export const importeLgClass = ROOTSY_TEXT_ROLE_CLASS.metricSmall

export const importeXlClass = ROOTSY_TEXT_ROLE_CLASS.metricMedium

export const importe2xlClass = ROOTSY_TEXT_ROLE_CLASS.metric
