"use client"

import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import type { DataWorkspaceHeaderIconButtonProps } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/** Botón de ícono del header con tooltip al hover — portal, no lo recorta el universo. */
export function DataWorkspaceHeaderTooltipIconButton({
  label,
  ...props
}: DataWorkspaceHeaderIconButtonProps) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <DataWorkspaceHeaderIconButton label={label} {...props} />
      </TooltipTrigger>
      <TooltipContent
        variant="dark"
        side="bottom"
        sideOffset={8}
        className="text-zinc-100"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
