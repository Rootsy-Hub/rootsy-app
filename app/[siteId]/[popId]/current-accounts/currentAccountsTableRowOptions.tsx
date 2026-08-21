"use client"

import type { CurrentAccountPartyRow } from "@/app/[siteId]/[popId]/current-accounts/actions"
import { currentAccountTableActionsColumnClass } from "@/app/[siteId]/[popId]/current-accounts/currentAccountsTableLayout"
import { RootsIconButton } from "@/components/rootsy-button/RootsIconButton"
import {
  lightToolbarDropdownContentClass,
  lightToolbarDropdownItemClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutActionsBodyCellClass,
  workspaceTableLayoutHeaderHeadClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { WorkspaceTableHead } from "@/components/data-workspace/WorkspaceTableHeader"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { CurrentAccountDirection } from "@/lib/currentAccounts"
import type { LucideIcon } from "lucide-react"
import {
  Banknote,
  Link2,
  MoreVertical,
  SlidersHorizontal,
  UserMinus,
  UserPlus,
} from "lucide-react"

export type CurrentAccountRowActionKind =
  | "settle"
  | "apply"
  | "terms"
  | "enroll"
  | "unenroll"

type RowOptionItem = {
  id: CurrentAccountRowActionKind
  label: string
  icon: LucideIcon
  destructive?: boolean
}

export function CurrentAccountTableActionsHead() {
  return (
    <WorkspaceTableHead
      tone="nature"
      align="center"
      className={cn(
        "pl-3 pr-1",
        currentAccountTableActionsColumnClass,
        workspaceTableLayoutHeaderHeadClass,
      )}
      srOnly
    >
      Acciones
    </WorkspaceTableHead>
  )
}

export function CurrentAccountTableActionsCell({
  row,
  direction,
  canCreate,
  busy,
  onAction,
}: {
  row: CurrentAccountPartyRow
  direction: CurrentAccountDirection
  canCreate: boolean
  busy?: boolean
  onAction: (kind: CurrentAccountRowActionKind) => void
}) {
  const items = buildCurrentAccountRowOptions(row, direction, canCreate)

  return (
    <TableCell
      className={cn(
        workspaceTableLayoutActionsBodyCellClass,
        "pl-3 pr-1",
        currentAccountTableActionsColumnClass,
      )}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {items.length > 0 ? (
        <div className="flex items-center justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <RootsIconButton
                label={`Opciones de ${row.partyName}`}
                tone="action"
                intent="neutral"
                size="compact"
                loading={busy}
              >
                <MoreVertical className="size-4" aria-hidden />
              </RootsIconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className={cn(lightToolbarDropdownContentClass, "w-44")}
            >
              {items.map((item, index) => {
                const Icon = item.icon
                const showSeparator =
                  item.destructive &&
                  index > 0 &&
                  !items[index - 1]?.destructive

                return (
                  <span key={item.id}>
                    {showSeparator ? (
                      <DropdownMenuSeparator className="bg-border/60" />
                    ) : null}
                    <DropdownMenuItem
                      variant={item.destructive ? "destructive" : "default"}
                      className={lightToolbarDropdownItemClass}
                      onSelect={() => onAction(item.id)}
                    >
                      <Icon className="size-4" aria-hidden />
                      {item.label}
                    </DropdownMenuItem>
                  </span>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}
    </TableCell>
  )
}

function buildCurrentAccountRowOptions(
  row: CurrentAccountPartyRow,
  direction: CurrentAccountDirection,
  canCreate: boolean,
): RowOptionItem[] {
  if (!canCreate) return []

  const items: RowOptionItem[] = [
    {
      id: "settle",
      label: direction === "payable" ? "Pagar" : "Cobrar",
      icon: Banknote,
    },
  ]

  if (row.unappliedCredit > 0.009) {
    items.push({
      id: "apply",
      label: "Imputar",
      icon: Link2,
    })
  }

  if (row.enrolled) {
    items.push({
      id: "terms",
      label: "Condiciones",
      icon: SlidersHorizontal,
    })
    items.push({
      id: "unenroll",
      label: "Deshabilitar",
      icon: UserMinus,
      destructive: true,
    })
  } else {
    items.push({
      id: "enroll",
      label: "Dar de alta",
      icon: UserPlus,
    })
  }

  return items
}
