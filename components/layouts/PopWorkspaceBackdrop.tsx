"use client"

import {
  menuAmbientTopGlowClass,
  menuNatureShellClass,
  menuVignetteClass,
} from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import "@/app/[siteId]/[popId]/menu/menuNaturePalette.css"
import { PopHeaderBackdropLayers } from "@/components/layouts/PopHeaderBackdropLayers"
import { cn } from "@/lib/utils"

type Props = {
  backgroundImageUrl?: string | null
  className?: string
}

/**
 * Fondo fijo de página — imagen POP + oscurecido (bg-background/32) + viñeta.
 * Igual que el menú; el header/footer solo llevan cristal encima.
 */
export function PopWorkspaceBackdrop({ backgroundImageUrl, className }: Props) {
  const url = backgroundImageUrl?.trim()
  if (!url) return null

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background",
        menuNatureShellClass,
        className,
      )}
      aria-hidden
    >
      <PopHeaderBackdropLayers backgroundImageUrl={url} />
      <div
        className={cn(
          "absolute top-0 left-1/2 h-[400px] w-[1000px] -translate-x-1/2 rounded-full blur-[120px]",
          menuAmbientTopGlowClass,
        )}
      />
      <div className={cn("absolute inset-0", menuVignetteClass)} />
    </div>
  )
}
