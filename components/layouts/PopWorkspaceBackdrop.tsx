"use client"

import {
  menuAmbientTopGlowClass,
  menuNatureShellClass,
  menuVignetteClass,
} from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import "@/app/[siteId]/[popId]/menu/menuNaturePalette.css"
import { cn } from "@/lib/utils"

type Props = {
  backgroundImageUrl?: string | null
  className?: string
}

/**
 * Capa de fondo POP — absolute dentro de un contenedor `fixed inset-0`
 * (misma estructura que el menú). Header y footer van encima con cristal propio.
 */
export function PopWorkspaceBackdrop({ backgroundImageUrl, className }: Props) {
  const url = backgroundImageUrl?.trim()

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        menuNatureShellClass,
        className,
      )}
      aria-hidden
    >
      {url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-[0.40]"
          />
          <div className="absolute inset-0 bg-background/32" />
        </>
      ) : null}
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
