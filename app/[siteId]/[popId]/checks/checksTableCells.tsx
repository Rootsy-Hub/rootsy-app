"use client"

import type { CheckTableRow } from "@/app/[siteId]/[popId]/checks/actions"
import {
  checkTableActionsColumnClass,
  checkTableAmountColumnClass,
  checkTableBankColumnClass,
  checkTableDateColumnClass,
  checkTableDirectionColumnClass,
  checkTableNumberColumnClass,
  checkTablePartyColumnClass,
  checkTableStatusColumnClass,
} from "@/app/[siteId]/[popId]/checks/checksTableLayout"
import { RootsIconButton } from "@/components/rootsy-button/RootsIconButton"
import {
  RootsDropdownContent,
  RootsDropdownItem,
  RootsDropdownMenu,
  RootsDropdownSeparator,
  RootsDropdownTrigger,
} from "@/components/rootsy-dropdown"
import { dataWorkspaceLightDropdownContentClass } from "@/components/layouts/dataWorkspaceHeaderStyles"
import { DataWorkspaceTableMoney } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { workspaceTableLayoutBodyCellClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { RootsNaturePill } from "@/components/rootsy-pill"
import {
  checkDirectionLabel,
  checkDirectionPillVariant,
  checkLifecycleActions,
  checkStatusLabel,
  checkStatusPillVariant,
  type CheckLifecycleAction,
} from "@/lib/checkDocuments"
import { cn } from "@/lib/utils"
import { TableCell } from "@/components/ui/table"
import {
  Ban,
  CircleCheck,
  Landmark,
  MoreHorizontal,
  XCircle,
} from "lucide-react"

const moneyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

function formatIsoDate(iso: string) {
  if (!iso) return "—"
  const date = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function CheckTableNumberCell({ value }: { value: string }) {
  return (
    <TableCell
      className={cn(workspaceTableLayoutBodyCellClass, checkTableNumberColumnClass)}
    >
      <p className={cn("truncate font-medium", workspaceTableNatureTextPrimaryClass)}>
        {value || "—"}
      </p>
    </TableCell>
  )
}

export function CheckTableDirectionCell({ value }: { value: string }) {
  return (
    <TableCell
      className={cn(
        workspaceTableLayoutBodyCellClass,
        checkTableDirectionColumnClass,
      )}
    >
      <RootsNaturePill variant={checkDirectionPillVariant(value)}>
        {checkDirectionLabel(value)}
      </RootsNaturePill>
    </TableCell>
  )
}

export function CheckTableBankCell({ value }: { value: string }) {
  return (
    <TableCell
      className={cn(workspaceTableLayoutBodyCellClass, checkTableBankColumnClass)}
    >
      <p className={cn("truncate", workspaceTableNatureTextSecondaryClass)}>
        {value || "—"}
      </p>
    </TableCell>
  )
}

export function CheckTablePartyCell({ value }: { value: string }) {
  return (
    <TableCell
      className={cn(workspaceTableLayoutBodyCellClass, checkTablePartyColumnClass)}
    >
      <p className={cn("truncate", workspaceTableNatureTextPrimaryClass)}>
        {value || "—"}
      </p>
    </TableCell>
  )
}

export function CheckTableAmountCell({ value }: { value: number }) {
  return (
    <TableCell
      className={cn(workspaceTableLayoutBodyCellClass, checkTableAmountColumnClass)}
    >
      <DataWorkspaceTableMoney>{moneyFormatter.format(value)}</DataWorkspaceTableMoney>
    </TableCell>
  )
}

export function CheckTableDateCell({ value }: { value: string }) {
  return (
    <TableCell
      className={cn(workspaceTableLayoutBodyCellClass, checkTableDateColumnClass)}
    >
      <span className={workspaceTableNatureTextSecondaryClass}>
        {formatIsoDate(value)}
      </span>
    </TableCell>
  )
}

export function CheckTableStatusCell({ value }: { value: string }) {
  return (
    <TableCell
      className={cn(workspaceTableLayoutBodyCellClass, checkTableStatusColumnClass)}
    >
      <RootsNaturePill variant={checkStatusPillVariant(value)}>
        {checkStatusLabel(value)}
      </RootsNaturePill>
    </TableCell>
  )
}

function lifecycleActionIcon(action: CheckLifecycleAction) {
  if (action === "deposit") return Landmark
  if (action === "clear") return CircleCheck
  if (action === "reject") return XCircle
  return Ban
}

export function CheckTableActionsCell({
  row,
  disabled,
  onAction,
}: {
  row: CheckTableRow
  disabled?: boolean
  onAction: (action: CheckLifecycleAction) => void
}) {
  const actions = checkLifecycleActions(row.status, row.direction)
  if (disabled || actions.length === 0) {
    return (
      <TableCell
        className={cn(
          workspaceTableLayoutBodyCellClass,
          checkTableActionsColumnClass,
        )}
      />
    )
  }

  return (
    <TableCell
      className={cn(
        workspaceTableLayoutBodyCellClass,
        checkTableActionsColumnClass,
      )}
    >
      <div className="flex justify-end">
        <RootsDropdownMenu modal={false}>
          <RootsDropdownTrigger asChild>
            <RootsIconButton
              type="button"
              label={`Acciones del cheque ${row.checkNumber}`}
              tone="light"
              rowIntent="neutral"
              size="compact"
              disabled={disabled}
            >
              <MoreHorizontal aria-hidden />
            </RootsIconButton>
          </RootsDropdownTrigger>
          <RootsDropdownContent
            theme="light"
            align="end"
            className={cn(dataWorkspaceLightDropdownContentClass, "z-[500] w-48")}
          >
            {actions.map((action, index) => {
              const Icon = lifecycleActionIcon(action.id)
              const showSeparator =
                action.destructive &&
                index > 0 &&
                !actions[index - 1]?.destructive
              return (
                <div key={action.id}>
                  {showSeparator ? (
                    <RootsDropdownSeparator theme="light" />
                  ) : null}
                  <RootsDropdownItem
                    theme="light"
                    variant={action.destructive ? "destructive" : "default"}
                    className="gap-2"
                    onSelect={() => onAction(action.id)}
                  >
                    <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                    {action.label}
                  </RootsDropdownItem>
                </div>
              )
            })}
          </RootsDropdownContent>
        </RootsDropdownMenu>
      </div>
    </TableCell>
  )
}
