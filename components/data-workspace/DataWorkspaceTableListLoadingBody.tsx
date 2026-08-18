"use client"

import "@/app/library/color/rootsyNaturePalette.css"
import { DataWorkspaceListTableFrame } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  DataWorkspaceTableListFiltersBar,
  DataWorkspaceTableListPaginationFooter,
  DataWorkspaceTableListShell,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import {
  getPopTableListSkeletonConfig,
  type PopTableListFilterLayout,
  type PopTableListSkeletonHeaderCell,
} from "@/components/data-workspace/popTableListSkeletonConfig"
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import {
  dataWorkspaceListFiltersGridClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
  workspaceTableLayoutHeaderHeadClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { workspaceTableLayoutClassName } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
  WorkspaceTableSelectHead,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { cn } from "@/lib/utils"
import { TableBody } from "@/components/ui/table"
import { useId, useMemo } from "react"

const LOADING_PAGE_SIZES = [10, 25, 50, 100] as const

const filterSkeletonLabelClass =
  "h-3 w-10 animate-pulse rounded-sm bg-rootsy-bruma-200"
const filterSkeletonFieldClass =
  "h-10 w-full animate-pulse rounded-md bg-rootsy-bruma-200"

function FilterFieldSkeleton({ labelWidth = "w-10" }: { labelWidth?: string }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5">
      <div className={cn(filterSkeletonLabelClass, labelWidth)} aria-hidden />
      <div className={filterSkeletonFieldClass} aria-hidden />
    </div>
  )
}

function TableListFiltersSkeleton({
  layout = "dual",
}: {
  layout?: PopTableListFilterLayout
}) {
  return (
    <DataWorkspaceTableListFiltersBar ariaLabel="Cargando filtros del listado">
      <div className={dataWorkspaceListFiltersGridClass}>
        {layout === "triple" ? (
          <>
            <div className={dataWorkspaceListFiltersPanelClass}>
              <FilterFieldSkeleton labelWidth="w-14" />
            </div>
            <div className={dataWorkspaceListFiltersPanelClass}>
              <FilterFieldSkeleton labelWidth="w-12" />
            </div>
          </>
        ) : (
          <div className={dataWorkspaceListFiltersPanelClass}>
            <FilterFieldSkeleton labelWidth="w-12" />
          </div>
        )}
        <div className={dataWorkspaceListFiltersPanelLastClass}>
          <FilterFieldSkeleton labelWidth="w-14" />
        </div>
      </div>
    </DataWorkspaceTableListFiltersBar>
  )
}

function TableListHeaderSkeleton({
  headers,
}: {
  headers: PopTableListSkeletonHeaderCell[]
}) {
  return (
    <WorkspaceTableHeader>
      <WorkspaceTableHeaderRow>
        {headers.map((cell, index) => {
          if (cell.type === "select") {
            return (
              <WorkspaceTableSelectHead
                key={`sk-head-${index}`}
                tone="nature"
                checked={false}
                disabled
                ariaLabel="Seleccionar filas visibles"
                className={cn(
                  workspaceTableLayoutHeaderHeadClass,
                  cell.className,
                )}
                onCheckedChange={() => {}}
              />
            )
          }

          return (
            <WorkspaceTableHead
              key={`sk-head-${index}`}
              tone="nature"
              align={cell.align}
              srOnly={cell.srOnly}
              className={cn(workspaceTableLayoutHeaderHeadClass, cell.className)}
            >
              {cell.label}
            </WorkspaceTableHead>
          )
        })}
      </WorkspaceTableHeaderRow>
    </WorkspaceTableHeader>
  )
}

export function DataWorkspaceTableListLoadingBody({
  moduleKey,
  title = "listado",
}: {
  moduleKey: string
  title?: string
}) {
  const pageSizeLabelId = useId()
  const config = useMemo(
    () => getPopTableListSkeletonConfig(moduleKey),
    [moduleKey],
  )

  return (
    <>
      <TableListFiltersSkeleton layout={config.filterLayout} />
      <DataWorkspaceTableListShell
        footer={
          <DataWorkspaceTableListPaginationFooter
            listFetching
            totalCount={0}
            rangeStart={0}
            rangeEnd={0}
            currentPage={1}
            totalPages={1}
            pageSize={LOADING_PAGE_SIZES[1]}
            pageSizeOptions={LOADING_PAGE_SIZES}
            paginationItems={[1]}
            onPageChange={() => {}}
            onPageSizeChange={() => {}}
            pageSizeLabelId={pageSizeLabelId}
            variant="tables"
          />
        }
      >
        <DataWorkspaceListTableFrame>
          <table
            className={cn(
              workspaceTableLayoutClassName,
              config.tableMinWidth ?? "min-w-[64rem]",
            )}
            aria-busy="true"
          >
            <TableListHeaderSkeleton headers={config.headers} />
            <TableBody>
              <WorkspaceTableSkeletonRows
                rowCount={config.rowCount ?? 10}
                rowKeyPrefix={`${moduleKey || "list"}-segment-sk`}
                columns={config.columns}
                tone="nature"
              />
            </TableBody>
          </table>
        </DataWorkspaceListTableFrame>
      </DataWorkspaceTableListShell>
      <span className="sr-only" role="status" aria-live="polite">
        Cargando {title}
      </span>
    </>
  )
}
