"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import {
  DataWorkspaceListFiltersDialogTrigger,
  DataWorkspaceListSearchField,
} from "@/components/data-workspace/DataWorkspaceListFilterFields"
import { DataWorkspaceListActiveFiltersBar } from "@/components/data-workspace/DataWorkspaceListActiveFiltersBar"
import { DataWorkspaceListBulkToolbar } from "@/components/data-workspace/DataWorkspaceListBulkToolbar"
import { DataWorkspaceListFilterChip } from "@/components/data-workspace/DataWorkspaceListFilterChip"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import {
  DataWorkspaceTableListFiltersBar,
  DataWorkspaceTableListNatureShell,
  DataWorkspaceTableListPaginationFooter,
  DataWorkspaceTableListShell,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import {
  DataWorkspaceTableIconAction,
  DataWorkspaceTableThumbnail,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  dataWorkspaceListFiltersGridClass,
  dataWorkspaceListFiltersPanelClass,
  dataWorkspaceListFiltersPanelLastClass,
  workspaceTableLayoutBodyCellClass,
  workspaceTableLayoutBodyRowClass,
  workspaceTableLayoutCellPrimaryTextClass,
  workspaceTableLayoutCellSecondaryTextClass,
  workspaceTableLayoutCellStackClass,
  workspaceTableLayoutHeaderHeadClass,
  workspaceTableLayoutImageColumnClass,
  workspaceTableLayoutSelectBodyCellClass,
  workspaceTableLayoutActionsBodyCellClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import {
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
  WorkspaceTableSelectHead,
} from "@/components/data-workspace/WorkspaceTableHeader"
import {
  lightToolbarDropdownContentClass,
  lightToolbarDropdownItemClass,
  selectColumnInnerClass,
  workspaceTableNatureBodyRowClassNames,
  workspaceTableNatureCheckboxClass,
  workspaceTableNatureLinkClass,
  workspaceTableNatureMoneyClass,
  workspaceTableNatureMoneyNegativeClass,
  workspaceTableNatureStatusBadgeClass,
  workspaceTableNatureTextPrimaryClass,
  workspaceTableNatureTextSecondaryClass,
  workspaceTableNatureTextTertiaryClass,
  toolbarBlockLabelClass,
  workspaceTableLayoutClassName,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import { layoutPreviewSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import { buildPaginationItems } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
import {
  computeDataWorkspaceDateBounds,
  dataWorkspaceDateFilterSummary,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { RootsIconButton } from "@/components/rootsy-button"
import { cn } from "@/lib/utils"
import { popScopedHref } from "@/lib/popRoutes"
import {
  LAYOUT_PREVIEW_PAGE_SIZE,
  LAYOUT_PREVIEW_PAGE_SIZE_OPTIONS,
  LAYOUT_PREVIEW_REF_TABLE_OPTIONS,
  LAYOUT_PREVIEW_TOTAL_COUNT,
  layoutPreviewRowAt,
  type LayoutPreviewListRow,
  type LayoutPreviewListStatus,
} from "./layoutPreviewListMock"
import {
  Copy,
  ExternalLink,
  MoreVertical,
  Paperclip,
  Pencil,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import type { DateRange } from "react-day-picker"
import { useEffect, useId, useMemo, useRef, useState } from "react"

const ALL_STATUSES: LayoutPreviewListStatus[] = [
  "activo",
  "pendiente",
  "vencido",
]

const STATUS_LABEL: Record<LayoutPreviewListStatus, string> = {
  activo: "Activo",
  pendiente: "Pendiente",
  vencido: "Vencido",
}

function initStatusSet() {
  return new Set<LayoutPreviewListStatus>(ALL_STATUSES)
}

function initRefTableSet() {
  return new Set<string>(LAYOUT_PREVIEW_REF_TABLE_OPTIONS)
}

function productImageSrc(seed: string) {
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundColor=f0fbf4`
}

function formatArs(n: number) {
  return n.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

function StatusBadge({ status }: { status: LayoutPreviewListStatus }) {
  const label: Record<LayoutPreviewListStatus, string> = {
    activo: "Activo",
    pendiente: "Pendiente",
    vencido: "Vencido",
  }
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        workspaceTableNatureStatusBadgeClass[status],
      )}
    >
      {label[status]}
    </Badge>
  )
}

function RowMoreMenu({ rowId }: { rowId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <RootsIconButton
          label={`Más opciones fila ${rowId}`}
          tone="action"
          intent="neutral"
          size="compact"
        >
          <MoreVertical className="size-4" />
        </RootsIconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(lightToolbarDropdownContentClass, "w-44")}
      >
        <DropdownMenuItem className={lightToolbarDropdownItemClass}>
          <Copy className="size-4" aria-hidden />
          Duplicar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function LayoutPreviewListTable({
  siteId,
  popId,
  listFetching = false,
}: {
  siteId: string
  popId: string
  listFetching?: boolean
}) {
  const searchInputId = useId()
  const filtersButtonId = useId()
  const pageSizeLabelId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [pageSize, setPageSize] = useState(LAYOUT_PREVIEW_PAGE_SIZE)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(() => new Set())

  const [searchQuery, setSearchQuery] = useState("")
  const [datePreset, setDatePreset] = useState<DataWorkspaceDatePreset>("all")
  const [customDateRange, setCustomDateRange] = useState<
    DateRange | undefined
  >(undefined)
  const [includedStatuses, setIncludedStatuses] = useState(initStatusSet)
  const [includedRefTables, setIncludedRefTables] = useState(initRefTableSet)

  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [draftStatuses, setDraftStatuses] = useState(initStatusSet)
  const [draftRefTables, setDraftRefTables] = useState(initRefTableSet)

  const dateBounds = useMemo(
    () => computeDataWorkspaceDateBounds(datePreset, customDateRange),
    [datePreset, customDateRange],
  )

  const filteredIndices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const out: number[] = []
    const df = dateBounds.from
    const dt = dateBounds.to
    for (let i = 0; i < LAYOUT_PREVIEW_TOTAL_COUNT; i++) {
      const row = layoutPreviewRowAt(i)
      if (
        q &&
        !row.title.toLowerCase().includes(q) &&
        !row.refCode.toLowerCase().includes(q)
      ) {
        continue
      }
      if (!includedStatuses.has(row.status)) continue
      if (!includedRefTables.has(row.refTable)) continue
      if (df && row.issuedAt < df) continue
      if (dt && row.issuedAt > dt) continue
      out.push(i)
    }
    return out
  }, [searchQuery, includedStatuses, includedRefTables, dateBounds])

  const filteredTotal = filteredIndices.length

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredTotal / pageSize)),
    [filteredTotal, pageSize],
  )

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  useEffect(() => {
    setPage(1)
  }, [
    searchQuery,
    includedStatuses,
    includedRefTables,
    dateBounds.from,
    dateBounds.to,
    pageSize,
  ])

  const currentPage = Math.min(Math.max(1, page), totalPages)

  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const slice = filteredIndices.slice(start, start + pageSize)
    return slice.map((i) => layoutPreviewRowAt(i))
  }, [filteredIndices, currentPage, pageSize])

  const visibleIds = useMemo(() => pageRows.map((r) => r.id), [pageRows])

  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const someVisibleSelected = visibleIds.some((id) => selected.has(id))

  const totalCountLabel = filteredTotal.toLocaleString("es-AR")

  const rangeLabel = useMemo(() => {
    if (filteredTotal === 0) return { start: 0, end: 0 }
    const start = (currentPage - 1) * pageSize + 1
    const end = Math.min(currentPage * pageSize, filteredTotal)
    return { start, end }
  }, [filteredTotal, currentPage, pageSize])

  const paginationItems = useMemo(
    () => buildPaginationItems(totalPages, currentPage),
    [totalPages, currentPage],
  )

  const skeletonRowCount = Math.min(12, Math.max(5, pageSize))

  const statusFilterNarrow =
    includedStatuses.size < ALL_STATUSES.length
  const refFilterNarrow =
    includedRefTables.size < LAYOUT_PREVIEW_REF_TABLE_OPTIONS.length

  const hasFilterChips =
    searchQuery.trim().length > 0 ||
    statusFilterNarrow ||
    refFilterNarrow ||
    datePreset !== "all"

  const dateFilterActive = datePreset !== "all"

  const modalFiltersActiveCount = useMemo(() => {
    let count = 0
    if (statusFilterNarrow) count++
    if (refFilterNarrow) count++
    return count
  }, [statusFilterNarrow, refFilterNarrow])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (searchQuery.trim()) count++
    if (dateFilterActive) count++
    count += modalFiltersActiveCount
    return count
  }, [searchQuery, dateFilterActive, modalFiltersActiveCount])

  const resultsSummary = useMemo(() => {
    if (filteredTotal === 0) return "Sin resultados"
    const noun = filteredTotal === 1 ? "resultado" : "resultados"
    if (hasFilterChips && filteredTotal !== LAYOUT_PREVIEW_TOTAL_COUNT) {
      return `${totalCountLabel} de ${LAYOUT_PREVIEW_TOTAL_COUNT.toLocaleString("es-AR")} ${noun}`
    }
    return `${totalCountLabel} ${noun}`
  }, [filteredTotal, hasFilterChips, totalCountLabel])

  const dateFilterSummary = useMemo(
    () => dataWorkspaceDateFilterSummary(datePreset, dateBounds),
    [datePreset, dateBounds],
  )

  const applyFiltersFromModal = () => {
    setIncludedStatuses(new Set(draftStatuses))
    setIncludedRefTables(new Set(draftRefTables))
    setFiltersModalOpen(false)
  }

  const resetModalDraft = () => {
    setDraftStatuses(initStatusSet())
    setDraftRefTables(initRefTableSet())
  }

  const toggleDraftStatus = (s: LayoutPreviewListStatus) => {
    setDraftStatuses((prev) => {
      const next = new Set(prev)
      if (next.has(s)) {
        if (next.size <= 1) return prev
        next.delete(s)
      } else {
        next.add(s)
      }
      return next
    })
  }

  const toggleDraftRef = (t: string) => {
    setDraftRefTables((prev) => {
      const next = new Set(prev)
      if (next.has(t)) {
        if (next.size <= 1) return prev
        next.delete(t)
      } else {
        next.add(t)
      }
      return next
    })
  }

  const removeStatusChip = (s: LayoutPreviewListStatus) => {
    setIncludedStatuses((prev) => {
      const next = new Set(prev)
      if (next.size <= 1) return prev
      next.delete(s)
      return next
    })
  }

  const removeRefChip = (t: string) => {
    setIncludedRefTables((prev) => {
      const next = new Set(prev)
      if (next.size <= 1) return prev
      next.delete(t)
      return next
    })
  }

  const clearDateFilter = () => {
    setDatePreset("all")
    setCustomDateRange(undefined)
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    clearDateFilter()
    setIncludedStatuses(initStatusSet())
    setIncludedRefTables(initRefTableSet())
    searchInputRef.current?.focus()
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target
      if (!(target instanceof HTMLElement)) return
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return
      }
      e.preventDefault()
      searchInputRef.current?.focus()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <DataWorkspaceTableListNatureShell>
        <DataWorkspaceTableListFiltersBar>
          <div className={dataWorkspaceListFiltersGridClass}>
            <div className={dataWorkspaceListFiltersPanelClass}>
              <DataWorkspacePeriodFilter
                variant="layout"
                preset={datePreset}
                customRange={customDateRange}
                onPresetChange={setDatePreset}
                onCustomRangeChange={setCustomDateRange}
                bounds={dateBounds}
              />
            </div>

            <div className={dataWorkspaceListFiltersPanelClass}>
              <DataWorkspaceListFiltersDialogTrigger
                id={filtersButtonId}
                activeCount={modalFiltersActiveCount}
                expanded={filtersModalOpen}
                onClick={() => setFiltersModalOpen(true)}
              />
            </div>

            <div className={dataWorkspaceListFiltersPanelLastClass}>
              <DataWorkspaceListSearchField
                id={searchInputId}
                inputRef={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => {
                  setSearchQuery("")
                  searchInputRef.current?.focus()
                }}
                placeholder="Título o referencia… ( / )"
                resultsSummary={resultsSummary}
              />
            </div>
          </div>
        </DataWorkspaceTableListFiltersBar>

        <DataWorkspaceTableListShell
          activeFiltersBar={
            hasFilterChips ? (
              <DataWorkspaceListActiveFiltersBar
                activeCount={activeFilterCount}
                onClearAll={clearAllFilters}
              >
                {searchQuery.trim() ? (
                  <DataWorkspaceListFilterChip
                    label={`Buscar: «${searchQuery.trim()}»`}
                    onRemove={() => setSearchQuery("")}
                    removeAriaLabel="Quitar búsqueda"
                  />
                ) : null}
                {statusFilterNarrow
                  ? ALL_STATUSES.filter((s) => includedStatuses.has(s)).map(
                      (s) => (
                        <DataWorkspaceListFilterChip
                          key={s}
                          label={STATUS_LABEL[s]}
                          onRemove={() => removeStatusChip(s)}
                          removeAriaLabel={`Quitar estado ${STATUS_LABEL[s]}`}
                        />
                      ),
                    )
                  : null}
                {refFilterNarrow
                  ? LAYOUT_PREVIEW_REF_TABLE_OPTIONS.filter((t) =>
                      includedRefTables.has(t),
                    ).map((t) => (
                      <DataWorkspaceListFilterChip
                        key={t}
                        label={t}
                        onRemove={() => removeRefChip(t)}
                        removeAriaLabel={`Quitar filtro ${t}`}
                        className="max-w-48"
                      />
                    ))
                  : null}
                {datePreset !== "all" ? (
                  <DataWorkspaceListFilterChip
                    label={`Fecha: ${dateFilterSummary}`}
                    onRemove={clearDateFilter}
                    removeAriaLabel="Quitar filtro de fecha"
                  />
                ) : null}
              </DataWorkspaceListActiveFiltersBar>
            ) : null
          }
          bulkToolbar={
            selected.size > 0 ? (
              <DataWorkspaceListBulkToolbar
                selectedCount={selected.size}
                onClear={() => setSelected(new Set())}
                placement={hasFilterChips ? "stacked" : "standalone"}
                actions={[
                  { label: "Eliminar selección", onClick: () => {} },
                  { label: "Exportar CSV", onClick: () => {} },
                ]}
              />
            ) : null
          }
          footer={
            <DataWorkspaceTableListPaginationFooter
              listFetching={listFetching}
              totalCount={filteredTotal}
              rangeStart={rangeLabel.start}
              rangeEnd={rangeLabel.end}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              pageSizeOptions={LAYOUT_PREVIEW_PAGE_SIZE_OPTIONS}
              paginationItems={paginationItems}
              onPageChange={setPage}
              onPageSizeChange={(ps) => {
                setPageSize(ps)
                setPage(1)
              }}
              pageSizeLabelId={pageSizeLabelId}
            />
          }
        >
        <table
          className={cn(workspaceTableLayoutClassName, "min-w-[56rem]")}
          aria-busy={listFetching}
        >
          <WorkspaceTableHeader>
            <WorkspaceTableHeaderRow>
              <WorkspaceTableSelectHead
                tone="nature"
                className={cn(workspaceTableLayoutHeaderHeadClass)}
                checked={
                  allVisibleSelected
                    ? true
                    : someVisibleSelected
                      ? "indeterminate"
                      : false
                }
                onCheckedChange={(c) => {
                  setSelected((prev) => {
                    const next = new Set(prev)
                    if (c === true) {
                      visibleIds.forEach((id) => next.add(id))
                    } else {
                      visibleIds.forEach((id) => next.delete(id))
                    }
                    return next
                  })
                }}
                ariaLabel="Seleccionar todas las filas visibles"
              />
              <WorkspaceTableHead
                tone="nature"
                className={cn(
                  workspaceTableLayoutImageColumnClass,
                  "px-3",
                  workspaceTableLayoutHeaderHeadClass,
                )}
                srOnly
              >
                Imagen
              </WorkspaceTableHead>
              <WorkspaceTableHead
                tone="nature"
                className={cn("min-w-48 px-3", workspaceTableLayoutHeaderHeadClass)}
              >
                Artículo
              </WorkspaceTableHead>
              <WorkspaceTableHead
                tone="nature"
                className={cn("w-44", workspaceTableLayoutHeaderHeadClass)}
              >
                Referencia
              </WorkspaceTableHead>
              <WorkspaceTableHead
                tone="nature"
                align="right"
                className={cn("w-34", workspaceTableLayoutHeaderHeadClass)}
              >
                Monto
              </WorkspaceTableHead>
              <WorkspaceTableHead
                tone="nature"
                align="center"
                className={cn("w-20", workspaceTableLayoutHeaderHeadClass)}
              >
                Adj.
              </WorkspaceTableHead>
              <WorkspaceTableHead
                tone="nature"
                className={cn("w-32", workspaceTableLayoutHeaderHeadClass)}
              >
                Estado
              </WorkspaceTableHead>
              <WorkspaceTableHead
                tone="nature"
                align="right"
                className={cn("w-[7.25rem]", workspaceTableLayoutHeaderHeadClass)}
                srOnly
              >
                Acciones
              </WorkspaceTableHead>
            </WorkspaceTableHeaderRow>
          </WorkspaceTableHeader>
          <TableBody>
            {listFetching ? (
              <WorkspaceTableSkeletonRows
                rowCount={skeletonRowCount}
                rowKeyPrefix="layout-preview-sk"
                columns={layoutPreviewSkeletonColumns()}
                tone="nature"
              />
            ) : (
              pageRows.map((row: LayoutPreviewListRow, i) => (
              <TableRow
                key={row.id}
                className={cn(
                  workspaceTableLayoutBodyRowClass,
                  workspaceTableNatureBodyRowClassNames(i, {
                    selected: selected.has(row.id),
                    noHover: true,
                  }),
                )}
              >
                <TableCell className={workspaceTableLayoutSelectBodyCellClass}>
                  <div className={selectColumnInnerClass}>
                    <Checkbox
                      className={workspaceTableNatureCheckboxClass}
                      checked={selected.has(row.id)}
                      onCheckedChange={(c) => {
                        setSelected((prev) => {
                          const next = new Set(prev)
                          if (c === true) next.add(row.id)
                          else next.delete(row.id)
                          return next
                        })
                      }}
                      aria-label={`Seleccionar ${row.title}`}
                    />
                  </div>
                </TableCell>
                <TableCell
                  className={cn(
                    workspaceTableLayoutImageColumnClass,
                    workspaceTableLayoutBodyCellClass,
                  )}
                >
                  <DataWorkspaceTableThumbnail
                    src={productImageSrc(row.imageSeed)}
                    alt={row.title}
                    size="sm"
                  />
                </TableCell>
                <TableCell className={cn("min-w-0", workspaceTableLayoutBodyCellClass)}>
                  <div className={workspaceTableLayoutCellStackClass}>
                    <p
                      className={cn(
                        workspaceTableLayoutCellPrimaryTextClass,
                        workspaceTableNatureTextPrimaryClass,
                      )}
                    >
                      {row.title}
                    </p>
                    <p
                      className={cn(
                        workspaceTableLayoutCellSecondaryTextClass,
                        row.subtitle
                          ? workspaceTableNatureTextSecondaryClass
                          : "invisible",
                      )}
                      aria-hidden={!row.subtitle}
                    >
                      {row.subtitle ?? "\u00A0"}
                    </p>
                  </div>
                </TableCell>
                <TableCell className={workspaceTableLayoutBodyCellClass}>
                  <div className={workspaceTableLayoutCellStackClass}>
                    <span
                      className={cn(
                        "truncate text-[10px] font-medium uppercase leading-4 tracking-wide",
                        workspaceTableNatureTextTertiaryClass,
                      )}
                    >
                      {row.refTable}
                    </span>
                    <Link
                      href={popScopedHref(siteId, popId, row.refHref)}
                      className={cn(
                        "group inline-flex min-w-0 items-center gap-1 truncate text-xs leading-4 underline-offset-2",
                        workspaceTableNatureLinkClass,
                      )}
                    >
                      <span className="truncate">{row.refCode}</span>
                      <ExternalLink
                        className="size-3 shrink-0 opacity-60 group-hover:opacity-100"
                        aria-hidden
                      />
                    </Link>
                  </div>
                </TableCell>
                <TableCell
                  className={cn(
                    workspaceTableLayoutBodyCellClass,
                    "text-right text-sm leading-4",
                    row.amountArs < 0
                      ? workspaceTableNatureMoneyNegativeClass
                      : workspaceTableNatureMoneyClass,
                  )}
                >
                  {formatArs(row.amountArs)}
                </TableCell>
                <TableCell
                  className={cn(
                    workspaceTableLayoutBodyCellClass,
                    "px-2 text-center",
                  )}
                >
                  {row.attachments > 0 ? (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center gap-1 text-xs",
                        workspaceTableNatureTextSecondaryClass,
                      )}
                    >
                      <Paperclip
                        className={cn(
                          "size-3.5 shrink-0 opacity-80",
                          workspaceTableNatureTextTertiaryClass,
                        )}
                        aria-hidden
                      />
                      {row.attachments}
                    </span>
                  ) : (
                    <span
                      className={cn(
                        workspaceTableNatureTextTertiaryClass,
                        "opacity-50",
                      )}
                    >
                      —
                    </span>
                  )}
                </TableCell>
                <TableCell className={workspaceTableLayoutBodyCellClass}>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className={workspaceTableLayoutActionsBodyCellClass}>
                  <div className="flex items-center justify-end gap-0.5">
                    <DataWorkspaceTableIconAction
                      label={`Editar ${row.title}`}
                      icon={Pencil}
                      variant="edit"
                      onClick={() => {}}
                    />
                    <DataWorkspaceTableIconAction
                      label={`Eliminar ${row.title}`}
                      icon={Trash2}
                      variant="destructive"
                      onClick={() => {}}
                    />
                    <RowMoreMenu rowId={row.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </table>
      </DataWorkspaceTableListShell>
      </DataWorkspaceTableListNatureShell>

      <Dialog
        open={filtersModalOpen}
        onOpenChange={(open) => {
          if (open) {
            setDraftStatuses(new Set(includedStatuses))
            setDraftRefTables(new Set(includedRefTables))
          }
          setFiltersModalOpen(open)
        }}
      >
        <DialogContent className="gap-0 sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Filtros</DialogTitle>
            <DialogDescription>
              Elegí estados y tipo de referencia. Los cambios se aplican al
              confirmar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Estado
              </Label>
              <div className="flex flex-col gap-2">
                {ALL_STATUSES.map((s) => (
                  <label
                    key={s}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-1 py-0.5 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={draftStatuses.has(s)}
                      onCheckedChange={() => toggleDraftStatus(s)}
                      aria-label={STATUS_LABEL[s]}
                    />
                    <span className="text-sm">{STATUS_LABEL[s]}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Referencia (entidad)
              </Label>
              <div className="flex flex-col gap-2">
                {LAYOUT_PREVIEW_REF_TABLE_OPTIONS.map((t) => (
                  <label
                    key={t}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-1 py-0.5 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={draftRefTables.has(t)}
                      onCheckedChange={() => toggleDraftRef(t)}
                      aria-label={t}
                    />
                    <span className="text-sm">{t}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={resetModalDraft}
            >
              Restablecer
            </Button>
            <Button type="button" onClick={applyFiltersFromModal}>
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
