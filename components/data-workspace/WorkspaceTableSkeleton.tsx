"use client"

import {
  selectColumnInnerClass,
  workspaceTableActionsBodyCellClass,
  workspaceTableBodyCellClass,
  workspaceTableBodyRowClassNames,
  workspaceTableSelectBodyCellClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import { TableCell, TableRow } from "@/components/ui/table"

export const workspaceTableSkeletonTone = {
  bar: "animate-pulse rounded-sm bg-zinc-200/80 dark:bg-zinc-200/80",
  barSm: "animate-pulse rounded-sm bg-zinc-100 dark:bg-zinc-100",
  box: "animate-pulse rounded-sm bg-zinc-200/75 dark:bg-zinc-200/75",
  pill: "animate-pulse rounded-md bg-zinc-200/80 dark:bg-zinc-200/80",
} as const

const sk = workspaceTableSkeletonTone

export type WorkspaceTableSkeletonColumn = {
  kind:
    | "select"
    | "date"
    | "text"
    | "pill"
    | "money"
    | "moneyStack"
    | "id"
    | "thumbnail"
    | "actions"
  className?: string
  lines?: 1 | 2
  actionCount?: number
}

function SkeletonCell({
  column,
  cellKey,
}: {
  column: WorkspaceTableSkeletonColumn
  cellKey: string
}) {
  switch (column.kind) {
    case "select":
      return (
        <TableCell
          key={cellKey}
          className={cn(workspaceTableSelectBodyCellClass, column.className)}
        >
          <div className={selectColumnInnerClass}>
            <div className={cn("mx-auto size-4 rounded-[4px]", sk.box)} />
          </div>
        </TableCell>
      )
    case "date":
      return (
        <TableCell
          key={cellKey}
          className={cn(workspaceTableBodyCellClass, column.className)}
        >
          <div className={cn(sk.bar, "h-3.5 w-full")} />
          <div className={cn(sk.barSm, "mt-1.5 h-2.5 w-full")} />
        </TableCell>
      )
    case "text":
      return (
        <TableCell
          key={cellKey}
          className={cn(workspaceTableBodyCellClass, column.className)}
        >
          <div className={cn(sk.bar, "h-3.5 w-full")} />
          {column.lines === 2 ? (
            <div className={cn(sk.barSm, "mt-1.5 h-2.5 w-full")} />
          ) : null}
        </TableCell>
      )
    case "pill":
      return (
        <TableCell
          key={cellKey}
          className={cn(
            workspaceTableBodyCellClass,
            "text-center",
            column.className,
          )}
        >
          <div className={cn(sk.pill, "mx-auto h-8 w-full max-w-[3.5rem]")} />
        </TableCell>
      )
    case "money":
      return (
        <TableCell
          key={cellKey}
          className={cn(workspaceTableBodyCellClass, "text-right", column.className)}
        >
          <div className={cn(sk.bar, "ml-auto h-3.5 w-full max-w-[5.5rem]")} />
        </TableCell>
      )
    case "moneyStack":
      return (
        <TableCell
          key={cellKey}
          className={cn(workspaceTableBodyCellClass, "text-right", column.className)}
        >
          <div className="ml-auto flex w-full max-w-[6.5rem] flex-col gap-1">
            <div className={cn(sk.bar, "h-3 w-full")} />
            <div className={cn(sk.barSm, "h-2.5 w-full")} />
          </div>
        </TableCell>
      )
    case "id":
      return (
        <TableCell
          key={cellKey}
          className={cn(
            workspaceTableBodyCellClass,
            "min-w-[19rem]",
            column.className,
          )}
        >
          <div className={cn(sk.barSm, "h-3 w-full")} />
        </TableCell>
      )
    case "thumbnail":
      return (
        <TableCell
          key={cellKey}
          className={cn(workspaceTableBodyCellClass, "w-24", column.className)}
        >
          <div className={cn(sk.box, "aspect-square w-full max-w-20 rounded-lg")} />
        </TableCell>
      )
    case "actions":
      return (
        <TableCell
          key={cellKey}
          className={cn(workspaceTableActionsBodyCellClass, column.className)}
        >
          <div className="flex items-center justify-end gap-0.5">
            {Array.from({ length: column.actionCount ?? 2 }).map((_, i) => (
              <div
                key={`${cellKey}-action-${i}`}
                className={cn(sk.box, "size-8 shrink-0 rounded-md")}
              />
            ))}
          </div>
        </TableCell>
      )
    default:
      return null
  }
}

export function WorkspaceTableSkeletonRows({
  rowCount,
  columns,
  rowKeyPrefix = "ws-table-sk",
}: {
  rowCount: number
  columns: WorkspaceTableSkeletonColumn[]
  rowKeyPrefix?: string
}) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow
          key={`${rowKeyPrefix}-${rowIndex}`}
          className={workspaceTableBodyRowClassNames(rowIndex)}
          aria-hidden
        >
          {columns.map((column, columnIndex) => (
            <SkeletonCell
              key={`${rowKeyPrefix}-${rowIndex}-${columnIndex}`}
              cellKey={`${rowKeyPrefix}-${rowIndex}-${columnIndex}`}
              column={column}
            />
          ))}
        </TableRow>
      ))}
    </>
  )
}
