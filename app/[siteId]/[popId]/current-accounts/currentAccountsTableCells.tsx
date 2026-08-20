"use client"

import {
  currentAccountLedgerDateColumnClass,
  currentAccountLedgerDocColumnClass,
  currentAccountLedgerMoneyColumnClass,
  currentAccountOpenAgingColumnClass,
  currentAccountTableAmountColumnClass,
  currentAccountTableCountColumnClass,
  currentAccountTablePartyColumnClass,
} from "@/app/[siteId]/[popId]/current-accounts/currentAccountsTableLayout"
import { DataWorkspaceTableMoney } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutCellSecondaryTextClass,
  workspaceTableLayoutCellStackClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { formatPopTime } from "@/lib/popTimezone"
import { currentAccountAgingPillVariant } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountAgingStrip"
import { RootsNaturePill } from "@/components/rootsy-pill"
import {
  currentAccountAgingBucketLabel,
  currentAccountWorstAgingBucket,
  type CurrentAccountAgingBucket,
  type CurrentAccountAgingTotals,
} from "@/lib/currentAccounts"
import { cn } from "@/lib/utils"
import { TableCell } from "@/components/ui/table"

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

function formatMoney(value: number) {
  return moneyFormatter.format(value)
}

export function CurrentAccountPartyNameCell({ value }: { value: string }) {
  return (
    <TableCell
      className={cn(
        workspaceTableLayoutBodyCellClass,
        currentAccountTablePartyColumnClass,
      )}
    >
      <p className={cn("truncate font-medium", workspaceTableNatureTextPrimaryClass)}>
        {value || "—"}
      </p>
    </TableCell>
  )
}

export function CurrentAccountCountCell({ value }: { value: number }) {
  return (
    <TableCell
      className={cn(
        workspaceTableLayoutBodyCellClass,
        currentAccountTableCountColumnClass,
      )}
    >
      <span className={workspaceTableNatureTextSecondaryClass}>
        {value.toLocaleString("es-AR")}
      </span>
    </TableCell>
  )
}

export function CurrentAccountMoneyCell({
  value,
  mutedZero = false,
}: {
  value: number
  mutedZero?: boolean
}) {
  const empty = mutedZero && Math.abs(value) <= 0.009
  return (
    <TableCell
      className={cn(
        workspaceTableLayoutBodyCellClass,
        currentAccountTableAmountColumnClass,
      )}
    >
      {empty ? (
        <span className={workspaceTableNatureTextSecondaryClass}>—</span>
      ) : (
        <DataWorkspaceTableMoney>{formatMoney(value)}</DataWorkspaceTableMoney>
      )}
    </TableCell>
  )
}

export function CurrentAccountOverdueCell({
  value,
  aging,
}: {
  value: number
  aging: CurrentAccountAgingTotals
}) {
  const overdue = value > 0.009
  const bucket = currentAccountWorstAgingBucket(aging)
  return (
    <TableCell
      className={cn(
        workspaceTableLayoutBodyCellClass,
        currentAccountTableAmountColumnClass,
      )}
    >
      {overdue ? (
        <RootsNaturePill
          variant={currentAccountAgingPillVariant(bucket)}
          title={currentAccountAgingBucketLabel(bucket)}
        >
          {formatMoney(value)}
        </RootsNaturePill>
      ) : (
        <span className={workspaceTableNatureTextSecondaryClass}>Al día</span>
      )}
    </TableCell>
  )
}

export function CurrentAccountLedgerDateCell({
  value,
  occurredAt,
}: {
  value: string
  occurredAt?: string | null
}) {
  const timeZone = usePopTimeZone()
  const time = occurredAt ? formatPopTime(occurredAt, timeZone) : ""
  return (
    <TableCell
      className={cn(
        workspaceTableLayoutBodyCellClass,
        currentAccountLedgerDateColumnClass,
      )}
    >
      <div className={workspaceTableLayoutCellStackClass}>
        <span
          className={cn(
            "whitespace-nowrap",
            workspaceTableNatureTextSecondaryClass,
          )}
        >
          {formatIsoDate(value)}
        </span>
        {time ? (
          <span
            className={cn(
              "whitespace-nowrap",
              workspaceTableLayoutCellSecondaryTextClass,
              workspaceTableNatureTextSecondaryClass,
            )}
          >
            {time}
          </span>
        ) : null}
      </div>
    </TableCell>
  )
}

export function CurrentAccountLedgerDocCell({
  label,
  description,
}: {
  label: string
  description: string
}) {
  return (
    <TableCell
      className={cn(
        workspaceTableLayoutBodyCellClass,
        currentAccountLedgerDocColumnClass,
      )}
    >
      <p className={cn("truncate font-medium", workspaceTableNatureTextPrimaryClass)}>
        {label || "—"}
      </p>
      {description && description !== label ? (
        <p className={cn("truncate", workspaceTableNatureTextSecondaryClass)}>
          {description}
        </p>
      ) : null}
    </TableCell>
  )
}

export function CurrentAccountOpenAgingCell({
  bucket,
}: {
  bucket: CurrentAccountAgingBucket
}) {
  return (
    <TableCell
      className={cn(
        workspaceTableLayoutBodyCellClass,
        currentAccountOpenAgingColumnClass,
      )}
    >
      <RootsNaturePill variant={currentAccountAgingPillVariant(bucket)}>
        {currentAccountAgingBucketLabel(bucket)}
      </RootsNaturePill>
    </TableCell>
  )
}

export function CurrentAccountLedgerMoneyCell({
  value,
}: {
  value: number
}) {
  const empty = Math.abs(value) <= 0.009
  return (
    <TableCell
      className={cn(
        workspaceTableLayoutBodyCellClass,
        currentAccountLedgerMoneyColumnClass,
      )}
    >
      {empty ? (
        <span className={workspaceTableNatureTextSecondaryClass}>—</span>
      ) : (
        <DataWorkspaceTableMoney>{formatMoney(value)}</DataWorkspaceTableMoney>
      )}
    </TableCell>
  )
}
