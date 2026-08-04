"use client"

import { cn } from "@/lib/utils"

export type FooterTotalCountSkeletonProps = {
  variant?: "default" | "dark"
  className?: string
}

/** Skeleton solo para el total de resultados en el pie de paginación. */
export function FooterTotalCountSkeleton({
  variant = "dark",
  className,
}: FooterTotalCountSkeletonProps) {
  const isDark = variant === "dark"
  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded align-middle",
        isDark
          ? "h-2.5 w-12 animate-pulse bg-[#263530]/70 md:w-16"
          : "h-3.5 w-10 animate-pulse rounded-[3px] bg-muted-foreground/12",
        className,
      )}
      aria-hidden
    />
  )
}
