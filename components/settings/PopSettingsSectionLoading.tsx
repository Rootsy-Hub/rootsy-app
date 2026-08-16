"use client"

import { RootsSpinner } from "@/components/rootsy-spinner"
import { cn } from "@/lib/utils"

export function PopSettingsSectionLoading({
  className,
  label = "Cargando sección…",
}: {
  className?: string
  label?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-[min(24rem,100%)] flex-1 flex-col items-center justify-center gap-3 px-4 py-12",
        className,
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <RootsSpinner size="default" label={label} />
      <p className="font-canopy text-sm text-[var(--rootsy-bruma-500)]">{label}</p>
    </div>
  )
}
