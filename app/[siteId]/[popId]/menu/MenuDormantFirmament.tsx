"use client"

import {
  menuAmbientTopGlowClass,
  menuDormantAmbientWashClass,
  menuDormantCoreOrbClass,
  menuDormantFirmamentLayerClass,
  menuDormantHaloOrbClass,
  menuVignetteClass,
} from "@/app/[siteId]/[popId]/menu/menuDormantStyles"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
}

/** Cielo en reposo — universo exterior sin reinados despiertos. */
export function MenuDormantFirmament({ className }: Props) {
  return (
    <div className={cn(menuDormantFirmamentLayerClass, className)} aria-hidden>
      <div
        className={cn(
          "absolute left-1/2 top-[44%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px] opacity-55",
          menuDormantCoreOrbClass,
        )}
      />
      <div
        className={cn(
          "absolute left-[28%] top-[52%] h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-30",
          menuDormantHaloOrbClass,
        )}
      />
      <div
        className={cn(
          "absolute left-[72%] top-[48%] h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-25",
          menuDormantHaloOrbClass,
        )}
      />
      <div className={cn("absolute inset-0", menuDormantAmbientWashClass)} />
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
