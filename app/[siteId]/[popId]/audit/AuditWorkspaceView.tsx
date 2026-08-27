"use client"

import "@/app/library/color/rootsyNaturePalette.css"
import { AuditEventDetailDialog } from "@/app/[siteId]/[popId]/audit/AuditEventDetailDialog"
import {
  AuditFiltersDialog,
  defaultAuditModalFilters,
  type AuditModalFilters,
} from "@/app/[siteId]/[popId]/audit/AuditFiltersDialog"
import { DataWorkspaceListActiveFiltersBar } from "@/components/data-workspace/DataWorkspaceListActiveFiltersBar"
import { DataWorkspaceListFilterChip } from "@/components/data-workspace/DataWorkspaceListFilterChip"
import {
  DataWorkspaceListFiltersDialogTrigger,
  DataWorkspaceListSearchField,
} from "@/components/data-workspace/DataWorkspaceListFilterFields"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import {
  DataWorkspaceTableListFiltersBar,
  DataWorkspaceTableListNatureShell,
  DataWorkspaceTableListPage,
  DataWorkspaceTableListShell,
  tableListInfiniteFromQuery,
} from "@/components/data-workspace/DataWorkspaceTableListLayout"
import {
  DataWorkspaceListTableFrame,
  DataWorkspaceTableEmptyMascot,
  WorkspaceTableStatusBadge,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  DATA_WORKSPACE_TABLE_SKELETON_ROW_COUNT,
  WorkspaceTableSkeletonRows,
} from "@/components/data-workspace/WorkspaceTableSkeleton"
import { auditSkeletonColumns } from "@/components/data-workspace/workspaceTableSkeletonPresets"
import {
  workspaceTableLayoutClassName,
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
import { Table, TableBody, TableCell } from "@/components/ui/table"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useAfterHydration } from "@/hooks/useIsHydrated"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import {
  computeDataWorkspaceDateBounds,
  dataWorkspaceDateFilterSummary,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import {
  AUDIT_ACTION_FILTER_LABEL,
  AUDIT_SOURCE_FILTER_LABEL,
  presentAuditEvent,
} from "@/lib/audit/auditEventPresentation"
import { hasPopAccessPermission } from "@/lib/popAccessPermissions"
import { POP_PERMS } from "@/lib/popPermissionConstants"
import { popAuditQueryKey } from "@/lib/queryKeys"
import {
  fetchPopAuditEvents,
  type AuditEventRow,
} from "@/lib/rootsyApi/auditClient"
import { DATA_WORKSPACE_TABLE_PAGE_SIZE, nextDataWorkspaceTablePage } from "@/lib/dataWorkspaceTableInfinite"
import { sessionListQueryOptions } from "@/lib/queryStaleTimes"
import { cn } from "@/lib/utils"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useParams } from "@/lib/pop-spa/navigation"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import type { DateRange } from "react-day-picker"

function sourceBadgeStatus(
  source: string,
): "activo" | "info" | "inactivo" {
  if (source === "rootsy_ai") return "activo"
  if (source === "user") return "info"
  return "inactivo"
}

function formatWhenParts(iso: string): { date: string; time: string } {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return { date: iso, time: "" }
  return {
    date: new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(date),
    time: new Intl.DateTimeFormat("es-AR", { timeStyle: "short" }).format(date),
  }
}

