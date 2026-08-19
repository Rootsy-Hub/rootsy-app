"use client"

import { cn } from "@/lib/utils"

export type FooterTotalCountSkeletonProps = {
  variant?: "default" | "dark" | "earth" | "tables"
  className?: string
}

/** Skeleton solo para el total de resultados en el pie de paginación. */
export function FooterTotalCountSkeleton({
  variant = "dark",
  className,
}: FooterTotalCountSkeletonProps) {
  const isDark = variant === "dark"
  const isEarth = variant === "earth"
  const isTables = variant === "tables"
  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded align-middle",
        isTables
          ? "h-2.5 w-12 animate-pulse bg-[color-mix(in_srgb,var(--nature-earth-400,#D6D3D1)_28%,transparent)] md:w-16"
          : isDark
          ? "h-2.5 w-12 animate-pulse bg-[#263530]/70 md:w-16"
          : isEarth
            ? "h-2.5 w-12 animate-pulse rounded-sm bg-[color-mix(in_srgb,var(--nature-earth-600)_55%,transparent)] md:w-16"
            : "h-3.5 w-10 animate-pulse rounded-[3px] bg-muted-foreground/12",
        className,
      )}
      aria-hidden
    />
  )
}
