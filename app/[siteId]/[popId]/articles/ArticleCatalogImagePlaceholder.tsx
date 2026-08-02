"use client"

import { cn } from "@/lib/utils"
import { ImagePlus } from "lucide-react"

const sizeClass = {
  sm: "size-10 rounded-lg",
  lg: "size-20 rounded-xl",
} as const

const iconClass = {
  sm: "size-3.5",
  lg: "size-5",
} as const

/** Placeholder visual compartido para celdas de tabla y estados vacíos del catálogo. */
export function ArticleCatalogImagePlaceholder({
  size = "lg",
  className,
}: {
  size?: keyof typeof sizeClass
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden border border-border/45 bg-background",
        sizeClass[size],
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[linear-gradient(145deg,hsl(var(--muted)/0.55)_0%,hsl(var(--background))_42%,hsl(var(--muted)/0.28)_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, hsl(var(--border)) 0.65px, transparent 0.65px)",
          backgroundSize: size === "lg" ? "9px 9px" : "7px 7px",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-muted/30 to-transparent" />
      <div
        className={cn(
          "absolute left-1/2 top-[44%] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background/75 text-muted-foreground/55 shadow-[0_1px_2px_hsl(var(--foreground)/0.06)] ring-1 ring-border/35 backdrop-blur-[1px]",
          size === "lg" ? "size-8" : "size-6",
        )}
      >
        <ImagePlus className={iconClass[size]} strokeWidth={1.75} />
      </div>
    </div>
  )
}