export function AuditWorkspaceView() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""

  const { bootstrap, loading: bootstrapLoading, error: bootstrapError, hasPermission } =
    usePopWorkspace()
  const afterHydration = useAfterHydration()
  const menuCache = usePopMenuCache(popId)

  const canRead =
    afterHydration &&
    (hasPermission(POP_PERMS.AUDIT_READ.resource, POP_PERMS.AUDIT_READ.action) ||
      (menuCache.popAccess
        ? hasPopAccessPermission(
            menuCache.popAccess,
            POP_PERMS.AUDIT_READ.resource,
            POP_PERMS.AUDIT_READ.action,
          )
        : false))

  const [datePreset, setDatePreset] =
    useState<DataWorkspaceDatePreset>("this_month")
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>()
  const [searchInput, setSearchInput] = useState("")
  const [debouncedQ, setDebouncedQ] = useState("")
  const [appliedFilters, setAppliedFilters] = useState<AuditModalFilters>(
    defaultAuditModalFilters,
  )
  const [draftFilters, setDraftFilters] = useState<AuditModalFilters>(
    defaultAuditModalFilters,
  )
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [detailEvent, setDetailEvent] = useState<AuditEventRow | null>(null)

  const dateBounds = useMemo(
    () => computeDataWorkspaceDateBounds(datePreset, customDateRange),
    [customDateRange, datePreset],
  )

  useEffect(() => {
    const next = searchInput.trim()
    const timer = window.setTimeout(() => {
      setDebouncedQ(next)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const searchInputId = useId()
  const dateFilterLabelId = useId()
  const dateFilterTriggerId = useId()
  const filtersButtonId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const query = useInfiniteQuery({
    queryKey: popAuditQueryKey(popId, {
      page: 1,
      pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
      q: debouncedQ,
      from: dateBounds.from,
      to: dateBounds.to,
      action: appliedFilters.actions.slice().sort().join(","),
      source: appliedFilters.sources.slice().sort().join(","),
    }),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === "number" ? pageParam : 1
      const res = await fetchPopAuditEvents(popId, {
        page,
        pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
        q: debouncedQ || undefined,
        from: dateBounds.from,
        to: dateBounds.to,
        action: appliedFilters.actions,
        source: appliedFilters.sources,
      })
      if (!res.success) throw new Error(res.error)
      return res
    },
    getNextPageParam: (lastPage) =>
      nextDataWorkspaceTablePage(
        lastPage.page,
        lastPage.total,
        lastPage.pageSize,
      ),
    select: (data) => {
      const first = data.pages[0]
      if (!first) return first
      return {
        ...first,
        events: data.pages.flatMap((page) => page.events),
      }
    },
    enabled: Boolean(popId && siteId && canRead),
    ...sessionListQueryOptions,
  })

  const events = query.data?.events ?? []
  const totalCount = query.data?.total ?? 0
  const accessPending = !afterHydration || (bootstrapLoading && !canRead)
  const listFetching =
    accessPending ||
    (canRead &&
      (query.isPending || (query.isFetching && !query.isFetched)))

  const tableError =
    query.error instanceof Error
      ? query.error.message
      : query.error
        ? String(query.error)
        : null
  const permissionError =
    afterHydration && !bootstrapLoading && !canRead
      ? "No tenés permiso para ver la auditoría de este local."
      : null
  const error = bootstrapError ?? permissionError ?? tableError

  const skeletonRowCount = DATA_WORKSPACE_TABLE_SKELETON_ROW_COUNT

  const dateFilterActive = datePreset !== "this_month"
  const dateFilterSummary = useMemo(
    () => dataWorkspaceDateFilterSummary(datePreset, dateBounds),
    [dateBounds, datePreset],
  )
  const hasSearchChip = searchInput.trim().length > 0
  const modalFiltersActiveCount =
    appliedFilters.actions.length + appliedFilters.sources.length
  const hasFilterChips =
    hasSearchChip || dateFilterActive || modalFiltersActiveCount > 0
  const activeFilterCount =
    (hasSearchChip ? 1 : 0) +
    (dateFilterActive ? 1 : 0) +
    modalFiltersActiveCount

  const resultsSummary = useMemo(() => {
    if (listFetching && totalCount === 0) return "…"
    if (totalCount === 0) return "Sin resultados"
    const noun = totalCount === 1 ? "movimiento" : "movimientos"
    return `${totalCount.toLocaleString("es-AR")} ${noun}`
  }, [listFetching, totalCount])

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

  const applyFilters = () => {
    setAppliedFilters(draftFilters)
    setFiltersModalOpen(false)
  }

  const clearAllFilters = () => {
    setSearchInput("")
    setDebouncedQ("")
    setDatePreset("this_month")
    setCustomDateRange(undefined)
    setAppliedFilters(defaultAuditModalFilters())
    setDraftFilters(defaultAuditModalFilters())
    searchInputRef.current?.focus()
  }

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado.</p>
      </div>
    )
  }

  return (
    <>
      <DataWorkspaceTableListPage
        layout={{
          siteId,
          popId,
          popName: bootstrap?.popName ?? menuCache.popAccess?.pop.name ?? "",
          title: "Auditoría",
          loading: bootstrapLoading,
          userName: bootstrap?.userFullName,
          userAvatarSrc: bootstrap?.userImageUrl ?? undefined,
          userRoleLabel: bootstrap?.roleLabel || undefined,
        }}
        error={error}
        errorPrefix="Auditoría"
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
                  }}
                  onCustomRangeChange={(range) => {
                    setCustomDateRange(range)
                  }}
                  bounds={dateBounds}
                  showActiveState={false}
                  labelId={dateFilterLabelId}
                  triggerId={dateFilterTriggerId}
                />
              </div>
              <div className={dataWorkspaceListFiltersPanelClass}>
                <DataWorkspaceListFiltersDialogTrigger
                  id={filtersButtonId}
                  placeholder="Acción y origen"
                  activeCount={modalFiltersActiveCount}
                  expanded={filtersModalOpen}
                  onClick={() => {
                    setDraftFilters(appliedFilters)
                    setFiltersModalOpen(true)
                  }}
                />
              </div>
              <div className={dataWorkspaceListFiltersPanelLastClass}>
                <DataWorkspaceListSearchField
                  id={searchInputId}
                  inputRef={searchInputRef}
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onClear={() => {
                    setSearchInput("")
                    setDebouncedQ("")
                    searchInputRef.current?.focus()
                  }}
                  placeholder="Qué pasó o sobre qué… ( / )"
                  resultsSummary={resultsSummary}
                  inputProps={{ "aria-label": "Buscar movimientos" }}
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
                  {dateFilterActive ? (
                    <DataWorkspaceListFilterChip
                      label={`Fecha: ${dateFilterSummary}`}
                      onRemove={() => {
                        setDatePreset("this_month")
                        setCustomDateRange(undefined)
                      }}
                      removeAriaLabel="Quitar filtro de fecha"
                    />
                  ) : null}
                  {appliedFilters.actions.map((action) => (
                    <DataWorkspaceListFilterChip
                      key={`action-${action}`}
                      label={AUDIT_ACTION_FILTER_LABEL[action] ?? action}
                      onRemove={() => {
                        setAppliedFilters((current) => ({
                          ...current,
                          actions: current.actions.filter((item) => item !== action),
                        }))
                      }}
                      removeAriaLabel={`Quitar filtro ${AUDIT_ACTION_FILTER_LABEL[action] ?? action}`}
                    />
                  ))}
                  {appliedFilters.sources.map((source) => (
                    <DataWorkspaceListFilterChip
                      key={`source-${source}`}
                      label={AUDIT_SOURCE_FILTER_LABEL[source] ?? source}
                      onRemove={() => {
                        setAppliedFilters((current) => ({
                          ...current,
                          sources: current.sources.filter((item) => item !== source),
                        }))
                      }}
                      removeAriaLabel={`Quitar filtro ${AUDIT_SOURCE_FILTER_LABEL[source] ?? source}`}
                    />
                  ))}
                  {hasSearchChip ? (
                    <DataWorkspaceListFilterChip
                      label={`Buscar: «${searchInput.trim()}»`}
                      onRemove={() => {
                        setSearchInput("")
                        setDebouncedQ("")
                      }}
                      removeAriaLabel="Quitar búsqueda"
                    />
                  ) : null}
                </DataWorkspaceListActiveFiltersBar>
              ) : null
            }
            overlay={
              canRead && !listFetching && totalCount === 0 ? (
                <DataWorkspaceTableEmptyMascot />
              ) : null
            }
            infinite={tableListInfiniteFromQuery(query, "audit")}
          >
            <DataWorkspaceListTableFrame>
              <Table
                className={cn(workspaceTableLayoutClassName, "min-w-[56rem]")}
                aria-busy={listFetching}
              >
                <WorkspaceTableHeader>
                  <WorkspaceTableHeaderRow>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn("w-32", workspaceTableLayoutHeaderHeadClass)}
                    >
                      Cuándo
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        "min-w-[9rem]",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Quién
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        "min-w-[11rem]",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Actividad
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        "min-w-[10rem]",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Registro
                    </WorkspaceTableHead>
                    <WorkspaceTableHead
                      tone="nature"
                      className={cn(
                        "min-w-[14rem]",
                        workspaceTableLayoutHeaderHeadClass,
                      )}
                    >
                      Cambio
                    </WorkspaceTableHead>
                  </WorkspaceTableHeaderRow>
                </WorkspaceTableHeader>
                <TableBody>
                  {listFetching ? (
                    <WorkspaceTableSkeletonRows
                      rowCount={skeletonRowCount}
                      rowKeyPrefix="audit-sk"
                      columns={auditSkeletonColumns()}
                      tone="nature"
                    />
                  ) : (
                    events.map((event, index) => (
                      <AuditEventRowView
                        key={event.id}
                        event={event}
                        index={index}
                        selected={detailEvent?.id === event.id}
                        onOpen={() => setDetailEvent(event)}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </DataWorkspaceListTableFrame>
          </DataWorkspaceTableListShell>
        </DataWorkspaceTableListNatureShell>
      </DataWorkspaceTableListPage>

      <AuditFiltersDialog
        open={filtersModalOpen}
        onOpenChange={setFiltersModalOpen}
        draft={draftFilters}
        onDraftChange={setDraftFilters}
        onApply={applyFilters}
      />
      <AuditEventDetailDialog
        event={detailEvent}
        open={detailEvent != null}
        onOpenChange={(open) => {
          if (!open) setDetailEvent(null)
        }}
      />
    </>
  )
}

function AuditEventRowView({
  event,
  index,
  selected,
  onOpen,
}: {
  event: AuditEventRow
  index: number
  selected: boolean
  onOpen: () => void
}) {
  const when = formatWhenParts(event.occurred_at)
  const presented = presentAuditEvent(event)
  return (
    <WorkspaceTableBodyRow
      index={index}
      selected={selected}
      noHover={false}
      role="button"
      tabIndex={0}
      aria-label={`Ver ${presented.activity} · ${presented.recordTitle}`}
      className="cursor-pointer"
      onClick={onOpen}
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
          keyboardEvent.preventDefault()
          onOpen()
        }
      }}
    >
      <TableCell className={workspaceTableLayoutBodyCellClass}>
        <div className={workspaceTableLayoutCellStackClass}>
          <span className={workspaceTableNatureTextPrimaryClass}>{when.date}</span>
          {when.time ? (
            <span className={workspaceTableNatureTextSecondaryClass}>
              {when.time}
            </span>
          ) : null}
        </div>
      </TableCell>
      <TableCell className={workspaceTableLayoutBodyCellClass}>
        <div className={workspaceTableLayoutCellStackClass}>
          <span className={workspaceTableNatureTextPrimaryClass}>
            {presented.whoLabel}
          </span>
          <span className="flex flex-wrap items-center gap-1">
            <WorkspaceTableStatusBadge
              status={sourceBadgeStatus(event.execution_source)}
            >
              {presented.sourceLabel}
            </WorkspaceTableStatusBadge>
            {presented.approvedByLabel ? (
              <span className={workspaceTableNatureTextSecondaryClass}>
                Aprobó {presented.approvedByLabel}
              </span>
            ) : null}
          </span>
        </div>
      </TableCell>
      <TableCell className={workspaceTableLayoutBodyCellClass}>
        <span className={workspaceTableNatureTextPrimaryClass}>
          {presented.activity}
        </span>
      </TableCell>
      <TableCell className={workspaceTableLayoutBodyCellClass}>
        <span className={workspaceTableNatureTextPrimaryClass}>
          {presented.recordTitle}
        </span>
      </TableCell>
      <TableCell className={workspaceTableLayoutBodyCellClass}>
        <span className={workspaceTableNatureTextSecondaryClass}>
          {presented.changeSummary}
        </span>
      </TableCell>
    </WorkspaceTableBodyRow>
  )
}
