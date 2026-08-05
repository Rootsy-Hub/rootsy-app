/**
 * Estilos RootsBanner — radius.large (12px) · strip full-bleed sin radio.
 */

import { cn } from "@/lib/utils"

/** radius.large — 12px (ROOTSY_BANNER_ANATOMY.borderRadiusPx). */
export const rootsBannerShellRadiusClass = "rounded-[12px]"

/** Barra full-bleed (header / error strip) — sin radio en bordes externos. */
export const rootsBannerStripClass = "rounded-none border-x-0 border-t-0"

export function rootsBannerShellClassForVariant(variant: "default" | "strip" = "default") {
  return variant === "strip" ? rootsBannerStripClass : rootsBannerShellRadiusClass
}

export function rootsBannerDismissRadiusClass() {
  return "rounded-full"
}
