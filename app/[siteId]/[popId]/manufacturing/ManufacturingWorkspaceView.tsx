"use client"

import { ManufacturingDialog } from "@/app/[siteId]/[popId]/manufacturing/ManufacturingDialog"
import {
  formatInventoryMoney,
  formatInventoryQtyWithUnit,
} from "@/app/[siteId]/[popId]/inventory/inventoryFormat"
import { buildPaginationItems } from "@/components/data-workspace/buildPaginationItems"
import { DataWorkspaceListActiveFiltersBar } from "@/components/data-workspace/DataWorkspaceListActiveFiltersBar"
import { DataWorkspaceListFilterChip } from "@/components/data-workspace/DataWorkspaceListFilterChip"
import { DataWorkspaceListSearchField } from "@/components/data-workspace/DataWorkspaceListFilterFields"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import {
  DataWorkspaceTableListFiltersBar,
  DataWorkspaceTableListNatureShell,
  DataWorkspaceTableListPage,
  DataWorkspaceTableListPaginationFooter,
  DataWorkspaceTableListShell,
  dataWorkspaceTableListHeaderVariant,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import { manufacturingSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import {
  workspaceTableLayoutClassName,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  dataWorkspaceListFiltersGridClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutCellStackClass,
  workspaceTableLayoutHeaderHeadClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  WorkspaceTableBodyRow,
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { Table, TableBody, TableCell } from "@/components/ui/table"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import {
  computeDataWorkspaceDateBounds,
  dataWorkspaceDateFilterSummary,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { entryDateIsoInTimezone, formatPopDateShort } from "@/lib/popTimezone"
import { POP_PERMS } from "@/lib/popPermissionConstants"
import {
  popManufacturingQueryKey,
  popManufacturingQueryRoot,
} from "@/lib/queryKeys"
import {
  createManufacturingRun,
  fetchManufacturingWorkspace,
} from "@/lib/rootsyApi/manufacturingClient"
import { cn } from "@/lib/utils"
import { usePopTimeZone } from "@/hooks/usePopTimeZone"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import type { DateRange } from "react-day-picker"

const PAGE_SIZES = [10, 25, 50, 100] as const

export function ManufacturingWorkspaceView() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""
  const queryClient = useQueryClient()
  const tz = usePopTimeZone()
  const { bootstrap, loading: bootstrapLoading, error: bootstrapError, hasPermission } =
    usePopWorkspace()

  const [datePreset, setDatePreset] =
    useState<DataWorkspaceDatePreset>("this_month")
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>()
  const [searchInput, setSearchInput] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(25)

  const dateBounds = useMemo(
    () => computeDataWorkspaceDateBounds(datePreset, customDateRange),
    [customDateRange, datePreset],
  )

  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dialogError, setDialogError] = useState<string | null>(null)

  const searchInputId = useId()
  const dateFilterLabelId = useId()
  const dateFilterTriggerId = useId()
  const pageSizeLabelId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const canCreate = hasPermission(
    POP_PERMS.MANUFACTURING_CREATE.resource,
    POP_PERMS.MANUFACTURING_CREATE.action,
  )

  const query = useQuery({
    queryKey: popManufacturingQueryKey(popId, dateBounds.from, dateBounds.to),
    queryFn: async () => {
      const res = await fetchManufacturingWorkspace(popId, dateBounds)
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    enabled: Boolean(popId && siteId),
  })

  const runs = query.data?.runs ?? []
  const canCreateFromApi = query.data?.canCreate ?? canCreate
  const listFetching =
    query.isPending || (query.isFetching && !query.isFetched)
  const today = entryDateIsoInTimezone(tz)

  const searchTrim = searchInput.trim().toLowerCase()
  const filteredRuns = useMemo(() => {
    if (!searchTrim) return runs
    return runs.filter((run) => {
      const haystack = [
        run.outputArticleName,
        run.recipeName,
        run.producedByName,
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(searchTrim)
    })
  }, [runs, searchTrim])

  const totalCount = filteredRuns.length
  const totalPages = Math.max(1, Math.ceil(totalCount / Math.max(1, pageSize)))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const pageRows = useMemo(() => {
    const from = (currentPage - 1) * pageSize
    return filteredRuns.slice(from, from + pageSize)
  }, [currentPage, filteredRuns, pageSize])

  const rangeLabel = useMemo(() => {
    if (totalCount === 0) return { start: 0, end: 0 }
    const start = (currentPage - 1) * pageSize + 1
    const end = Math.min(currentPage * pageSize, totalCount)
    return { start, end }
  }, [currentPage, pageSize, totalCount])

  const paginationItems = useMemo(
    () => buildPaginationItems(totalPages, currentPage),
    [currentPage, totalPages],
  )
  const skeletonRowCount = Math.min(12, Math.max(5, pageSize))

  const dateFilterActive = datePreset !== "this_month"
  const dateFilterSummary = useMemo(
    () => dataWorkspaceDateFilterSummary(datePreset, dateBounds),
    [dateBounds, datePreset],
  )
  const hasSearchChip = searchInput.trim().length > 0
  const hasFilterChips = hasSearchChip || dateFilterActive
  const activeFilterCount = (hasSearchChip ? 1 : 0) + (dateFilterActive ? 1 : 0)

  const resultsSummary = useMemo(() => {
    if (listFetching && totalCount === 0) return "…"
    if (totalCount === 0) return "Sin resultados"
    const noun = totalCount === 1 ? "producción" : "producciones"
    return `${totalCount.toLocaleString("es-AR")} ${noun}`
  }, [listFetching, totalCount])

  useEffect(() => {
    if (page !== currentPage) setPage(currentPage)
  }, [currentPage, page])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return
      }
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return
      }
      event.preventDefault()
      searchInputRef.current?.focus()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const handleCreate = async (input: {
    recipeId: string
    quantity: number
    producedAt: string
    expiresAt: string | null
    outputArticleId: string | null
  }) => {
    if (!popId) return
    setSaving(true)
    setDialogError(null)
    const res = await createManufacturingRun(popId, input)
    setSaving(false)
    if (!res.success) {
      setDialogError(res.error)
      return
    }
    setDialogOpen(false)
    await queryClient.invalidateQueries({
      queryKey: popManufacturingQueryRoot(popId),
    })
  }

  const tableError =
    query.error instanceof Error
      ? query.error.message
      : query.error
        ? String(query.error)
        : null
  const error = bootstrapError ?? tableError

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">ID de POP no encontrado</p>
      </div>
    )
  }

  return (
    <>
      <DataWorkspaceTableListPage
        layout={{
          siteId,
          popId,
          popName: bootstrap?.popName ?? "",
          title: "Fabricar",
          loading: bootstrapLoading,
          userName: bootstrap?.userFullName,
          userAvatarSrc: bootstrap?.userImageUrl ?? undefined,
          userRoleLabel: bootstrap?.roleLabel || undefined,
          headerActions: canCreateFromApi ? (
            <DataWorkspaceHeaderIconButton
              label="Fabricar"
              headerVariant={dataWorkspaceTableListHeaderVariant}
              primary
              onClick={() => {
                setDialogError(null)
                setDialogOpen(true)
              }}
            >
              <Plus className="size-5" aria-hidden />
            </DataWorkspaceHeaderIconButton>
          ) : null,
        }}
        error={error}
      >
        <DataWorkspaceTableListNatureShell>
          <DataWorkspaceTableListFiltersBar>
            <div className={dataWorkspaceListFiltersGridClass}>
              <div className={dataWorkspaceListFiltersPanelClass}>
                <DataWorkspacePeriodFilter
                  variant="layout"
                  preset={datePreset}
                  customRange={customDateRange}
                  onPresetChange={(preset) => {
                    setDatePreset(preset)
                    setPage(1)
                  }}
                  onCustomRangeChange={(range) => {
                    setCustomDateRange(range)
                    setPage(1)
                  }}
                  bounds={dateBounds}
                  showActiveState={false}
                  labelId={dateFilterLabelId}
                  triggerId={dateFilterTriggerId}
                />
              </div>
              <div className={dataWorkspaceListFiltersPanelLastClass}>
                <DataWorkspaceListSearchField
                  id={searchInputId}
                  inputRef={searchInputRef}
                  value={searchInput}
                  onChange={(event) => {
                    setSearchInput(event.target.value)
                    setPage(1)
                  }}
                  onClear={() => {
                    setSearchInput("")
                    setPage(1)
                    searchInputRef.current?.focus()
                  }}
                  placeholder="Artículo, receta o quién… ( / )"
                  resultsSummary={resultsSummary}
                  inputProps={{ "aria-label": "Buscar producciones" }}
                />
              </div>
            </div>
          </DataWorkspaceTableListFiltersBar>

          <DataWorkspaceTableListShell
            activeFiltersBar={
              hasFilterChips ? (
                <DataWorkspaceListActiveFiltersBar
                  activeCount={activeFilterCount}
                  onClearAll={() => {
                    setSearchInput("")
                    setDatePreset("this_month")
                    setCustomDateRange(undefined)
                    setPage(1)
                    searchInputRef.current?.focus()
                  }}
                >
                  {dateFilterActive ? (
                    <DataWorkspaceListFilterChip
                      label={`Fecha: ${dateFilterSummary}`}
                      onRemove={() => {
                        setDatePreset("this_month")
                        setCustomDateRange(undefined)
                        setPage(1)
                      }}
                      removeAriaLabel="Quitar filtro de fecha"
                    />
                  ) : null}
                  {hasSearchChip ? (
                    <DataWorkspaceListFilterChip
                      label={`Buscar: «${searchInput.trim()}»`}
                      onRemove={() => {
                        setSearchInput("")
                        setPage(1)
                      }}
                      removeAriaLabel="Quitar búsqueda"
                    />
                  ) : null}
                </DataWorkspaceListActiveFiltersBar>
              ) : null
            }
            overlay={
              !listFetching && totalCount === 0 ? (
                <DataWorkspaceTableEmptyMascot />
              ) : null
            }
            footer={
              <DataWorkspaceTableListPaginationFooter
                listFetching={listFetching}
                totalCount={totalCount}
                rangeStart={rangeLabel.start}
                rangeEnd={rangeLabel.end}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                pageSizeOptions={[...PAGE_SIZES]}
                paginationItems={paginationItems}
                onPageChange={setPage}
                onPageSizeChange={(next) => {
                  setPageSize(next as (typeof PAGE_SIZES)[number])
                  setPage(1)
                }}
                pageSizeLabelId={pageSizeLabelId}
              />
            }
          >
            <DataWorkspaceListTableFrame>
              <Table
                className={cn(workspaceTableLayoutClassName, "min-w-[44rem]")}
                aria-busy={listFetching}
              >
                <WorkspaceTableHeader>
                  <WorkspaceTableHeaderRow>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn("w-28", workspaceTableLayoutHeaderHeadClass)}
                    >
                      Día
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        "min-w-[12rem]",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Qué
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn("w-28", workspaceTableLayoutHeaderHeadClass)}
                    >
                      Cuántas
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn("w-28", workspaceTableLayoutHeaderHeadClass)}
                    >
                      Vence
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn("w-28", workspaceTableLayoutHeaderHeadClass)}
                    >
                      Costo
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        "min-w-[8rem]",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Quién
                    </WorkspaceTableHead>
                  </WorkspaceTableHeaderRow>
                </WorkspaceTableHeader>
                <TableBody>
                  {listFetching ? (
                    <WorkspaceTableSkeletonRows
                      rowCount={skeletonRowCount}
                      rowKeyPrefix="manufacturing-sk"
                      columns={manufacturingSkeletonColumns()}
                      tone="nature"
                    />
                  ) : totalCount === 0 ? null : (
                    pageRows.map((run, index) => (
                      <WorkspaceTableBodyRow key={run.id} index={index}>
                        <TableCell className={workspaceTableLayoutBodyCellClass}>
                          <span className={workspaceTableNatureTextPrimaryClass}>
                            {formatPopDateShort(run.producedAt, tz)}
                          </span>
                        </TableCell>
                        <TableCell className={workspaceTableLayoutBodyCellClass}>
                          <div className={workspaceTableLayoutCellStackClass}>
                            <span className={workspaceTableNatureTextPrimaryClass}>
                              {run.outputArticleName || run.recipeName}
                            </span>
                            {run.outputArticleName &&
                            run.recipeName !== run.outputArticleName ? (
                              <span className={workspaceTableNatureTextSecondaryClass}>
                                {run.recipeName}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className={workspaceTableLayoutBodyCellClass}>
                          <span className={workspaceTableNatureTextPrimaryClass}>
                            {formatInventoryQtyWithUnit(
                              run.quantity,
                              run.outputUnitOfMeasure,
                            )}
                          </span>
                        </TableCell>
                        <TableCell className={workspaceTableLayoutBodyCellClass}>
                          <span className={workspaceTableNatureTextSecondaryClass}>
                            {run.expiresAt
                              ? formatPopDateShort(run.expiresAt, tz)
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell className={workspaceTableLayoutBodyCellClass}>
                          <span className={workspaceTableNatureMoneyClass}>
                            {formatInventoryMoney(run.totalCost)}
                          </span>
                        </TableCell>
                        <TableCell className={workspaceTableLayoutBodyCellClass}>
                          <span className={workspaceTableNatureTextSecondaryClass}>
                            {run.producedByName}
                          </span>
                        </TableCell>
                      </WorkspaceTableBodyRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </DataWorkspaceListTableFrame>
          </DataWorkspaceTableListShell>
        </DataWorkspaceTableListNatureShell>
      </DataWorkspaceTableListPage>

      <ManufacturingDialog
        open={dialogOpen}
        popId={popId}
        defaultDay={today}
        saving={saving}
        error={dialogError}
        onOpenChange={(open) => {
          if (saving) return
          setDialogOpen(open)
          if (!open) setDialogError(null)
        }}
        onSubmit={handleCreate}
      />
    </>
  )
}
