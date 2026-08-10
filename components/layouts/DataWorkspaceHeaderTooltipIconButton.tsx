"use client"

import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import type { DataWorkspaceHeaderIconButtonProps } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/** Botón de ícono del header con tooltip oscuro al hover (Salones, Nuevo pedido, etc.). */
export function DataWorkspaceHeaderTooltipIconButton({
  label,
  ...props
}: DataWorkspaceHeaderIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <DataWorkspaceHeaderIconButton label={label} {...props} />
      </TooltipTrigger>
      <TooltipContent variant="dark" side="bottom" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
