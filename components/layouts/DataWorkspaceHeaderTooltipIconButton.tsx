"use client"

import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import type { DataWorkspaceHeaderIconButtonProps } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { cn } from "@/lib/utils"

/** Botón de ícono del header con tooltip oscuro al hover (Salones, Nuevo pedido, etc.). */
export function DataWorkspaceHeaderTooltipIconButton({
  label,
  className,
  ...props
}: DataWorkspaceHeaderIconButtonProps) {
  return (
    <div className={cn("group/header-tip relative flex", className)}>
      <DataWorkspaceHeaderIconButton label={label} {...props} />
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute top-full left-1/2 z-[520] mt-1.5 -translate-x-1/2",
          "whitespace-nowrap rounded-md border border-white/[0.06] bg-[#0c1014] px-3 py-1.5",
          "text-xs text-balance text-zinc-100 shadow-lg shadow-black/45",
          "opacity-0 transition-opacity duration-150 group-hover/header-tip:opacity-100",
        )}
      >
        {label}
      </span>
    </div>
  )
}
