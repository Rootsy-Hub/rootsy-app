"use client"

import {
  dataWorkspaceBlocksSkeletonTone,
  dataWorkspaceDetailCardClass,
  dataWorkspaceDetailCardHeaderClass,
  dataWorkspaceDetailCardStatsClass,
  dataWorkspaceDetailFlushBottomCardClass,
  dataWorkspaceDetailToolbarClass,
  workspaceTableLayoutClassName,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  workspaceTableLayoutHeaderHeadClass,
  workspaceTableLayoutListBodyScopeClass,
  workspaceTableLayoutListSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { workspaceLayoutsTablesScopeClass } from "@/components/layouts-tables/rootsLayoutsTablesProductStyles"
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import {
  currentAccountLedgerSkeletonColumns,
  currentAccountOpenSkeletonColumns,
} from "@/components/data-workspace/workspaceTableSkeletonPresets"
import {
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { Table, TableBody } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import "@/components/layouts-tables/rootsLayoutsTablesScope.css"

const sk = dataWorkspaceBlocksSkeletonTone

function CurrentAccountDetailHeaderSkeleton() {
  return (
    <article aria-hidden className={dataWorkspaceDetailCardClass}>
      <div className={dataWorkspaceDetailCardHeaderClass}>
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className={cn("size-10 shrink-0 rounded-xl", sk.box)} />
          <div className={cn("size-11 shrink-0 rounded-xl", sk.box)} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 space-y-2">
                <div className={cn("h-2.5 w-44", sk.pill)} />
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  <div className={cn("h-7 w-40 max-w-full sm:w-52", sk.bar)} />
                  <div className={cn("h-6 w-20 rounded-full", sk.pill)} />
                </div>
              </div>
              <div className={cn("hidden h-8 w-28 rounded-[12px] lg:block", sk.box)} />
            </div>
          </div>
        </div>
      </div>
      <div className={cn(dataWorkspaceDetailCardStatsClass, "sm:grid-cols-3")}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className={cn("h-2.5 w-20", sk.pill)} />
            <div className={cn("h-8 w-28", sk.bar)} />
          </div>
        ))}
      </div>
    </article>
  )
}

export function CurrentAccountDetailContentSkeleton({
  view = "open",
}: {
  view?: "open" | "ledger"
}) {
  const isOpen = view === "open"
  const columns = isOpen
    ? currentAccountOpenSkeletonColumns()
    : currentAccountLedgerSkeletonColumns()
  const headers = isOpen
    ? ["Fecha", "Comprobante", "Vence", "Restante", "Tramo"]
    : ["Fecha", "Comprobante", "Debe", "Haber", "Saldo"]

  return (
    <article aria-hidden className={dataWorkspaceDetailFlushBottomCardClass}>
      <div className={dataWorkspaceDetailToolbarClass}>
        <div className={cn("h-9 w-52 rounded-[12px]", sk.box)} />
        <div className="flex items-center gap-2">
          <div className={cn("size-9 rounded-xl", sk.box)} />
          <div className={cn("size-9 rounded-xl", sk.box)} />
        </div>
      </div>
      <div
        className={cn(
          "min-h-0 flex-1 overflow-x-auto",
          workspaceLayoutsTablesScopeClass,
          workspaceTableLayoutListSurfaceClass,
          workspaceTableLayoutListBodyScopeClass,
        )}
      >
        <Table className={cn(workspaceTableLayoutClassName, "min-w-4xl")}>
          <WorkspaceTableHeader>
            <WorkspaceTableHeaderRow>
              {headers.map((label) => (
                <WorkspaceTableHead
                  key={label}
                  tone="nature"
                  className={workspaceTableLayoutHeaderHeadClass}
                >
                  {label}
                </WorkspaceTableHead>
              ))}
            </WorkspaceTableHeaderRow>
          </WorkspaceTableHeader>
          <TableBody>
            <WorkspaceTableSkeletonRows
              rowCount={8}
              rowKeyPrefix="ca-detail-sk"
              columns={columns}
              tone="nature"
            />
          </TableBody>
        </Table>
      </div>
    </article>
  )
}

export function CurrentAccountDetailSkeleton({
  view = "open",
}: {
  view?: "open" | "ledger"
}) {
  return (
    <>
      <CurrentAccountDetailHeaderSkeleton />
      <CurrentAccountDetailContentSkeleton view={view} />
    </>
  )
}
