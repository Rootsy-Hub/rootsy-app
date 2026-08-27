/**
 * Tooltip dark por atmósfera — fondo 950 de cada familia, no un hex genérico.
 * Bruma oscura · Sombra · Éter.
 */

import type { RootsButtonAtmosphere } from "@/components/rootsy-button/rootsButtonAtmosphere"
import { cn } from "@/lib/utils"

export function rootsTooltipDarkClass(atmosphere: RootsButtonAtmosphere) {
  switch (atmosphere) {
    case "bruma":
      return {
        content: cn(
          "border border-[var(--rootsy-bruma-700)] bg-[var(--rootsy-bruma-950)] text-[var(--rootsy-bruma-50)]",
          "shadow-[0_12px_32px_-12px_color-mix(in_srgb,var(--rootsy-bruma-950)_75%,transparent)]",
        ),
        arrow: "fill-[var(--rootsy-bruma-950)] bg-[var(--rootsy-bruma-950)]",
      }
    case "sombra":
      return {
        content: cn(
          "border border-[var(--rootsy-sombra-400)] bg-[var(--rootsy-sombra-950)] text-[var(--rootsy-sombra-50)]",
          "shadow-[0_12px_32px_-12px_color-mix(in_srgb,var(--rootsy-sombra-950)_75%,transparent)]",
        ),
        arrow: "fill-[var(--rootsy-sombra-950)] bg-[var(--rootsy-sombra-950)]",
      }
    case "eter":
      return {
        content: cn(
          "border border-[var(--rootsy-eter-700)] bg-[var(--rootsy-eter-950)] text-[var(--rootsy-eter-50)]",
          "shadow-[0_12px_32px_-12px_color-mix(in_srgb,var(--rootsy-eter-950)_75%,transparent)]",
        ),
        arrow: "fill-[var(--rootsy-eter-950)] bg-[var(--rootsy-eter-950)]",
      }
  }
}
