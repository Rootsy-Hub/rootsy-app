"use client"

import {
  selectColumnInnerClass,
  workspaceTableBodyRowClassNames,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import { TableCell, TableRow } from "@/components/ui/table"
import type { ReactNode } from "react"

const sk = {
  box: "animate-pulse rounded-sm bg-muted-foreground/10 dark:bg-muted-foreground/[0.12]",
  bar: "animate-pulse rounded-sm bg-muted-foreground/10 dark:bg-muted-foreground/[0.12]",
  barSm: "animate-pulse rounded-sm bg-muted-foreground/[0.07] dark:bg-muted-foreground/[0.08]",
  pill: "animate-pulse rounded-md bg-muted-foreground/10 dark:bg-muted-foreground/[0.12]",
} as const

function SkeletonRow({
  index,
  children,
}: {
  index: number
  children: ReactNode
}) {
  return (
    <TableRow
      className={workspaceTableBodyRowClassNames(index)}
      aria-hidden
    >
      {children}
    </TableRow>
  )
}

export function OperationsSalesSkeletonRows({
  rowCount,
}: {
  rowCount: number
}) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <SkeletonRow key={`sales-sk-${i}`} index={i}>
          <TableCell className="w-12 !px-0 py-2.5">
            <div className={selectColumnInnerClass}>
              <div className={cn("mx-auto size-4 rounded-[4px]", sk.box)} />
            </div>
          </TableCell>
          <TableCell className="px-3 py-2.5">
            <div className={cn("h-3.5 w-14", sk.bar)} />
            <div className={cn("mt-1.5 h-2.5 w-10", sk.barSm)} />
          </TableCell>
          <TableCell className="px-3 py-2.5">
            <div className={cn("h-3.5 w-[72%] max-w-[9rem]", sk.bar)} />
          </TableCell>
          <TableCell className="px-2 py-2.5 text-center">
            <div className={cn("mx-auto h-8 w-14", sk.pill)} />
          </TableCell>
          <TableCell className="px-3 py-2.5">
            <div className={cn("h-3.5 w-[80%] max-w-[8rem]", sk.bar)} />
          </TableCell>
          <TableCell className="px-3 py-2.5 text-right">
            <div className={cn("ml-auto h-3.5 w-16", sk.bar)} />
          </TableCell>
          <TableCell className="px-3 py-2.5 text-right">
            <div className={cn("ml-auto h-3.5 w-12", sk.bar)} />
          </TableCell>
          <TableCell className="px-3 py-2.5 text-right">
            <div className={cn("ml-auto h-3.5 w-12", sk.bar)} />
          </TableCell>
          <TableCell className="px-3 py-2.5">
            <div className={cn("h-3.5 w-[70%] max-w-[7rem]", sk.bar)} />
          </TableCell>
          <TableCell className="px-2 py-2.5 text-center">
            <div className={cn("mx-auto h-8 w-14", sk.pill)} />
          </TableCell>
          <TableCell className="min-w-[19rem] px-3 py-2.5 pr-5">
            <div className={cn("h-3 w-[85%] max-w-[16rem]", sk.barSm)} />
          </TableCell>
        </SkeletonRow>
      ))}
    </>
  )
}

export function OperationsPurchasesSkeletonRows({
  rowCount,
}: {
  rowCount: number
}) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <SkeletonRow key={`purch-sk-${i}`} index={i}>
          <TableCell className="w-12 !px-0 py-2.5">
            <div className={selectColumnInnerClass}>
              <div className={cn("mx-auto size-4 rounded-[4px]", sk.box)} />
            </div>
          </TableCell>
          <TableCell className="px-3 py-2.5">
            <div className={cn("h-3.5 w-20", sk.bar)} />
            <div className={cn("mt-1.5 h-2.5 w-10", sk.barSm)} />
          </TableCell>
          <TableCell className="px-3 py-2.5">
            <div className={cn("h-3.5 w-[72%] max-w-[9rem]", sk.bar)} />
          </TableCell>
          <TableCell className="px-2 py-2.5 text-center">
            <div className={cn("mx-auto h-8 w-14", sk.pill)} />
          </TableCell>
          <TableCell className="px-3 py-2.5">
            <div className={cn("h-3.5 w-[70%] max-w-[7rem]", sk.bar)} />
          </TableCell>
          <TableCell className="px-3 py-2.5 text-right">
            <div className={cn("ml-auto h-3.5 w-16", sk.bar)} />
          </TableCell>
          <TableCell className="px-3 py-2.5 text-right">
            <div className={cn("ml-auto h-3.5 w-12", sk.bar)} />
          </TableCell>
          <TableCell className="px-3 py-2.5">
            <div className={cn("h-3.5 w-[70%] max-w-[7rem]", sk.bar)} />
          </TableCell>
          <TableCell className="px-2 py-2.5 text-center">
            <div className={cn("mx-auto h-8 w-14", sk.pill)} />
          </TableCell>
          <TableCell className="min-w-[19rem] px-3 py-2.5 pr-5">
            <div className={cn("h-3 w-[85%] max-w-[16rem]", sk.barSm)} />
          </TableCell>
        </SkeletonRow>
      ))}
    </>
  )
}

export function OperationsExpensesSkeletonRows({
  rowCount,
}: {
  rowCount: number
}) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <SkeletonRow key={`exp-sk-${i}`} index={i}>
          <TableCell className="w-12 !px-0 py-2.5">
            <div className={selectColumnInnerClass}>
              <div className={cn("mx-auto size-4 rounded-[4px]", sk.box)} />
            </div>
          </TableCell>
          <TableCell className="px-3 py-2.5">
            <div className={cn("h-3.5 w-20", sk.bar)} />
            <div className={cn("mt-1.5 h-2.5 w-10", sk.barSm)} />
          </TableCell>
          <TableCell className="px-3 py-2.5">
            <div className={cn("h-3.5 w-[72%] max-w-[9rem]", sk.bar)} />
          </TableCell>
          <TableCell className="px-2 py-2.5 text-center">
            <div className={cn("mx-auto h-8 w-14", sk.pill)} />
          </TableCell>
          <TableCell className="px-3 py-2.5 text-right">
            <div className={cn("ml-auto h-3.5 w-16", sk.bar)} />
          </TableCell>
          <TableCell className="px-3 py-2.5">
            <div className={cn("h-3.5 w-[70%] max-w-[7rem]", sk.bar)} />
          </TableCell>
          <TableCell className="px-2 py-2.5 text-center">
            <div className={cn("mx-auto h-8 w-14", sk.pill)} />
          </TableCell>
          <TableCell className="min-w-[19rem] px-3 py-2.5 pr-5">
            <div className={cn("h-3 w-[85%] max-w-[16rem]", sk.barSm)} />
          </TableCell>
        </SkeletonRow>
      ))}
    </>
  )
}
