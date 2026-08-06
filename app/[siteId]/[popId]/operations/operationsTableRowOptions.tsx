"use client"

import {
  operationsTableActionsBodyCellClass,
  operationsTableActionsHeaderClass,
} from "@/app/[siteId]/[popId]/operations/operationsTableLayout"
import { RootsIconButton } from "@/components/rootsy-button/RootsIconButton"
import {
  lightToolbarDropdownContentClass,
  lightToolbarDropdownItemClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TableCell } from "@/components/ui/table"
import { WorkspaceTableHead } from "@/components/data-workspace/WorkspaceTableHeader"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { MoreVertical } from "lucide-react"
import type { ReactNode } from "react"

export type OperationTableRowOptionItem = {
  id: string
  label: string
  icon: LucideIcon
  onSelect: () => void
  destructive?: boolean
}

export function OperationTableActionsHead() {
  return (
    <WorkspaceTableHead
      tone="nature"
      align="center"
      className={operationsTableActionsHeaderClass()}
      srOnly
    >
      Acciones
    </WorkspaceTableHead>
  )
}

export function OperationTableActionsCell({
  children,
}: {
  children: ReactNode
}) {
  return (
    <TableCell className={operationsTableActionsBodyCellClass}>
      <div className="flex items-center justify-center">{children}</div>
    </TableCell>
  )
}

export function OperationTableRowOptionsMenu({
  rowLabel,
  items,
}: {
  rowLabel: string
  items: OperationTableRowOptionItem[]
}) {
  if (items.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <RootsIconButton
          label={`Opciones ${rowLabel}`}
          tone="action"
          intent="neutral"
          size="compact"
        >
          <MoreVertical className="size-4" aria-hidden />
        </RootsIconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(lightToolbarDropdownContentClass, "w-44")}
      >
        {items.map((item, index) => {
          const Icon = item.icon
          const showSeparator =
            item.destructive && index > 0 && !items[index - 1]?.destructive

          return (
            <span key={item.id}>
              {showSeparator ? (
                <DropdownMenuSeparator className="bg-border/60" />
              ) : null}
              <DropdownMenuItem
                variant={item.destructive ? "destructive" : "default"}
                className={lightToolbarDropdownItemClass}
                onSelect={item.onSelect}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </DropdownMenuItem>
            </span>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
